"use client";

import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BookingWidget } from "@/components/home/booking-widget";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { resolveHeroVideoSrc } from "@/lib/hero-video";
import { cn } from "@/lib/utils";

/**
 * Luxury cinematic Hero — autoplay / muted / loop background.
 * No browser chrome. Minimal mute control on hover only.
 * Booking bar stays in the first viewport.
 */
export function Hero({ content }: { content: HeroEditorContent }) {
  const isVideo = content.mediaType === "VIDEO";
  const videoSrc = isVideo ? resolveHeroVideoSrc(content) : "";
  const posterSrc = content.poster?.src || "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [muted, setMuted] = useState(content.videoMuted !== false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    setVideoReady(false);
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.muted = true;
    void video.play().catch(() => undefined);
  }, [videoSrc, videoReady]);

  if (!content.enabled) return null;

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  return (
    <section
      aria-label="Welcome to Marlo Hotels"
      className="relative flex min-h-svh flex-col overflow-hidden bg-forest-950"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="absolute inset-0">
        {isVideo && videoSrc ? (
          <>
            {posterSrc && !videoReady ? (
              <Image
                key={`poster-${posterSrc}`}
                src={posterSrc}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
                unoptimized={posterSrc.startsWith("/media/")}
              />
            ) : null}
            <video
              ref={videoRef}
              key={videoSrc}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                aspectRatio: "16 / 9",
                opacity: videoReady || !posterSrc ? 1 : 0,
              }}
              autoPlay
              loop={content.videoLoop !== false}
              muted={muted}
              playsInline
              preload="metadata"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload noplaybackrate noremoteplayback"
              poster={posterSrc || undefined}
              onCanPlay={(event) => {
                setVideoReady(true);
                event.currentTarget.muted = true;
                void event.currentTarget.play().catch(() => undefined);
              }}
            >
              {content.mobileVideoUrl ? (
                <source
                  src={content.mobileVideoUrl}
                  type="video/mp4"
                  media="(max-width: 768px)"
                />
              ) : null}
              <source src={videoSrc} type="video/mp4" />
            </video>
          </>
        ) : content.image?.src ? (
          <Image
            key={content.image.src}
            src={content.image.src}
            alt={content.image.alt || "Marlo Hotels"}
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover"
            style={{
              objectPosition: `${content.image.focalX ?? 50}% ${content.image.focalY ?? 45}%`,
            }}
            unoptimized={content.image.src.startsWith("/media/")}
          />
        ) : (
          <div className="absolute inset-0 bg-forest-950" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-950/55 via-transparent to-charcoal-950/20" />
      </div>

      {isVideo && videoSrc ? (
        <div
          className={cn(
            "absolute top-28 right-5 z-20 transition-opacity duration-500 sm:top-32 sm:right-8",
            hovering ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="grid size-10 place-items-center rounded-full border border-white/15 bg-[rgb(10_24_20_/_0.55)] text-cream-50 backdrop-blur-xl transition hover:text-gold-300"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
      ) : null}

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
