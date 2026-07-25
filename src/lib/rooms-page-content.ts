import "server-only";

import { getDb } from "@/lib/db";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";

export type RoomsPageCover = {
  src: string;
  alt: string;
  assetId?: string | null;
  eyebrow: string;
  title: string;
  description: string;
};

export type RoomsPageContent = {
  cover: RoomsPageCover;
};

const DEFAULT_COVER: RoomsPageCover = {
  src: "",
  alt: "Marlo Hotels rooms",
  assetId: null,
  eyebrow: "Rooms & Suites",
  title: "Quarters of quiet grandeur",
  description:
    "Every room at Marlo is an argument for staying in — mountain light, hand-loomed textiles and beds you will write home about.",
};

function mergeCover(
  base: RoomsPageCover,
  patch: Partial<RoomsPageCover> | null | undefined
): RoomsPageCover {
  if (!patch) return base;
  return { ...base, ...patch };
}

export async function getRoomsPageContent(): Promise<RoomsPageContent> {
  const db = getDb();
  let cover = DEFAULT_COVER;

  if (db) {
    try {
      const entry = await db.contentEntry.findUnique({
        where: { module_key: { module: "rooms", key: "page-content" } },
        select: { data: true },
      });
      if (entry?.data && typeof entry.data === "object") {
        const data = entry.data as { cover?: Partial<RoomsPageCover> };
        cover = mergeCover(DEFAULT_COVER, data.cover);
      }
    } catch {
      // Fall back to defaults if the table/entry is unavailable.
    }
  }

  if (!cover.src) {
    const hero = await resolveSiteImage("page.rooms.hero", {
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
