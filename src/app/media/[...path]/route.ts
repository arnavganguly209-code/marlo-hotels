import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { diskPathFromUrl, mediaRoot } from "@/lib/orbit/media-storage";

type Context = { params: Promise<{ path: string[] }> };

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

function emptyStatus(status: number) {
  return new NextResponse(null, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/octet-stream",
    },
  });
}

/**
 * Serve Orbit media with HTTP Range support so large Hero videos can
 * start playback within ~500ms instead of waiting for a full download.
 */
export async function GET(request: Request, { params }: Context) {
  const segments = (await params).path || [];
  if (!segments.length) {
    return emptyStatus(404);
  }

  const url = `/media/${segments.map(encodeURIComponent).join("/")}`;
  let absolute: string;
  try {
    absolute = diskPathFromUrl(decodeURIComponent(url));
  } catch {
    return emptyStatus(400);
  }

  if (!absolute.startsWith(mediaRoot())) {
    return emptyStatus(403);
  }

  try {
    const info = await stat(absolute);
    if (!info.isFile()) {
      return emptyStatus(404);
    }

    const ext = path.extname(absolute).toLowerCase();
    const contentType = MIME[ext] || "application/octet-stream";
    const size = info.size;
    const cacheControl = "public, max-age=31536000, immutable";
    const rangeHeader = request.headers.get("range");

    if (rangeHeader) {
      const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
      if (!match) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      }

      let start = match[1] ? Number(match[1]) : 0;
      let end = match[2] ? Number(match[2]) : size - 1;
      if (Number.isNaN(start)) start = 0;
      if (Number.isNaN(end) || end >= size) end = size - 1;

      // Cap a single range response to 2MB so first paint stays fast.
      if (!match[2]) {
        end = Math.min(start + 2 * 1024 * 1024 - 1, size - 1);
      }

      if (start < 0 || start >= size || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      }

      const chunkSize = end - start + 1;
      const stream = createReadStream(absolute, { start, end });
      const webStream = Readable.toWeb(stream) as ReadableStream;

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": cacheControl,
        },
      });
    }

    const stream = createReadStream(absolute);
    const webStream = Readable.toWeb(stream) as ReadableStream;
    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": cacheControl,
      },
    });
  } catch {
    return emptyStatus(404);
  }
}

export async function HEAD(request: Request, context: Context) {
  const response = await GET(request, context);
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}
