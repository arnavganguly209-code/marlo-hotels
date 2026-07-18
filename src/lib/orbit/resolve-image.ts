import { getPlacement, type ResolvedMedia } from "@/lib/orbit/media";

/** Resolve a CMS placement with a safe visual fallback (does not change SEO). */
export async function resolveSiteImage(
  key: string,
  fallback: { src: string; alt: string; focalX?: number; focalY?: number }
): Promise<ResolvedMedia> {
  const media = await getPlacement(key, fallback);
  // When a placement has no asset yet, prefer the caller fallback over the
  // global hero default so section-specific imagery stays correct.
  const usingGlobalDefault =
    !media.id &&
    (media.src === "/images/brand/hero-reception.png" ||
      media.src === "/images/brand/hero-reference.png");
  if (usingGlobalDefault && fallback.src) {
    return {
      ...media,
      src: fallback.src,
      alt: fallback.alt,
      focalX: fallback.focalX ?? 50,
      focalY: fallback.focalY ?? 50,
      objectPosition: `${fallback.focalX ?? 50}% ${fallback.focalY ?? 50}%`,
    };
  }
  return {
    ...media,
    alt: media.alt || fallback.alt,
  };
}
