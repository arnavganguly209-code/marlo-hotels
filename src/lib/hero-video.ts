/**
 * Resolve Hero background video URL from Orbit only.
 * Never falls back to demo / placeholder videos.
 */
export function resolveHeroVideoSrc(content: {
  mediaType?: "IMAGE" | "VIDEO";
  videoUrl?: string;
}): string {
  return content.videoUrl?.trim() || "";
}
