/**
 * Stream-optimized homepage hero loop.
 * Compressed for progressive playback on slow networks (~3–5MB).
 * Regenerate with scripts/optimize-hero-video when Orbit hero source changes.
 */
export const HERO_STREAM_SRC = "/videos/hero-loop.mp4";

/**
 * Resolve Hero background video URL.
 * When Orbit has a video configured, play the stream-optimized cut
 * so the hero never stalls on the raw 100MB+ upload.
 */
export function resolveHeroVideoSrc(content: {
  mediaType?: "IMAGE" | "VIDEO";
  videoUrl?: string;
}): string {
  const configured = content.videoUrl?.trim() || "";
  if (!configured) return "";
  return HERO_STREAM_SRC;
}
