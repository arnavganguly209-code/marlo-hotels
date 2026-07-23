import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  getHomepageContent,
  mergeHomepageContent,
  type EditableImage,
  type HomepageContent,
} from "@/lib/homepage-content";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";

const payloadSchema = z.object({
  content: z.record(z.string(), z.unknown()),
});

function isEditableImage(value: unknown): value is EditableImage {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof (value as EditableImage).src === "string" &&
      typeof (value as EditableImage).alt === "string"
  );
}

function collectImages(
  value: unknown,
  path: string[] = []
): { path: string; image: EditableImage }[] {
  if (isEditableImage(value)) {
    return [{ path: path.join("."), image: value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectImages(item, [...path, String(index)])
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      collectImages(item, [...path, key])
    );
  }
  return [];
}

function placementKeyForPath(path: string) {
  return path === "hero.image"
    ? "home.hero"
    : path === "about.images.0"
      ? "home.about.primary"
      : path === "about.images.1"
        ? "home.about.secondary"
        : path === "wellness.images.0"
          ? "home.wellness.primary"
          : path === "wellness.images.1"
            ? "home.wellness.secondary"
            : path === "pool.image"
              ? "home.pool"
              : path === "events.items.0.image"
                ? "home.events.primary"
                : path === "events.items.1.image"
                  ? "home.events.secondary"
                  : path === "hero.logo"
                    ? "brand.logo"
                    : path === "footer.logo"
                      ? "brand.footerLogo"
                      : `home.${path}`;
}

function validateHomepage(content: HomepageContent) {
  for (const [key, rawSection] of Object.entries(content)) {
    const section = rawSection as unknown as Record<string, unknown>;
    if (section.enabled === false) continue;
    if (
      "heading" in section &&
      (typeof section.heading !== "string" || !section.heading.trim())
    ) {
      return `${key}: heading is required`;
    }
    if (
      key === "hero" &&
      section.mediaType === "VIDEO" &&
      (typeof section.videoUrl !== "string" || !section.videoUrl.trim())
    ) {
      return "hero: select a video or switch Hero Media to IMAGE";
    }
    if (key === "hero") {
      const hero = section as unknown as HomepageContent["hero"];
      if (
        [hero.logoDesktopWidth, hero.logoTabletWidth, hero.logoMobileWidth].some(
          (value) => value < 40 || value > 600
        ) ||
        hero.logoOpacity < 0 ||
        hero.logoOpacity > 100 ||
        [hero.logoLeftMargin, hero.logoTopMargin].some(
          (value) => value < -500 || value > 500
        )
      ) {
        return "hero: logo size, margin or opacity is outside the allowed range";
      }
    }
    if (
      (key === "about" || key === "wellness") &&
      (!Array.isArray(section.images) || section.images.length < 2)
    ) {
      return `${key}: two images are required`;
    }
    if (
      [
        "rooms",
        "featuredSuites",
        "dining",
        "events",
        "experiences",
        "attractions",
        "journal",
      ].includes(key) &&
      Array.isArray(section.items)
    ) {
      for (const rawItem of section.items) {
        const item = rawItem as Record<string, unknown>;
        const firstImage =
          Array.isArray(item.images) && isEditableImage(item.images[0])
            ? item.images[0]
            : isEditableImage(item.image)
              ? item.image
              : null;
        if (!firstImage?.src.trim() || !firstImage.alt.trim()) {
          return `${key}: every card requires an image and alt text`;
        }
        if (
          key === "journal" &&
          (typeof item.date !== "string" || Number.isNaN(Date.parse(item.date)))
        ) {
          return "journal: every article requires a valid date";
        }
      }
    }
    if (
      key === "testimonials" &&
      Array.isArray(section.items) &&
      section.items.some((rawItem) => {
        const rating = (rawItem as Record<string, unknown>).rating;
        return typeof rating !== "number" || rating < 1 || rating > 5;
      })
    ) {
      return "testimonials: ratings must be between 1 and 5";
    }
    const invalidImage = collectImages(section).find(
      (item) => !item.image.src.trim() || !item.image.alt.trim()
    );
    if (invalidImage) {
      return `${key}: images require a source and alt text`;
    }
  }
  return null;
}

export async function GET() {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ content: await getHomepageContent() });
}

