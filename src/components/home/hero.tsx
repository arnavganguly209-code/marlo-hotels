import { BookingWidget } from "@/components/home/booking-widget";
import { HeroVideoClient } from "@/components/home/hero-video-client";
import type { HeroEditorContent } from "@/lib/homepage-content";
import type { RoomCapacity } from "@/lib/booking-occupancy";
import { resolveHeroVideoSrc } from "@/lib/hero-video";

/**
 * Hero media + booking bar.
 *
 * Desktop: booking overlays the bottom of the full-viewport video (unchanged).
 * Mobile: video ends first; booking card begins immediately below — no overlay.
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

  const renderMedia = () => (
    <>
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
    </>
  );

  const renderBooking = () =>
    content.bookingWidget !== false ? (
      <div className="mx-auto max-w-[1400px]">
        <BookingWidget content={content.booking} occupancy={occupancy} />
      </div>
    ) : null;

  return (
    <>
      {/* —— Mobile: video, then booking below (no overlay) —— */}
      <div className="bg-ivory pt-[4.5rem] lg:hidden">
        <section
          aria-label="Welcome to Marlo Hotels"
          className="relative h-[56svh] min-h-[280px] overflow-hidden bg-forest-950"
        >
          <div className="absolute inset-0">{renderMedia()}</div>
        </section>
        {content.bookingWidget !== false ? (
          <div
            aria-label="Check availability"
            className="relative z-20 px-4 pb-6 pt-4 sm:px-6"
          >
            {renderBooking()}
          </div>
        ) : null}
      </div>

      {/* —— Desktop: unchanged overlay layout —— */}
      <div className="relative hidden h-dvh flex-col pt-[4.5rem] lg:flex">
        <section
          aria-label="Welcome to Marlo Hotels"
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-forest-950"
        >
          <div className="absolute inset-0">
            {renderMedia()}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-950/30 via-transparent to-transparent" />
          </div>

          {content.bookingWidget !== false ? (
            <div
              aria-label="Check availability"
              className="relative z-20 mt-auto px-8 pb-8 pt-3"
            >
              {renderBooking()}
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
