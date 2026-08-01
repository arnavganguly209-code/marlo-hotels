import "server-only";

import { galleryImages as defaultGalleryImages } from "@/content/gallery";
import { getDb } from "@/lib/db";

export type GalleryImageEntry = {
  id: string;
  src: string;
  alt: string;
  category: string;
  assetId?: string | null;
};

export type GalleryPageContent = {
  cover: {
    src: string;
    alt: string;
    assetId: string | null;
    eyebrow: string;
    title: string;
    description: string;
  };
  categories: string[];
  images: GalleryImageEntry[];
};

/** Fixed filter pills for the public gallery — "Wellness" content displays as "Spa". */
export const GALLERY_CATEGORIES = [
  "All",
  "Rooms",
  "Dining",
  "Spa",
  "Architecture",
  "Events",
] as const;

function displayCategory(category: string): string {
  return category === "Wellness" ? "Spa" : category;
}

export function getGalleryDefaults(): GalleryPageContent {
  return {
    cover: {
      src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop",
      alt: "Marlo Hotels architecture and pool",
      assetId: null,
      eyebrow: "Gallery",
      title: "Marlo, framed",
      description:
        "Rooms, tables, rituals and the architecture that holds them — a portrait of life at Marlo Hotels.",
    },
    categories: [...GALLERY_CATEGORIES],
    images: defaultGalleryImages.map((image, index) => ({
      id: `default-${index}`,
      src: image.src,
      alt: image.alt,
      category: displayCategory(image.category),
      assetId: null,
    })),
  };
}

function mergeGallery(
  base: GalleryPageContent,
  patch: Partial<GalleryPageContent> | null | undefined
): GalleryPageContent {
  if (!patch) return base;
  return {
    cover: { ...base.cover, ...patch.cover },
    categories:
      Array.isArray(patch.categories) && patch.categories.length
        ? patch.categories
        : base.categories,
    images:
      Array.isArray(patch.images) && patch.images.length
        ? patch.images.map((image) => ({
            ...image,
            category: displayCategory(image.category || "Rooms"),
          }))
        : base.images,
  };
}

export async function getGalleryContent(): Promise<GalleryPageContent> {
  const defaults = getGalleryDefaults();
  const db = getDb();
  if (!db) return defaults;
  try {
    const [entry, placement] = await Promise.all([
      db.contentEntry.findUnique({
        where: { module_key: { module: "gallery", key: "page-content" } },
        select: { data: true },
      }),
      db.mediaPlacement.findUnique({
        where: { key: "page.gallery.hero" },
        include: {
          asset: { select: { url: true, alt: true, deletedAt: true } },
        },
      }),
    ]);
    const merged = mergeGallery(
      defaults,
      entry?.data && typeof entry.data === "object"
        ? (entry.data as Partial<GalleryPageContent>)
        : null
    );
    if (!merged.cover.src && placement?.asset && !placement.asset.deletedAt) {
      merged.cover.src = placement.asset.url;
      merged.cover.alt = merged.cover.alt || placement.asset.alt || "";
    }
    return merged;
  } catch {
    return defaults;
  }
}
