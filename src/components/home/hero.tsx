import { BookingWidget } from "@/components/home/booking-widget";
import { HeroVideoClient } from "@/components/home/hero-video-client";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { resolveHeroVideoSrc } from "@/lib/hero-video";

/**
 * Full-bleed hero media (video/image) — booking bar sits as a sibling below
 * so the hero is never covered. Hero height leaves ~72px of the next band
 * peeking so guests reach the bar with a tiny scroll.
 */
export function Hero({ content }: { content: HeroEditorContent }) {
  if (!content.enabled) return null;

  const isVideo = content.mediaType === "VIDEO";
  const videoSrc = isVideo ? resolveHeroVideoSrc(content) : "";
  const imageSrc = !isVideo ? content.image?.src || "" : "";

  return (
    <>
      <section
        aria-label="Welcome to Marlo Hotels"
        className="relative h-[calc(100svh-4.5rem)] min-h-[520px] overflow-hidden bg-forest-950 md:min-h-[640px]"
      >
        <div className="absolute inset-0">
          {videoSrc ? (
            <HeroVideoClient src={videoSrc} />
          ) : imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={content.image?.alt || "Marlo Hotels"}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                objectPosition: `${content.image?.focalX ?? 50}% ${content.image?.focalY ?? 45}%`,
              }}
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-forest-950" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-950/40 via-transparent to-charcoal-950/25" />
        </div>
      </section>

      {content.bookingWidget !== false ? (
        <section
          aria-label="Check availability"
          className="relative z-20 -mt-10 bg-gradient-to-b from-forest-950 via-forest-950 to-forest-900 px-4 pb-8 pt-2 sm:-mt-12 sm:px-6 sm:pb-10 lg:px-8"
        >
          <div className="mx-auto max-w-[1400px]">
            <BookingWidget content={content.booking} />
          </div>
        </section>
      ) : null}
    </>
  );
}
