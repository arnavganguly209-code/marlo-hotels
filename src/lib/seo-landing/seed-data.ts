import type { SeoLandingFaq } from "@/lib/seo-landing/types";
import seoLandingSeedsJson from "../../../scripts/seo-landing-seeds.json";

export type SeoLandingSeed = {
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
  relatedPaths: string[];
  status: "PUBLISHED" | "DRAFT";
  robotsIndex: boolean;
  enabled: boolean;
};

/**
 * Authoritative list for `scripts/seed-seo-landings.mjs` — regenerate via:
 * `node scripts/generate-seo-landing-seeds.mjs`
 */
export const SEO_LANDING_SEEDS = seoLandingSeedsJson as SeoLandingSeed[];
