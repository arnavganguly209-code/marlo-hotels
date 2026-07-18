import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { SITE_PLACEMENTS, upsertPlacement } from "@/lib/orbit/media";

const placementSchema = z.object({
  key: z.string().min(1).max(120),
  label: z.string().min(1).max(240).optional(),
  assetId: z.string().min(1).nullable(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  alt: z.string().max(500).optional().nullable(),
  title: z.string().max(240).optional().nullable(),
  caption: z.string().max(1000).optional().nullable(),
  focalX: z.number().min(0).max(100).optional(),
  focalY: z.number().min(0).max(100).optional(),
  videoAutoplay: z.boolean().optional(),
  videoLoop: z.boolean().optional(),
  videoMuted: z.boolean().optional(),
  posterUrl: z.string().max(500).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function GET(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const key = new URL(request.url).searchParams.get("key");
  if (key) {
    const placement = await db.mediaPlacement.findUnique({
      where: { key },
      include: { asset: true },
    });
    return NextResponse.json({ placement, catalog: SITE_PLACEMENTS });
  }
  const placements = await db.mediaPlacement.findMany({
    include: { asset: true },
    orderBy: { key: "asc" },
  });
  return NextResponse.json({ placements, catalog: SITE_PLACEMENTS });
}

export async function POST(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const parsed = placementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation Error", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const catalog = SITE_PLACEMENTS.find((item) => item.key === parsed.data.key);
  const label =
    parsed.data.label || catalog?.label || parsed.data.key;

  try {
    const placement = await upsertPlacement({
      key: parsed.data.key,
      label,
      assetId: parsed.data.assetId,
      mediaType: parsed.data.mediaType,
      alt: parsed.data.alt,
      title: parsed.data.title,
      caption: parsed.data.caption,
      focalX: parsed.data.focalX,
      focalY: parsed.data.focalY,
      videoAutoplay: parsed.data.videoAutoplay,
      videoLoop: parsed.data.videoLoop,
      videoMuted: parsed.data.videoMuted,
      posterUrl: parsed.data.posterUrl,
      metadata: parsed.data.metadata as Record<string, unknown> | null,
    });

    // Keep homepage ContentEntry Hero in sync when present.
    if (parsed.data.key === "home.hero" && parsed.data.assetId) {
      const db = getDb();
      if (db && placement.asset) {
        const hero = await db.contentEntry.findFirst({
          where: {
            module: "homepage",
            data: { path: ["section"], equals: "Hero" },
          },
          orderBy: { updatedAt: "desc" },
        });
        const data = {
          section: "Hero",
          heading:
            (hero?.data as Record<string, unknown> | null)?.heading ||
            "Stay Beyond Extraordinary",
          subheading:
            (hero?.data as Record<string, unknown> | null)?.subheading || "",
          buttonText:
            (hero?.data as Record<string, unknown> | null)?.buttonText ||
            "Discover More",
          buttonLink:
            (hero?.data as Record<string, unknown> | null)?.buttonLink ||
            "/rooms",
          bookingWidget:
            (hero?.data as Record<string, unknown> | null)?.bookingWidget !==
            false,
          backgroundOverlay:
            (hero?.data as Record<string, unknown> | null)?.backgroundOverlay ||
            "Balanced",
          imageUrl: placement.asset.url,
          imageAlt: parsed.data.alt || placement.asset.alt,
          mediaAssetId: placement.asset.id,
          mediaType: parsed.data.mediaType || placement.asset.kind,
          focalX: parsed.data.focalX ?? 50,
          focalY: parsed.data.focalY ?? 50,
          videoAutoplay: parsed.data.videoAutoplay ?? true,
          videoLoop: parsed.data.videoLoop ?? true,
          videoMuted: parsed.data.videoMuted ?? true,
          posterUrl: parsed.data.posterUrl || placement.asset.posterUrl,
        };
        if (hero) {
          await db.contentEntry.update({
            where: { id: hero.id },
            data: {
              status: "PUBLISHED",
              publishedAt: new Date(),
              data: data as Prisma.InputJsonValue,
              title: hero.title || "Homepage Hero",
            },
          });
        } else {
          await db.contentEntry.create({
            data: {
              module: "homepage",
              key: "hero",
              title: "Homepage Hero",
              status: "PUBLISHED",
              publishedAt: new Date(),
              data: data as Prisma.InputJsonValue,
            },
          });
        }
      }
    }

    await writeAuditLog({
      action: "UPSERT_PLACEMENT",
      module: "media-library",
      entityId: placement.id,
      summary: `Updated placement ${parsed.data.key}`,
      metadata: { assetId: parsed.data.assetId },
    });

    revalidateTag("media");
    revalidatePath("/");
    revalidatePath("/orbit/homepage");
    revalidatePath("/orbit/media-library");

    return NextResponse.json({
      placement,
      message: "Changes Saved",
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
