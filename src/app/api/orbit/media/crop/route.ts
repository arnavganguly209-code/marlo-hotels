import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { storeCroppedDerivative } from "@/lib/orbit/media-storage";

const cropSchema = z.object({
  assetId: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotate: z.number().optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
  replace: z.boolean().optional(),
  alt: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const parsed = cropSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation Error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const source = await db.mediaAsset.findUnique({
    where: { id: parsed.data.assetId },
  });
  if (!source || source.kind !== "IMAGE") {
    return NextResponse.json(
      { error: "Source image not found." },
      { status: 404 }
    );
  }

  try {
    const stored = await storeCroppedDerivative({
      sourceUrl: source.url,
      originalName: source.originalName,
      folder: source.folder,
      crop: {
        x: parsed.data.x,
        y: parsed.data.y,
        width: parsed.data.width,
        height: parsed.data.height,
        rotate: parsed.data.rotate,
        flipX: parsed.data.flipX,
        flipY: parsed.data.flipY,
      },
    });

    const cropJson = {
      x: parsed.data.x,
      y: parsed.data.y,
      width: parsed.data.width,
      height: parsed.data.height,
      rotate: parsed.data.rotate || 0,
      flipX: !!parsed.data.flipX,
      flipY: !!parsed.data.flipY,
    };

    let asset;
    if (parsed.data.replace) {
      const nextVersion = source.currentVersion + 1;
      asset = await db.$transaction(async (tx) => {
        await tx.mediaVersion.create({
          data: {
            assetId: source.id,
            version: nextVersion,
            filename: stored.filename,
            originalName: stored.originalName,
            url: stored.url,
            mimeType: stored.mimeType,
            size: stored.size,
            width: stored.width,
            height: stored.height,
            checksum: stored.checksum,
            isOriginal: false,
            cropJson,
          },
        });
        return tx.mediaAsset.update({
          where: { id: source.id },
          data: {
            filename: stored.filename,
            url: stored.url,
            mimeType: stored.mimeType,
            size: stored.size,
            width: stored.width,
            height: stored.height,
            checksum: stored.checksum,
            cropJson,
            currentVersion: nextVersion,
            alt: parsed.data.alt || source.alt,
          },
          include: {
            _count: { select: { placements: true } },
            placements: { select: { key: true, label: true } },
          },
        });
      });
    } else {
      asset = await db.$transaction(async (tx) => {
        const created = await tx.mediaAsset.create({
          data: {
            filename: stored.filename,
            originalName: stored.originalName,
            url: stored.url,
            mimeType: stored.mimeType,
            kind: "IMAGE",
            size: stored.size,
            width: stored.width,
            height: stored.height,
            alt: parsed.data.alt || source.alt,
            title: source.title,
            caption: source.caption,
            folder: source.folder,
            checksum: stored.checksum,
            cropJson,
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
            checksum: stored.checksum,
            isOriginal: false,
            cropJson,
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
    }

    await writeAuditLog({
      action: "CROP_MEDIA",
      module: "media-library",
      entityId: asset.id,
      summary: `Cropped derivative of ${source.originalName}`,
    });
    revalidateTag("media");
    revalidatePath("/");
    return NextResponse.json({
      asset: {
        ...asset,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
        deletedAt: asset.deletedAt?.toISOString() ?? null,
        usageCount: asset._count.placements,
        usedOn: asset.placements.map((item) => item.label || item.key),
      },
      message: "Image Saved",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Server Error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
