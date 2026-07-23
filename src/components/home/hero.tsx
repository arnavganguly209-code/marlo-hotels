import { BookingWidget } from "@/components/home/booking-widget";
import { HeroVideoClient } from "@/components/home/hero-video-client";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { resolveHeroVideoSrc } from "@/lib/hero-video";

/**
 * Server-rendered Hero so the video tag reaches the browser in the first HTML.
 * Combined with Range support on /media, playback can start in under a second.
 */
export function Hero({ content }: { content: HeroEditorContent }) {
  if (!content.enabled) return null;

  const isVideo = content.mediaType === "VIDEO";
  const videoSrc = isVideo ? resolveHeroVideoSrc(content) : "";
  const imageSrc = !isVideo ? content.image?.src || "" : "";

  return (
    <section
      aria-label="Welcome to Marlo Hotels"
      className="relative flex min-h-svh flex-col overflow-hidden bg-forest-950"
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-950/55 via-transparent to-charcoal-950/20" />
      </div>

      {content.bookingWidget !== false ? (
        <div className="relative z-20 mt-auto w-full px-4 pb-5 pt-28 sm:px-6 sm:pb-7 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <BookingWidget content={content.booking} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
