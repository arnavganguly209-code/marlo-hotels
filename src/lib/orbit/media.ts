import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

export type ResolvedMedia = {
  id: string | null;
  src: string;
  alt: string;
  title?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  kind: "IMAGE" | "VIDEO";
  focalX: number;
  focalY: number;
  objectPosition: string;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
  posterUrl?: string | null;
};

const FALLBACK_HERO: ResolvedMedia = {
  id: null,
  src: "/images/brand/hero-reception.png",
  alt: "Marlo Hotels lobby and reception — Hotel Marlo",
  kind: "IMAGE",
  focalX: 50,
  focalY: 45,
  objectPosition: "50% 45%",
};

export function objectPosition(focalX = 50, focalY = 50) {
  return `${focalX}% ${focalY}%`;
}

export async function getPlacement(
  key: string,
  fallback?: Partial<ResolvedMedia>
): Promise<ResolvedMedia> {
  noStore();
  const db = getDb();
  if (!db) {
    return {
      ...FALLBACK_HERO,
      ...fallback,
      objectPosition: objectPosition(
        fallback?.focalX ?? FALLBACK_HERO.focalX,
        fallback?.focalY ?? FALLBACK_HERO.focalY
      ),
    };
  }

  const placement = await db.mediaPlacement.findUnique({
    where: { key },
    include: {
      asset: {
        select: {
          id: true,
          url: true,
          alt: true,
          title: true,
          caption: true,
          width: true,
          height: true,
          mimeType: true,
          kind: true,
          focalX: true,
          focalY: true,
          posterUrl: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!placement?.asset || placement.asset.deletedAt) {
    return {
      ...FALLBACK_HERO,
      ...fallback,
      alt: fallback?.alt || FALLBACK_HERO.alt,
      objectPosition: objectPosition(
        fallback?.focalX ?? FALLBACK_HERO.focalX,
        fallback?.focalY ?? FALLBACK_HERO.focalY
      ),
    };
  }

  const focalX = placement.focalX ?? placement.asset.focalX ?? 50;
  const focalY = placement.focalY ?? placement.asset.focalY ?? 50;

  return {
    id: placement.asset.id,
    src: placement.asset.url,
    alt: placement.alt || placement.asset.alt || fallback?.alt || "",
    title: placement.title || placement.asset.title,
    caption: placement.caption || placement.asset.caption,
    width: placement.asset.width,
    height: placement.asset.height,
    mimeType: placement.asset.mimeType,
    kind: placement.mediaType || placement.asset.kind,
    focalX,
    focalY,
    objectPosition: objectPosition(focalX, focalY),
    videoAutoplay: placement.videoAutoplay,
    videoLoop: placement.videoLoop,
    videoMuted: placement.videoMuted,
    posterUrl: placement.posterUrl || placement.asset.posterUrl,
  };
}

export async function getPlacements(keys: string[]) {
  const entries = await Promise.all(
    keys.map(async (key) => [key, await getPlacement(key)] as const)
  );
  return Object.fromEntries(entries) as Record<string, ResolvedMedia>;
}

export async function upsertPlacement(options: {
  key: string;
  label: string;
  assetId: string | null;
  mediaType?: "IMAGE" | "VIDEO";
  alt?: string | null;
  title?: string | null;
  caption?: string | null;
  focalX?: number;
  focalY?: number;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
  posterUrl?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  return db.mediaPlacement.upsert({
    where: { key: options.key },
    create: {
      key: options.key,
      label: options.label,
      assetId: options.assetId,
      mediaType: options.mediaType || "IMAGE",
      alt: options.alt,
      title: options.title,
      caption: options.caption,
      focalX: options.focalX ?? 50,
      focalY: options.focalY ?? 50,
      videoAutoplay: options.videoAutoplay ?? true,
      videoLoop: options.videoLoop ?? true,
      videoMuted: options.videoMuted ?? true,
      posterUrl: options.posterUrl,
      metadata:
        options.metadata === undefined || options.metadata === null
          ? undefined
          : (options.metadata as Prisma.InputJsonValue),
    },
    update: {
      label: options.label,
      assetId: options.assetId,
      mediaType: options.mediaType || "IMAGE",
      alt: options.alt,
      title: options.title,
      caption: options.caption,
      focalX: options.focalX ?? 50,
      focalY: options.focalY ?? 50,
      videoAutoplay: options.videoAutoplay ?? true,
      videoLoop: options.videoLoop ?? true,
      videoMuted: options.videoMuted ?? true,
      posterUrl: options.posterUrl,
      metadata:
        options.metadata === undefined || options.metadata === null
          ? undefined
          : (options.metadata as Prisma.InputJsonValue),
    },
    include: { asset: true },
  });
}

/** Known site placement keys — used by Media Library usage tracking. */
export const SITE_PLACEMENTS = [
  { key: "home.hero", label: "Homepage Hero" },
  { key: "home.about.primary", label: "Homepage About — Primary" },
  { key: "home.about.secondary", label: "Homepage About — Secondary" },
  { key: "home.wellness.primary", label: "Homepage Wellness — Primary" },
  { key: "home.wellness.secondary", label: "Homepage Wellness — Secondary" },
  { key: "home.pool", label: "Homepage Pool Banner" },
  { key: "home.events.primary", label: "Homepage Events — Primary" },
  { key: "home.events.secondary", label: "Homepage Events — Secondary" },
  { key: "page.rooms.hero", label: "Rooms Page Hero" },
  { key: "page.dining.hero", label: "Dining Page Hero" },
  { key: "page.spa.hero", label: "Spa Page Hero" },
  { key: "page.spa.body", label: "Spa Page Body" },
  { key: "page.experiences.hero", label: "Experiences Page Hero" },
  { key: "page.gallery.hero", label: "Gallery Page Hero" },
  { key: "page.offers.hero", label: "Offers Page Hero" },
  { key: "page.blog.hero", label: "Blog Page Hero" },
  { key: "page.contact.hero", label: "Contact Page Hero" },
  { key: "page.booking.hero", label: "Booking Page Hero" },
  { key: "brand.logo", label: "Primary Logo" },
  { key: "brand.footerLogo", label: "Footer Logo" },
  { key: "brand.favicon", label: "Favicon" },
] as const;
