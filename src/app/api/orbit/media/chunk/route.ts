import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import {
  ensureMediaRoot,
  kindForMime,
  maxVideoBytes,
  mediaRoot,
  storeOriginalUpload,
  VIDEO_MIME_TYPES,
} from "@/lib/orbit/media-storage";

export const runtime = "nodejs";

function chunkRoot() {
  return path.join(mediaRoot(), ".chunks");
}

async function authorized(request: Request) {
  return (await getOrbitSession()) && (await assertSameOrigin(request));
}

type Manifest = {
  uploadId: string;
  originalName: string;
  mimeType: string;
  totalSize: number;
  received: number;
  folder: string;
  alt: string;
};

async function readManifest(uploadId: string): Promise<Manifest | null> {
  try {
    const raw = await readFile(
      path.join(chunkRoot(), uploadId, "manifest.json"),
      "utf8"
    );
    return JSON.parse(raw) as Manifest;
  } catch {
    return null;
  }
}

async function writeManifest(manifest: Manifest) {
  const dir = path.join(chunkRoot(), manifest.uploadId);
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "manifest.json"),
    JSON.stringify(manifest),
    "utf8"
  );
}

export async function POST(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  await ensureMediaRoot();
  await mkdir(chunkRoot(), { recursive: true });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Network Error", code: "NETWORK_ERROR" },
      { status: 400 }
    );
  }

  const phase = String(form.get("phase") || "");

  if (phase === "init") {
    const originalName = String(form.get("originalName") || "video.mp4").slice(
      0,
      240
    );
    const mimeType = String(form.get("mimeType") || "video/mp4");
    const totalSize = Number(form.get("totalSize") || 0);
    const folder = String(form.get("folder") || "video");
    const alt = String(form.get("alt") || "").slice(0, 500);

    if (!VIDEO_MIME_TYPES.has(mimeType) || kindForMime(mimeType) !== "VIDEO") {
      return NextResponse.json(
        {
          error: "Unsupported File. Use MP4 or WebM for chunked video upload.",
          code: "UNSUPPORTED_FILE",
        },
        { status: 400 }
      );
    }
    const max = maxVideoBytes();
    if (!Number.isFinite(totalSize) || totalSize <= 0 || totalSize > max) {
      return NextResponse.json(
        {
          error: `Maximum Size Exceeded (${Math.round(max / 1024 / 1024)} MB).`,
          code: "MAX_SIZE",
        },
        { status: 400 }
      );
    }

    const uploadId = randomUUID();
    const manifest: Manifest = {
      uploadId,
      originalName,
      mimeType,
      totalSize,
      received: 0,
      folder,
      alt,
    };
    await writeManifest(manifest);
    await writeFile(path.join(chunkRoot(), uploadId, "data.bin"), Buffer.alloc(0));
    return NextResponse.json({ uploadId, maxBytes: max });
  }

  if (phase === "append") {
    const uploadId = String(form.get("uploadId") || "");
    const chunk = form.get("chunk");
    if (!uploadId || !(chunk instanceof File)) {
      return NextResponse.json(
        { error: "Validation Error", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    const manifest = await readManifest(uploadId);
    if (!manifest) {
      return NextResponse.json({ error: "Upload session not found" }, { status: 404 });
    }
    const dest = path.join(chunkRoot(), uploadId, "data.bin");
    const buffer = Buffer.from(await chunk.arrayBuffer());
    if (manifest.received + buffer.byteLength > manifest.totalSize) {
      return NextResponse.json(
        { error: "Chunk exceeds declared total size", code: "MAX_SIZE" },
        { status: 400 }
      );
    }
    const stream = createWriteStream(dest, { flags: "a" });
    await pipeline(Readable.from(buffer), stream);
    manifest.received += buffer.byteLength;
    await writeManifest(manifest);
    return NextResponse.json({
      uploadId,
      received: manifest.received,
      totalSize: manifest.totalSize,
      progress: Math.round((manifest.received / manifest.totalSize) * 100),
    });
  }

  if (phase === "complete") {
    const uploadId = String(form.get("uploadId") || "");
    const manifest = await readManifest(uploadId);
    if (!manifest) {
      return NextResponse.json({ error: "Upload session not found" }, { status: 404 });
    }
    if (manifest.received !== manifest.totalSize) {
      return NextResponse.json(
        {
          error: `Incomplete upload (${manifest.received}/${manifest.totalSize} bytes).`,
          code: "INCOMPLETE",
        },
        { status: 400 }
      );
    }
    const dataPath = path.join(chunkRoot(), uploadId, "data.bin");
    const fileStat = await stat(dataPath);
    if (fileStat.size !== manifest.totalSize) {
      return NextResponse.json(
        { error: "File size mismatch after assemble", code: "INCOMPLETE" },
        { status: 400 }
      );
    }
    const buffer = await readFile(dataPath);
    let stored;
    try {
      stored = await storeOriginalUpload({
        buffer,
        mimeType: manifest.mimeType,
        originalName: manifest.originalName,
        folder: manifest.folder,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Upload Failed",
          code: "SERVER_ERROR",
        },
        { status: 400 }
      );
    }

    const asset = await db.$transaction(async (tx) => {
      const created = await tx.mediaAsset.create({
        data: {
          filename: stored.filename,
          originalName: stored.originalName,
          url: stored.url,
          mimeType: stored.mimeType,
          kind: stored.kind,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          durationMs: stored.durationMs,
          alt: manifest.alt,
          folder: stored.url.split("/")[2] || "video",
          checksum: stored.checksum,
          currentVersion: 1,
        },
      });
      await tx.mediaVersion.create({
        data: {
          assetId: created.id,
          version: 1,
          filename: stored.filename,
          originalName: stored.originalName,
          url: stored.url,
          mimeType: stored.mimeType,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          durationMs: stored.durationMs,
          checksum: stored.checksum,
          isOriginal: true,
        },
      });
      return tx.mediaAsset.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          _count: { select: { placements: true } },
          placements: { select: { key: true, label: true } },
        },
      });
    });

    await writeAuditLog({
      action: "UPLOAD_MEDIA_CHUNKED",
      module: "media-library",
      entityId: asset.id,
      summary: `Chunk-uploaded ${asset.originalName}`,
    });
    await rm(path.join(chunkRoot(), uploadId), { recursive: true, force: true });
    revalidateTag("media");
    revalidatePath("/orbit/media-library");

    return NextResponse.json({
      asset: {
        ...asset,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
        deletedAt: asset.deletedAt?.toISOString() ?? null,
        usageCount: asset._count.placements,
        usedOn: asset.placements.map((item) => item.label || item.key),
      },
      message: "Upload Successful",
    });
  }

  if (phase === "cancel") {
    const uploadId = String(form.get("uploadId") || "");
    if (uploadId) {
      await rm(path.join(chunkRoot(), uploadId), { recursive: true, force: true });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Unknown phase. Use init, append, complete, or cancel." },
    { status: 400 }
  );
}
