import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import { assertSameOrigin } from "@/lib/orbit/auth";
import { storeOriginalUpload } from "@/lib/orbit/media-storage";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const q = new URL(request.url).searchParams.get("q")?.trim();
  const assets = await db.mediaAsset.findMany({
    where: { folder: "blog", deletedAt: null, ...(q ? { OR: [{ originalName: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] } : {}) },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return NextResponse.json({ assets: assets.map((asset) => ({ ...asset, createdAt: asset.createdAt.toISOString(), updatedAt: asset.updatedAt.toISOString() })) });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertSameOrigin(request))) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const db = getDb(); if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or GIF image." }, { status: 400 });
  try {
    const stored = await storeOriginalUpload({ buffer: Buffer.from(await file.arrayBuffer()), mimeType: file.type, originalName: file.name, folder: "blog" });
    const asset = await db.mediaAsset.create({ data: {
      filename: stored.filename, originalName: stored.originalName, url: stored.url, mimeType: stored.mimeType, kind: stored.kind,
      size: stored.size, width: stored.width, height: stored.height, folder: "blog", checksum: stored.checksum,
      alt: String(form?.get("alt") || "").slice(0, 500), currentVersion: 1,
    }});
    await db.mediaVersion.create({ data: { assetId: asset.id, version: 1, filename: stored.filename, originalName: stored.originalName, url: stored.url, mimeType: stored.mimeType, size: stored.size, width: stored.width, height: stored.height, checksum: stored.checksum, isOriginal: true } });
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
