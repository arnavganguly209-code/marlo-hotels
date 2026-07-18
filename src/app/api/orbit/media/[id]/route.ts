import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";

const updateSchema = z.object({
  alt: z.string().max(500).optional(),
  caption: z.string().max(1000).optional().nullable(),
  folder: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

type Context = { params: Promise<{ id: string }> };

function diskPathFromUrl(url: string) {
  const root = path.resolve(
    process.env.ORBIT_UPLOAD_DIR || path.join(process.cwd(), "public", "uploads")
  );
  const resolved = path.resolve(root, url.replace(/^\/uploads\//, ""));
  if (!resolved.startsWith(root)) throw new Error("Invalid media path");
  return resolved;
}

async function authorized(request: Request) {
  return (await getOrbitSession()) && (await assertSameOrigin(request));
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid media metadata" }, { status: 400 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const asset = await db.mediaAsset.update({ where: { id }, data: parsed.data });
  await writeAuditLog({
    action: "UPDATE_MEDIA",
    module: "media-library",
    entityId: asset.id,
    summary: `Updated metadata for ${asset.originalName}`,
  });
  return NextResponse.json({ asset });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const asset = await db.mediaAsset.delete({ where: { id } });
  await unlink(diskPathFromUrl(asset.url)).catch(() => undefined);
  await writeAuditLog({
    action: "DELETE_MEDIA",
    module: "media-library",
    entityId: asset.id,
    summary: `Deleted ${asset.originalName}`,
  });
  return NextResponse.json({ ok: true });
}
