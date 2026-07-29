"use client";

import { memo, useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Cinematic hero background video.
 * Shows poster immediately, then fades to autoplaying muted video.
 * Stable across parent re-renders — no remount via key.
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
  const cleanSrc = src.split("?")[0] || src;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let cancelled = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const tryPlay = () => {
      void video.play().catch(() => undefined);
    };

    const onReady = () => {
      if (cancelled) return;
      setReady(true);
      tryPlay();
    };

    if (video.readyState >= 2) {
      onReady();
    }

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("playing", onReady);
    tryPlay();

    // Retry shortly in case autoplay was blocked until user gesture / policy.
    const t1 = window.setTimeout(tryPlay, 120);
    const t2 = window.setTimeout(tryPlay, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("playing", onReady);
    };
  }, [cleanSrc]);

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
            ready ? "opacity-0" : "opacity-100"
          )}
        />
      ) : null}
      <video
        ref={ref}
        src={cleanSrc}
        poster={poster || undefined}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out",
          ready ? "opacity-100" : "opacity-0"
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
