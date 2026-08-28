import "server-only";

import { getHomepageContent } from "@/lib/homepage-content";
import { getPlacement } from "@/lib/orbit/media";
import { siteConfig } from "@/lib/site";

const FALLBACK_SRC = "/images/brand/hero-reception.png";

function toAbsoluteUrl(src: string): string {
  const path = src.split("?")[0];
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
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

  return toAbsoluteUrl(src);
}
