import "server-only";

import { getDb } from "@/lib/db";
import { getPlacement } from "@/lib/orbit/media";

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
  const [logo, footerLogo, favicon] = await Promise.all([
    getPlacement("brand.logo", { src: defaults.logoUrl, alt: "Marlo Hotels" }),
    getPlacement("brand.footerLogo", {
      src: defaults.footerLogoUrl,
      alt: "Marlo Hotels",
    }),
    getPlacement("brand.favicon", {
      src: defaults.faviconUrl,
      alt: "Marlo Hotels",
    }),
  ]);

  const fromPlacements: BrandSettings = {
    logoUrl: logo.src || defaults.logoUrl,
    footerLogoUrl: footerLogo.src || defaults.footerLogoUrl,
    faviconUrl: favicon.src || defaults.faviconUrl,
  };

  if (!db) return fromPlacements;
  try {
    const entry = await db.contentEntry.findFirst({
      where: { module: "site-settings", status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { data: true },
    });
    if (!entry || typeof entry.data !== "object" || !entry.data) {
      return fromPlacements;
    }
    const data = entry.data as Record<string, unknown>;
    return {
      logoUrl:
        typeof data.logoUrl === "string" && data.logoUrl
          ? data.logoUrl
          : fromPlacements.logoUrl,
      footerLogoUrl:
        typeof data.footerLogoUrl === "string" && data.footerLogoUrl
          ? data.footerLogoUrl
          : fromPlacements.footerLogoUrl,
      faviconUrl:
        typeof data.faviconUrl === "string" && data.faviconUrl
          ? data.faviconUrl
          : fromPlacements.faviconUrl,
    };
  } catch {
    return fromPlacements;
  }
}
