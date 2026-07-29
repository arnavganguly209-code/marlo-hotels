"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Cinematic hero background video optimized for slow networks:
 * - Poster paints instantly
 * - Playback starts after a short buffer is ready
 * - Poster returns during stalls so the hero never freezes black
 * - Stable across parent re-renders (no remount via key)
 */
export const HeroVideoClient = memo(function HeroVideoClient({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [stalled, setStalled] = useState(false);
  const cleanSrc = src.split("?")[0] || src;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let cancelled = false;
    let isReady = false;

    setReady(false);
    setStalled(false);

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const hasBuffer = (minSeconds = 1.25) => {
      try {
        const { buffered, currentTime } = video;
        for (let i = 0; i < buffered.length; i += 1) {
          if (
            buffered.start(i) <= currentTime + 0.15 &&
            buffered.end(i) >= currentTime + minSeconds
          ) {
            return true;
          }
        }
      } catch {
        /* ignore */
      }
      return video.readyState >= 3;
    };

    const tryPlay = () => {
      if (cancelled) return;
      void video.play().catch(() => undefined);
    };

    const markReady = () => {
      if (cancelled) return;
      isReady = true;
      setReady(true);
      setStalled(false);
      tryPlay();
    };

    const onCanPlay = () => {
      if (hasBuffer(0.8) || video.readyState >= 3) markReady();
    };

    const onPlaying = () => {
      if (cancelled) return;
      isReady = true;
      setReady(true);
      setStalled(false);
    };

    const onWaiting = () => {
      if (cancelled || !isReady) return;
      setStalled(true);
    };

    const onProgress = () => {
      if (cancelled) return;
      if (!isReady && hasBuffer(1)) {
        markReady();
        return;
      }
      if (isReady && hasBuffer(1.5)) {
        setStalled(false);
        tryPlay();
      }
    };

    if (video.readyState >= 3 || hasBuffer(1)) {
      markReady();
    }

    video.addEventListener("loadeddata", onCanPlay);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("canplaythrough", markReady);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("stalled", onWaiting);
    video.addEventListener("progress", onProgress);

    tryPlay();
    const t1 = window.setTimeout(tryPlay, 200);
    const t2 = window.setTimeout(tryPlay, 800);
    const t3 = window.setTimeout(() => {
      if (!cancelled && !isReady && video.readyState >= 2) markReady();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      video.removeEventListener("loadeddata", onCanPlay);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("canplaythrough", markReady);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("stalled", onWaiting);
      video.removeEventListener("progress", onProgress);
    };
  }, [cleanSrc]);

  const showPoster = Boolean(poster) && (!ready || stalled);

  return (
    <div className="absolute inset-0 bg-forest-950">
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          fetchPriority="high"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out",
            showPoster ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}
      <video
        ref={ref}
        src={cleanSrc}
        poster={poster || undefined}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out",
          ready && !stalled ? "opacity-100" : "opacity-0"
        )}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        {...({ fetchPriority: "high" } as VideoHTMLAttributes<HTMLVideoElement>)}
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
      />
    </div>
  );
});
