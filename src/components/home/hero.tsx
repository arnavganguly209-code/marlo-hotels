"use client";

import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BookingWidget } from "@/components/home/booking-widget";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { resolveHeroVideoSrc } from "@/lib/hero-video";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Homepage Hero — cinematic video (or image) + booking widget in first viewport.
 * Video-only: no marketing copy overlay. Zero-flash via key + poster-until-ready.
 */
export function Hero({ content }: { content: HeroEditorContent }) {
  const isVideo = content.mediaType === "VIDEO";
  const videoSrc = isVideo ? resolveHeroVideoSrc(content) : "";
  const posterSrc = content.poster?.src || "";
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [playing, setPlaying] = useState(content.videoAutoplay !== false);
  const [muted, setMuted] = useState(content.videoMuted !== false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setVideoReady(false);
    setCurrent(0);
    setDuration(0);
  }, [videoSrc]);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  if (!content.enabled) return null;

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      await video.play().catch(() => undefined);
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  async function toggleFullscreen() {
    const node = shellRef.current;
    if (!node) return;
    if (!document.fullscreenElement) {
      await node.requestFullscreen().catch(() => undefined);
    } else {
      await document.exitFullscreen().catch(() => undefined);
    }
  }

  function seek(value: number) {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = value;
    setCurrent(value);
  }

  return (
    <section
      ref={shellRef}
      aria-label="Welcome to Marlo Hotels"
      className="relative flex min-h-svh flex-col overflow-hidden bg-forest-950"
    >
      <div className="absolute inset-0">
        {isVideo ? (
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
                style={{ aspectRatio: "16 / 9" }}
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
              autoPlay={content.videoAutoplay !== false}
              loop={content.videoLoop !== false}
              muted={muted}
              playsInline={content.videoPlaysInline !== false}
              preload="metadata"
              poster={posterSrc || undefined}
              onLoadedMetadata={(event) => {
                setDuration(event.currentTarget.duration || 0);
              }}
              onTimeUpdate={(event) => {
                setCurrent(event.currentTarget.currentTime || 0);
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onCanPlay={(event) => {
                setVideoReady(true);
                if (content.videoAutoplay !== false) {
                  void event.currentTarget.play().catch(() => undefined);
                }
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
        ) : (
          <Image
            key={content.image.src}
            src={content.image.src}
            alt={content.image.alt}
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
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-charcoal-950/25" />
      </div>

      {isVideo ? (
        <div className="absolute inset-x-0 bottom-[7.5rem] z-20 px-4 sm:bottom-36 sm:px-8 lg:bottom-40">
          <div className="mx-auto flex max-w-[1400px] items-center gap-3 rounded-full border border-white/10 bg-[rgb(10_24_20_/_0.55)] px-4 py-2.5 shadow-luxury backdrop-blur-xl">
            <button
              type="button"
              onClick={() => void togglePlay()}
              aria-label={playing ? "Pause" : "Play"}
              className="grid size-8 place-items-center rounded-full text-cream-50 transition hover:text-gold-300"
            >
              {playing ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="grid size-8 place-items-center rounded-full text-cream-50 transition hover:text-gold-300"
            >
              {muted ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={(event) => seek(Number(event.target.value))}
              aria-label="Video timeline"
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-gold-400"
            />
            <span className="min-w-[5.5rem] text-right text-[10px] tracking-wider text-cream-100/80 tabular-nums">
              {formatTime(current)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="grid size-8 place-items-center rounded-full text-cream-50 transition hover:text-gold-300"
            >
              {fullscreen ? (
                <Minimize className="size-4" />
              ) : (
                <Maximize className="size-4" />
              )}
            </button>
          </div>
        </div>
      ) : null}

      {content.bookingWidget !== false ? (
        <div className="relative z-20 mt-auto w-full px-4 pb-5 pt-28 sm:px-6 sm:pb-7 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <BookingWidget
              content={content.booking}
              className={cn(
                "border border-white/10 bg-[rgb(10_24_20_/_0.72)] shadow-[0_24px_60px_-18px_rgb(0_0_0_/_0.55)] backdrop-blur-2xl"
              )}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
