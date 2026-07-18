import "server-only";

import { getDb } from "@/lib/db";

export type BrandSettings = {
  logoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
};

const defaults: BrandSettings = {
  logoUrl: "/images/brand/logo.png",
  footerLogoUrl: "/images/brand/logo.png",
  faviconUrl: "/images/brand/logo.png",
};

export async function getBrandSettings(): Promise<BrandSettings> {
  const db = getDb();
  if (!db) return defaults;
  try {
    const entry = await db.contentEntry.findFirst({
      where: { module: "site-settings", status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { data: true },
    });
    if (!entry || typeof entry.data !== "object" || !entry.data) return defaults;
    const data = entry.data as Record<string, unknown>;
    return {
      logoUrl:
        typeof data.logoUrl === "string" && data.logoUrl
          ? data.logoUrl
          : defaults.logoUrl,
      footerLogoUrl:
        typeof data.footerLogoUrl === "string" && data.footerLogoUrl
          ? data.footerLogoUrl
          : defaults.footerLogoUrl,
      faviconUrl:
        typeof data.faviconUrl === "string" && data.faviconUrl
          ? data.faviconUrl
          : defaults.faviconUrl,
    };
  } catch {
    return defaults;
  }
}
