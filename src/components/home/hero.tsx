"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BookingWidget } from "@/components/home/booking-widget";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { resolveHeroVideoSrc } from "@/lib/hero-video";

/**
 * Luxury cinematic Hero — autoplay / muted / loop / cover.
 * No browser controls. No mute UI. Booking bar stays in first viewport.
 */
export function Hero({ content }: { content: HeroEditorContent }) {
  const isVideo = content.mediaType === "VIDEO";
  const videoSrc = isVideo ? resolveHeroVideoSrc(content) : "";
  const posterSrc = content.poster?.src || "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    setVideoReady(false);
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.muted = true;
    video.defaultMuted = true;
    void video.play().catch(() => undefined);
  }, [videoSrc, videoReady]);

  if (!content.enabled) return null;

  return (
    <section
      aria-label="Welcome to Marlo Hotels"
      className="relative flex min-h-svh flex-col overflow-hidden bg-forest-950"
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
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
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
