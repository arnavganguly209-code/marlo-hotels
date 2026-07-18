import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
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
};

export async function GET(_request: Request, { params }: Context) {
  const segments = (await params).path || [];
  if (!segments.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = `/media/${segments.map(encodeURIComponent).join("/")}`;
  let absolute: string;
  try {
    absolute = diskPathFromUrl(decodeURIComponent(url));
  } catch {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  if (!absolute.startsWith(mediaRoot())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const info = await stat(absolute);
    if (!info.isFile()) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const ext = path.extname(absolute).toLowerCase();
    const stream = createReadStream(absolute);
    const webStream = Readable.toWeb(stream) as ReadableStream;
    return new NextResponse(webStream, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
