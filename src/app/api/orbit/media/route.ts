import { createHash, randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp, { type Sharp } from "sharp";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function safeFolder(value: FormDataEntryValue | null) {
  const folder = String(value || "general")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return folder || "general";
}

function uploadRoot() {
  return path.resolve(
    process.env.ORBIT_UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")
  );
}

function diskPathFromUrl(url: string) {
  const relative = url.replace(/^\/uploads\//, "");
  const resolved = path.resolve(uploadRoot(), relative);
  if (!resolved.startsWith(uploadRoot())) throw new Error("Invalid media path");
  return resolved;
}

export async function GET(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const params = new URL(request.url).searchParams;
  const query = params.get("query")?.trim();
  const folder = params.get("folder")?.trim();
  const assets = await db.mediaAsset.findMany({
    where: {
      ...(folder && folder !== "all" ? { folder } : {}),
      ...(query
        ? {
            OR: [
              { originalName: { contains: query, mode: "insensitive" } },
              { alt: { contains: query, mode: "insensitive" } },
              { caption: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 250,
  });
  const folders = await db.mediaAsset.findMany({
    distinct: ["folder"],
    select: { folder: true },
    orderBy: { folder: "asc" },
  });
  return NextResponse.json({
    assets,
    folders: folders.map((item) => item.folder),
  });
}

export async function POST(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "Use JPG, PNG, WebP or AVIF images up to 15 MB." },
      { status: 400 }
    );
  }

  const input = Buffer.from(await file.arrayBuffer());
  let image: Sharp;
  try {
    image = sharp(input, { failOn: "error", limitInputPixels: 60_000_000 });
    await image.metadata();
  } catch {
    return NextResponse.json({ error: "The image file is invalid." }, { status: 400 });
  }

  const folder = safeFolder(form.get("folder"));
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.webp`;
  const destinationDir = path.join(uploadRoot(), folder);
  const destination = path.join(destinationDir, filename);
  await mkdir(destinationDir, { recursive: true });

  const crop = String(form.get("crop") || "original");
  const cropSizes: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1600, height: 1600 },
    "4:3": { width: 2000, height: 1500 },
    "16:9": { width: 2400, height: 1350 },
  };
  const processor = image.rotate();
  const optimized = await (cropSizes[crop]
    ? processor.resize({ ...cropSizes[crop], fit: "cover", position: "centre" })
    : processor.resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      }))
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
  const metadata = await sharp(optimized).metadata();
  await writeFile(destination, optimized, { flag: "wx" });

  const url = `/uploads/${folder}/${filename}`;
  const data = {
    filename,
    originalName: file.name.slice(0, 240),
    url,
    mimeType: "image/webp",
    size: optimized.byteLength,
    width: metadata.width,
    height: metadata.height,
    alt: String(form.get("alt") || "").slice(0, 500),
    caption: String(form.get("caption") || "").slice(0, 1000) || null,
    folder,
    checksum: createHash("sha256").update(optimized).digest("hex"),
  };

  const replaceId = String(form.get("replaceId") || "");
  let asset;
  if (replaceId) {
    const existing = await db.mediaAsset.findUnique({ where: { id: replaceId } });
    if (!existing) {
      await unlink(destination).catch(() => undefined);
      return NextResponse.json({ error: "Asset to replace was not found." }, { status: 404 });
    }
    asset = await db.mediaAsset.update({ where: { id: replaceId }, data });
    await unlink(diskPathFromUrl(existing.url)).catch(() => undefined);
  } else {
    asset = await db.mediaAsset.create({ data });
  }

  await writeAuditLog({
    action: replaceId ? "REPLACE_MEDIA" : "UPLOAD_MEDIA",
    module: "media-library",
    entityId: asset.id,
    summary: `${replaceId ? "Replaced" : "Uploaded"} ${file.name}`,
    metadata: { size: optimized.byteLength, width: metadata.width, height: metadata.height },
  });
  return NextResponse.json({ asset }, { status: replaceId ? 200 : 201 });
}
