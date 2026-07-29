import { BookingWidget } from "@/components/home/booking-widget";
import { HeroVideoClient } from "@/components/home/hero-video-client";
import type { HeroEditorContent } from "@/lib/homepage-content";
import type { RoomCapacity } from "@/lib/booking-occupancy";
import { resolveHeroVideoSrc } from "@/lib/hero-video";

/**
 * Hero media + booking bar.
 *
 * Mobile: unchanged — near-full viewport video, booking bar nested below
 * with a slight overlap (existing perfect layout).
 *
 * Desktop (lg+): video + slim booking bar share one viewport so the entire
 * bar is visible on first paint with zero scroll.
 */
export function Hero({
  content,
  occupancy = [],
}: {
  content: HeroEditorContent;
  occupancy?: RoomCapacity[];
}) {
  if (!content.enabled) return null;

  const isVideo = content.mediaType === "VIDEO";
  const videoSrc = isVideo ? resolveHeroVideoSrc(content) : "";
  const imageSrc = !isVideo ? content.image?.src || "" : "";
  const posterSrc =
    content.poster?.src ||
    (isVideo ? content.image?.src || "/images/brand/hero-reception.png" : "");

  return (
    <div className="lg:flex lg:h-svh lg:flex-col">
      <section
        aria-label="Welcome to Marlo Hotels"
        className="relative h-[calc(100svh-4.5rem)] min-h-[520px] overflow-hidden bg-forest-950 md:min-h-[640px] lg:h-auto lg:min-h-0 lg:flex-1"
      >
        <div className="absolute inset-0">
          {videoSrc ? (
            <HeroVideoClient src={videoSrc} poster={posterSrc || undefined} />
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
          className="relative z-20 -mt-10 bg-gradient-to-b from-forest-950 via-forest-950 to-forest-900 px-4 pb-8 pt-2 sm:-mt-12 sm:px-6 sm:pb-10 lg:mt-0 lg:shrink-0 lg:bg-gradient-to-b lg:from-forest-950/95 lg:via-forest-950 lg:to-forest-900 lg:px-8 lg:pb-3.5 lg:pt-2.5"
        >
          <div className="mx-auto max-w-[1400px]">
            <BookingWidget content={content.booking} occupancy={occupancy} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
