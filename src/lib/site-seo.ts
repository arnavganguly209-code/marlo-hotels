import "server-only";

import { getDb } from "@/lib/db";
import {
  DEFAULT_SITE_KEYWORDS,
  keywordsToTextarea,
  parseKeywords,
} from "@/lib/seo-keywords";

const SITEWIDE_KEYS = new Set(["site", "global", "sitewide", "website"]);
const SITEWIDE_PAGES = new Set([
  "site",
  "global",
  "sitewide",
  "homepage",
  "home",
  "all",
  "website",
  "marlo",
  "marlo hotels",
]);

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function isSitewideEntry(entry: {
  key: string;
  data: unknown;
  seo: unknown;
}): boolean {
  const key = entry.key.toLowerCase();
  if (SITEWIDE_KEYS.has(key)) return true;
  const data = asRecord(entry.data);
  const page = String(data.page ?? "")
    .trim()
    .toLowerCase();
  return SITEWIDE_PAGES.has(page);
}

export type SiteSeo = {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImageUrl: string;
};

/** Site-wide SEO from Orbit `/orbit/seo` (sitewide record), with keyword fallbacks. */
export async function getSiteSeo(): Promise<SiteSeo> {
  const fallback: SiteSeo = {
    metaTitle: "",
    metaDescription: "",
    keywords: DEFAULT_SITE_KEYWORDS,
    canonicalUrl: "",
    ogImageUrl: "",
  };

  const db = getDb();
  if (!db) return fallback;

  try {
    const entries = await db.contentEntry.findMany({
      where: { module: "seo", status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
    });

    const sitewide =
      entries.find((entry) => isSitewideEntry(entry)) ?? entries[0] ?? null;

    if (!sitewide) return fallback;

    const merged = {
      ...asRecord(sitewide.seo),
      ...asRecord(sitewide.data),
    };

    const keywords = parseKeywords(merged.keywords);
    return {
      metaTitle:
        typeof merged.metaTitle === "string" ? merged.metaTitle.trim() : "",
      metaDescription:
        typeof merged.metaDescription === "string"
          ? merged.metaDescription.trim()
          : "",
      keywords: keywords.length ? keywords : DEFAULT_SITE_KEYWORDS,
      canonicalUrl:
        typeof merged.canonicalUrl === "string"
          ? merged.canonicalUrl.trim()
          : "",
      ogImageUrl:
        typeof merged.ogImageUrl === "string" ? merged.ogImageUrl.trim() : "",
    };
  } catch {
    return fallback;
  }
}

export async function getSiteSeoKeywords(): Promise<string[]> {
  const seo = await getSiteSeo();
  return seo.keywords;
}

/**
 * Ensure a published sitewide SEO record exists so Orbit editors can edit keywords.
 * Safe to call from Orbit SEO module page load.
 */
export async function ensureSitewideSeoEntry() {
  const db = getDb();
  if (!db) return null;

  const existing = await db.contentEntry.findFirst({
    where: {
      module: "seo",
      OR: [
        { key: "site" },
        { key: "sitewide" },
        { key: "global" },
      ],
    },
  });
  if (existing) return existing;

  return db.contentEntry.create({
    data: {
      module: "seo",
      key: "site",
      title: "Sitewide SEO — Marlo Hotels",
      slug: "site",
      status: "PUBLISHED",
      publishedAt: new Date(),
      data: {
        page: "site",
        metaTitle: "Marlo Hotels — Stay Beyond Extraordinary",
        metaDescription:
          "Marlo Hotels is a five-star luxury sanctuary in the heart of Kathmandu — timeless elegance, celebrated dining, restorative wellness and Himalayan hospitality.",
        keywords: keywordsToTextarea(DEFAULT_SITE_KEYWORDS),
        robots: "index, follow",
      },
      seo: {
        metaTitle: "Marlo Hotels — Stay Beyond Extraordinary",
        metaDescription:
          "Marlo Hotels is a five-star luxury sanctuary in the heart of Kathmandu — timeless elegance, celebrated dining, restorative wellness and Himalayan hospitality.",
        keywords: keywordsToTextarea(DEFAULT_SITE_KEYWORDS),
        robots: "index, follow",
      },
    },
  });
}
