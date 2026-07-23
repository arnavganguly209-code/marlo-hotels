/**
 * Default Hero background video.
 *
 * Temporary demo until the final Marlo clip is uploaded.
 * Orbit Video Upload can later override this via
 * `HeroEditorContent.videoUrl` + `mediaType: "VIDEO"`.
 */
export const DEMO_HERO_VIDEO_SRC = "/videos/hero-demo.mp4";

/**
 * Resolve the Hero background video URL.
 * Prefer an Orbit-assigned `videoUrl` when present; otherwise the demo.
 * Never falls back to a still image — that would flash the old hero.
 */
export function resolveHeroVideoSrc(content: {
  mediaType?: "IMAGE" | "VIDEO";
  videoUrl?: string;
}): string {
  const url = content.videoUrl?.trim();
  return url || DEMO_HERO_VIDEO_SRC;
}
