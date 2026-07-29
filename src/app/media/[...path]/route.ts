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
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const VIDEO_EXTS = new Set([".mp4", ".webm", ".mov"]);

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
 * Serve Orbit media with proper HTTP Range support.
 * Honor browser range requests fully — artificial small caps cause
 * stuttering on hero videos because the player must re-request every chunk.
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
    const isVideo = VIDEO_EXTS.has(ext);
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

    // Without a Range header, still advertise Accept-Ranges so browsers
    // can seek/stream. Prefer streaming the body for large videos.
    const stream = createReadStream(absolute);
    const webStream = Readable.toWeb(stream) as ReadableStream;
    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(size),
        "Accept-Ranges": "bytes",
        "Cache-Control": cacheControl,
        ...(isVideo
          ? { "Content-Disposition": 'inline; filename="media"' }
          : {}),
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
