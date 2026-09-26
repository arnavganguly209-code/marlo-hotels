import type { Room } from "@/types/content";

export type SeoLandingFaq = {
  question: string;
  answer: string;
};

export type SeoLandingPageRecord = {
  id: string;
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  body: string;
  faqs: SeoLandingFaq[];
  locationKey: string | null;
  categoryKey: string | null;
  facilityKey: string | null;
  roomFilter: string;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  enabled: boolean;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  relatedPaths: string[];
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function pathToPublicUrl(path: string) {
  const clean = path.replace(/^\/+/, "");
  return `/${clean}`;
}

export function segmentsToPath(segments: string[] | undefined) {
  return ["hotels", ...(segments || [])].join("/");
}

/** Filter published Marlo rooms for a landing page — no invented hotels. */
export function filterRoomsForLanding(
  rooms: Room[],
  roomFilter: string
): Room[] {
  const published = rooms.filter((room) => room.published !== false);
  switch (roomFilter) {
    case "featured": {
      const featured = published.filter((room) => room.featured);
      return featured.length ? featured : published;
    }
    case "suites": {
      const suites = published.filter((room) => room.category === "suite");
      return suites.length ? suites : published;
    }
    case "rooms":
      return published.filter((room) => room.category === "room");
    case "luxury": {
      const suites = published.filter((room) => room.category === "suite");
      if (suites.length) return suites;
      return [...published].sort((a, b) => b.priceFrom - a.priceFrom);
    }
    case "budget": {
      if (published.length <= 2) return published;
      const sorted = [...published].sort((a, b) => a.priceFrom - b.priceFrom);
      const cut = Math.max(1, Math.ceil(sorted.length / 2));
      return sorted.slice(0, cut);
    }
    case "all":
    default:
      return published;
  }
}

export function parseFaqs(value: unknown): SeoLandingFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = String(row.question ?? "").trim();
      const answer = String(row.answer ?? "").trim();
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(Boolean) as SeoLandingFaq[];
}

export function parseRelatedPaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? "").trim().replace(/^\/+/, ""))
    .filter(Boolean);
}
