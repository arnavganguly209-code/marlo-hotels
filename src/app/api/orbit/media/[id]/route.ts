import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { removeMediaFile } from "@/lib/orbit/media-storage";

const updateSchema = z.object({
  alt: z.string().max(500).optional(),
  title: z.string().max(240).optional().nullable(),
  caption: z.string().max(1000).optional().nullable(),
  seoTitle: z.string().max(240).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  folder: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  focalX: z.number().min(0).max(100).optional(),
  focalY: z.number().min(0).max(100).optional(),
  posterUrl: z.string().max(500).optional().nullable(),
  restore: z.boolean().optional(),
});

type Context = { params: Promise<{ id: string }> };

async function authorized(request: Request) {
  return (await getOrbitSession()) && (await assertSameOrigin(request));
}

function invalidate() {
  revalidateTag("media");
  revalidatePath("/");
  revalidatePath("/orbit/media-library");
}

export async function GET(_request: Request, { params }: Context) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const asset = await db.mediaAsset.findUnique({
    where: { id },
    include: {
      versions: { orderBy: { version: "desc" } },
      placements: { select: { key: true, label: true } },
      _count: { select: { placements: true } },
    },
  });
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    asset: {
      ...asset,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      deletedAt: asset.deletedAt?.toISOString() ?? null,
      usageCount: asset._count.placements,
      usedOn: asset.placements.map((item) => item.label || item.key),
      versions: asset.versions.map((version) => ({
        ...version,
        createdAt: version.createdAt.toISOString(),
      })),
    },
  });
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation Error", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;

  if (parsed.data.restore) {
    const asset = await db.mediaAsset.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        _count: { select: { placements: true } },
        placements: { select: { key: true, label: true } },
      },
    });
    await writeAuditLog({
      action: "RESTORE_MEDIA",
      module: "media-library",
      entityId: asset.id,
      summary: `Restored ${asset.originalName}`,
    });
    invalidate();
    return NextResponse.json({
      asset: {
        ...asset,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
        deletedAt: null,
        usageCount: asset._count.placements,
        usedOn: asset.placements.map((item) => item.label || item.key),
      },
      message: "Restored Successfully",
    });
  }

  const data = {
    alt: parsed.data.alt,
    title: parsed.data.title,
    caption: parsed.data.caption,
    seoTitle: parsed.data.seoTitle,
    seoDescription: parsed.data.seoDescription,
    folder: parsed.data.folder,
    focalX: parsed.data.focalX,
    focalY: parsed.data.focalY,
    posterUrl: parsed.data.posterUrl,
  };
  const asset = await db.mediaAsset.update({
    where: { id },
    data,
    include: {
      _count: { select: { placements: true } },
      placements: { select: { key: true, label: true } },
    },
  });
  await writeAuditLog({
    action: "UPDATE_MEDIA",
    module: "media-library",
    entityId: asset.id,
    summary: `Updated metadata for ${asset.originalName}`,
  });
  invalidate();
  return NextResponse.json({
    asset: {
      ...asset,
      createdAt: asset.createdAt.toISOString(),
      updatedAt: asset.updatedAt.toISOString(),
      deletedAt: asset.deletedAt?.toISOString() ?? null,
      usageCount: asset._count.placements,
      usedOn: asset.placements.map((item) => item.label || item.key),
    },
    message: "Changes Saved",
  });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const hard = new URL(request.url).searchParams.get("hard") === "1";
  const existing = await db.mediaAsset.findUnique({
    where: { id },
    include: { _count: { select: { placements: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (hard) {
    // Clear placements so deleted media can never reappear via overlays.
    await db.mediaPlacement.updateMany({
      where: { assetId: id },
      data: { assetId: null },
    });
    await db.mediaAsset.delete({ where: { id } });
    await removeMediaFile(existing.url);
    await writeAuditLog({
      action: "DELETE_MEDIA_HARD",
      module: "media-library",
      entityId: id,
      summary: `Permanently deleted ${existing.originalName}`,
    });
    invalidate();
    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/orbit/homepage");
    return NextResponse.json({ ok: true, message: "Deleted Successfully" });
  }

  // Soft-delete: detach placements immediately so public/CMS never show it.
  await db.mediaPlacement.updateMany({
    where: { assetId: id },
    data: { assetId: null },
  });
  await db.mediaAsset.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  await writeAuditLog({
    action: "DELETE_MEDIA",
    module: "media-library",
    entityId: id,
    summary: `Moved ${existing.originalName} to trash`,
  });
  invalidate();
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/orbit/homepage");
  return NextResponse.json({ ok: true, message: "Deleted Successfully" });
}
