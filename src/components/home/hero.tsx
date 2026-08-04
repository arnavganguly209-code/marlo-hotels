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
    <div className="preserve-type">
      {/* —— Mobile: video, then booking on dark strip (same glass as desktop) —— */}
      <div className="pt-[4.5rem] lg:hidden">
        <section
          aria-label="Welcome to Marlo Hotels"
          className="relative h-[56svh] min-h-[280px] overflow-hidden bg-forest-950"
        >
          <div className="absolute inset-0">{renderMedia()}</div>
        </section>
        {content.bookingWidget !== false ? (
          <div
            aria-label="Check availability"
            className="relative z-20 overflow-hidden bg-[#0B1713] px-4 pb-7 pt-5 sm:px-6"
          >
            {/* Same dark atmosphere as desktop video overlay so frost glass + ivory text read. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#12201c] via-[#0B1713] to-[#08110e]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent"
            />
            <div className="relative z-10">{renderBooking()}</div>
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
    </div>
  );
}