export async function PUT(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
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

  try {
    const homepage = mergeHomepageContent(
      await getHomepageContent(),
      parsed.data.content
    );
    const validationError = validateHomepage(homepage);
    if (validationError) {
      return NextResponse.json(
        { error: `Validation Error: ${validationError}` },
        { status: 400 }
      );
    }
    const images = collectImages(homepage);
    const requestedAssetIds = new Set(
      [
        ...images.map((item) => item.image.assetId),
        homepage.hero.videoAssetId,
      ].filter((id): id is string => Boolean(id))
    );
    const existingAssets = requestedAssetIds.size
      ? await db.mediaAsset.findMany({
          where: { id: { in: [...requestedAssetIds] } },
          select: { id: true },
        })
      : [];
    const validAssetIds = new Set(existingAssets.map((asset) => asset.id));
    for (const item of images) {
      if (item.image.assetId && !validAssetIds.has(item.image.assetId)) {
        item.image.assetId = null;
      }
    }
    if (
      homepage.hero.videoAssetId &&
      !validAssetIds.has(homepage.hero.videoAssetId)
    ) {
      homepage.hero.videoAssetId = null;
    }
    const content = homepage as unknown as Prisma.InputJsonValue;
    const now = new Date();

    const entry = await db.$transaction(async (tx) => {
      const saved = await tx.contentEntry.upsert({
        where: {
          module_key: { module: "homepage", key: "visual-editor" },
        },
        create: {
          module: "homepage",
          key: "visual-editor",
          title: "Homepage Visual Editor",
          status: "PUBLISHED",
          publishedAt: now,
          data: content,
        },
        update: {
          title: "Homepage Visual Editor",
          status: "PUBLISHED",
          publishedAt: now,
          data: content,
        },
      });

      const desiredHomeKeys = images
        .map((item) => placementKeyForPath(item.path))
        .filter((key) => key.startsWith("home."));
      await tx.mediaPlacement.deleteMany({
        where: {
          key: {
            startsWith: "home.",
            notIn: desiredHomeKeys,
          },
        },
      });

      for (const item of images) {
        const key = placementKeyForPath(item.path);
        await tx.mediaPlacement.upsert({
          where: { key },
          create: {
            key,
            label: item.image.title || item.path,
            assetId:
              item.image.assetId && validAssetIds.has(item.image.assetId)
                ? item.image.assetId
                : null,
            mediaType: "IMAGE",
            alt: item.image.alt,
            title: item.image.title,
            focalX: item.image.focalX ?? 50,
            focalY: item.image.focalY ?? 50,
          },
          update: {
            label: item.image.title || item.path,
            assetId:
              item.image.assetId && validAssetIds.has(item.image.assetId)
                ? item.image.assetId
                : null,
            mediaType: "IMAGE",
            alt: item.image.alt,
            title: item.image.title,
            focalX: item.image.focalX ?? 50,
            focalY: item.image.focalY ?? 50,
          },
        });
      }
      if (homepage.hero.mediaType === "VIDEO") {
        await tx.mediaPlacement.upsert({
          where: { key: "home.hero" },
          create: {
            key: "home.hero",
            label: "Homepage Hero",
            assetId:
              homepage.hero.videoAssetId &&
              validAssetIds.has(homepage.hero.videoAssetId)
                ? homepage.hero.videoAssetId
                : null,
            mediaType: "VIDEO",
            alt: homepage.hero.image.alt,
            focalX: homepage.hero.image.focalX ?? 50,
            focalY: homepage.hero.image.focalY ?? 50,
            videoAutoplay: homepage.hero.videoAutoplay,
            videoLoop: homepage.hero.videoLoop,
            videoMuted: homepage.hero.videoMuted,
            posterUrl: homepage.hero.poster?.src || null,
          },
          update: {
            assetId:
              homepage.hero.videoAssetId &&
              validAssetIds.has(homepage.hero.videoAssetId)
                ? homepage.hero.videoAssetId
                : null,
            mediaType: "VIDEO",
            alt: homepage.hero.image.alt,
            focalX: homepage.hero.image.focalX ?? 50,
            focalY: homepage.hero.image.focalY ?? 50,
            videoAutoplay: homepage.hero.videoAutoplay,
            videoLoop: homepage.hero.videoLoop,
            videoMuted: homepage.hero.videoMuted,
            posterUrl: homepage.hero.poster?.src || null,
          },
        });
      }
      return saved;
    });

    await writeAuditLog({
      action: "UPDATE_HOMEPAGE",
      module: "homepage",
      entityId: entry.id,
      summary: "Saved homepage visual editor content",
    });

    revalidateTag("media");
    revalidateTag("homepage");
    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/orbit/homepage");

    return NextResponse.json({
      content: await getHomepageContent(),
      message: "Saved Successfully · Published",
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

export const dynamic = "force-dynamic";
