import "server-only";

import { getHomepageContent } from "@/lib/homepage-content";
import { getPlacement } from "@/lib/orbit/media";
import { siteConfig } from "@/lib/site";
import {
  SOCIAL_SHARE_IMAGE_PATH,
  SOCIAL_SHARE_IMAGE_VERSION,
  socialShareImageUrl,
} from "@/lib/social-share-image";

const FALLBACK_SRC = SOCIAL_SHARE_IMAGE_PATH;

function toAbsoluteUrl(src: string, versioned = false): string {
  const [path, query] = src.split("?");
  const absolute =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;

  if (!versioned) return query ? `${absolute}?${query}` : absolute;
  const bust = `${SOCIAL_SHARE_IMAGE_VERSION}${query ? `&${query}` : ""}`;
  return `${absolute}?v=${bust}`;
}

/** Share-card image aligned with the live homepage hero (poster or still). */
export async function getHomepageShareImageUrl(): Promise<string> {
  const [homepage, heroMedia] = await Promise.all([
    getHomepageContent(),
    getPlacement("home.hero"),
  ]);

  const hero = homepage.hero;
  let src = FALLBACK_SRC;

  if (hero.mediaType === "VIDEO") {
    src =
      hero.poster?.src ||
      hero.image?.src ||
      heroMedia.posterUrl ||
      FALLBACK_SRC;
  } else if (hero.image?.src) {
    src = hero.image.src;
  } else if (heroMedia.id && heroMedia.kind === "IMAGE") {
    src = heroMedia.src;
  } else if (hero.poster?.src) {
    src = hero.poster.src;
  } else if (heroMedia.posterUrl) {
    src = heroMedia.posterUrl;
  }

  // Prefer the static share asset — same hero still, reliable for WhatsApp crawlers.
  if (src.startsWith(SOCIAL_SHARE_IMAGE_PATH)) {
    return socialShareImageUrl(siteConfig.url);
  }

  const normalized = src.split("?")[0];
  if (
    normalized.includes("/media/hero/") ||
    normalized.includes("/uploads/hero/")
  ) {
    return socialShareImageUrl(siteConfig.url);
  }

  return toAbsoluteUrl(src, true);
}
