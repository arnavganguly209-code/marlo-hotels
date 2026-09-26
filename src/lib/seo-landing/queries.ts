import "server-only";

import { getDb } from "@/lib/db";
import {
  parseFaqs,
  parseRelatedPaths,
  type SeoLandingPageRecord,
} from "@/lib/seo-landing/types";

function mapRow(row: {
  id: string;
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  body: string;
  faqs: unknown;
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
  relatedPaths: unknown;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SeoLandingPageRecord {
  return {
    ...row,
    faqs: parseFaqs(row.faqs),
    relatedPaths: parseRelatedPaths(row.relatedPaths),
  };
}

export async function listSeoLandingPages(): Promise<SeoLandingPageRecord[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db.seoLandingPage.findMany({
      orderBy: [{ path: "asc" }],
    });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function getSeoLandingPageByPath(
  path: string
): Promise<SeoLandingPageRecord | null> {
  const db = getDb();
  if (!db) return null;
  const clean = path.replace(/^\/+/, "");
  try {
    const row = await db.seoLandingPage.findUnique({ where: { path: clean } });
    return row ? mapRow(row) : null;
  } catch {
    return null;
  }
}

export async function getSeoLandingPageById(
  id: string
): Promise<SeoLandingPageRecord | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const row = await db.seoLandingPage.findUnique({ where: { id } });
    return row ? mapRow(row) : null;
  } catch {
    return null;
  }
}

/** Public: published + enabled. Indexability is separate (robotsIndex). */
export async function getPublicSeoLandingPage(
  path: string
): Promise<SeoLandingPageRecord | null> {
  const page = await getSeoLandingPageByPath(path);
  if (!page) return null;
  if (!page.enabled || page.status !== "PUBLISHED") return null;
  return page;
}

export async function listIndexableSeoLandingPages(): Promise<
  SeoLandingPageRecord[]
> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db.seoLandingPage.findMany({
      where: {
        status: "PUBLISHED",
        enabled: true,
        robotsIndex: true,
      },
      orderBy: { path: "asc" },
    });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function getRelatedSeoLandingPages(
  paths: string[]
): Promise<SeoLandingPageRecord[]> {
  if (!paths.length) return [];
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db.seoLandingPage.findMany({
      where: {
        path: { in: paths.map((p) => p.replace(/^\/+/, "")) },
        status: "PUBLISHED",
        enabled: true,
      },
      orderBy: { path: "asc" },
    });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}
