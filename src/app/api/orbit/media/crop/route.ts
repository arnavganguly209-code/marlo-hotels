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
import {
  persistNewMediaAsset,
  persistReplacedMediaAsset,
} from "@/lib/orbit/media-asset-persist";

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
      asset = await persistReplacedMediaAsset(db, source.id, stored, {
        alt: parsed.data.alt || source.alt,
      });
      asset = await db.mediaAsset.update({
        where: { id: asset.id },
        data: { cropJson },
        include: {
          _count: { select: { placements: true } },
          placements: { select: { key: true, label: true } },
        },
      });
      await db.mediaVersion.updateMany({
        where: { assetId: asset.id, url: stored.url },
        data: { cropJson, isOriginal: false },
      });
    } else {
      const result = await persistNewMediaAsset(db, stored, {
        alt: parsed.data.alt || source.alt,
        title: source.title,
        caption: source.caption,
      });
      asset = await db.mediaAsset.update({
        where: { id: result.asset.id },
        data: { cropJson },
        include: {
          _count: { select: { placements: true } },
          placements: { select: { key: true, label: true } },
        },
      });
      await db.mediaVersion.updateMany({
        where: { assetId: asset.id, url: stored.url },
        data: { cropJson, isOriginal: false },
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
