import "server-only";

import { getDb } from "@/lib/db";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";

export type BlogPageCover = {
  src: string;
  alt: string;
  assetId?: string | null;
  eyebrow: string;
  title: string;
  description: string;
};

export type BlogPageSettings = {
  cover: BlogPageCover;
};

const DEFAULT_COVER: BlogPageCover = {
  src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2400&auto=format&fit=crop",
  alt: "Sunrise over the valley rim",
  assetId: null,
  eyebrow: "The Journal",
  title: "Dispatches from the valley",
  description:
    "Itineraries, craft, kitchens and rituals — written by the people who make Marlo what it is.",
};

function mergeCover(
  base: BlogPageCover,
  patch: Partial<BlogPageCover> | null | undefined
): BlogPageCover {
  if (!patch) return base;
  return { ...base, ...patch };
}

export async function getBlogPageSettings(): Promise<BlogPageSettings> {
  const db = getDb();
  let cover = DEFAULT_COVER;

  if (db) {
    try {
      const entry = await db.contentEntry.findUnique({
        where: { module_key: { module: "blog", key: "page-settings" } },
        select: { data: true },
      });
      if (entry?.data && typeof entry.data === "object") {
        const data = entry.data as { cover?: Partial<BlogPageCover> };
        cover = mergeCover(DEFAULT_COVER, data.cover);
      }
    } catch {
      // Fall back to defaults if the table/entry is unavailable.
    }
  }

  if (!cover.src) {
    const hero = await resolveSiteImage("page.blog.hero", {
      src: "",
      alt: cover.alt,
    });
    if (hero.src) {
      cover = {
        ...cover,
        src: hero.src,
        alt: hero.alt || cover.alt,
        assetId: hero.id ?? cover.assetId,
      };
    }
  }

  return { cover };
}
