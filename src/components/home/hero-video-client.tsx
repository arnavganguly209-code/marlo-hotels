"use client";

import { useEffect, useRef } from "react";

/**
 * Cinematic background video — visible immediately, autoplay/muted/loop.
 * No poster flash. No controls. Relies on Range-capable /media delivery.
 */
export function HeroVideoClient({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    const play = () => {
      void video.play().catch(() => undefined);
    };
    play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      key={src}
      src={src}
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      controlsList="nodownload noplaybackrate noremoteplayback"
    />
  );
}
