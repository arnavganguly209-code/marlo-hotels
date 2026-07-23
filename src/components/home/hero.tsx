"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingWidget } from "@/components/home/booking-widget";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { resolveHeroVideoSrc } from "@/lib/hero-video";

/**
 * Homepage Hero — full-bleed HTML5 background video only.
 * Never renders a still hero image (prevents flash of previous media).
 * Orbit can later assign `mediaType: "VIDEO"` + `videoUrl` to replace the demo.
 */
export function Hero({ content }: { content: HeroEditorContent }) {
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const mediaX = useTransform(springX, [-0.5, 0.5], [14, -14]);
  const mediaY = useTransform(springY, [-0.5, 0.5], [10, -10]);

  const highlighted = content.highlightedText?.trim();
  let leadWords: string[];
  let accentWord: string;
  if (highlighted && content.heading.includes(highlighted)) {
    const idx = content.heading.indexOf(highlighted);
    leadWords = content.heading
      .slice(0, idx)
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    accentWord = highlighted;
  } else {
    const headingWords = content.heading.split(/\s+/).filter(Boolean);
    accentWord = headingWords.at(-1) ?? "";
    leadWords = headingWords.slice(0, -1);
  }

  const focalX = content.image.focalX ?? 50;
  const focalY = content.image.focalY ?? 45;
  const objectPosition = `${focalX}% ${focalY}%`;
  const videoSrc = resolveHeroVideoSrc(content);
  const description = content.subheading || content.description;
  const overlayOpacity =
    content.overlay === "Light"
      ? "from-charcoal-950/55"
      : content.overlay === "Dark"
        ? "from-charcoal-950/90"
        : "from-charcoal-950/80";

  if (!content.enabled) return null;

  function onMouseMove(event: React.MouseEvent<HTMLElement>) {
    if (reduceMotion) return;
    const { innerWidth, innerHeight } = window;
    mouseX.set(event.clientX / innerWidth - 0.5);
    mouseY.set(event.clientY / innerHeight - 0.5);
  }

  return (
    <section
      aria-label="Welcome to Marlo Hotels"
      onMouseMove={onMouseMove}
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-forest-950"
    >
      {/* Aspect-aware full-bleed stage: cover fills every viewport (16:9 source) */}
      <motion.div
        style={reduceMotion ? undefined : { x: mediaX, y: mediaY }}
        className="absolute -inset-6"
      >
        <video
          key={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition, aspectRatio: "16 / 9" }}
          autoPlay={content.videoAutoplay !== false}
          loop={content.videoLoop !== false}
          muted={content.videoMuted !== false}
          playsInline
          preload="auto"
          // Intentionally no poster — a poster would flash the old hero image.
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </motion.div>
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${overlayOpacity} via-charcoal-950/30 to-charcoal-950/20`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal-950/90 to-transparent" />

      <div className="relative mx-auto w-full max-w-7xl flex-1 px-5 md:px-8">
        <div className="flex h-full max-w-2xl flex-col justify-center pt-36 pb-16">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="eyebrow"
          >
            {content.eyebrow}
          </motion.p>

          <h1 className="font-display mt-6 text-6xl leading-[1.02] font-medium text-ivory md:text-7xl lg:text-[5.6rem]">
            <span className="flex flex-wrap gap-x-5 overflow-hidden">
              {leadWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1,
                    delay: 0.55 + index * 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block overflow-hidden">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.85,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text pb-2 text-transparent italic"
              >
                {accentWord}
              </motion.span>
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.15 }}
            className="gold-rule mt-8 text-gold-500"
          >
            <span aria-hidden="true" className="text-sm">
              ✦
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-md text-[15px] leading-relaxed font-light tracking-wide text-cream-200/85"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <Button asChild variant="outline" size="lg">
              <Link href={content.buttonLink || "/rooms"}>
                {content.buttonText || "Discover More"}
                <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        aria-hidden="true"
        className="absolute right-8 bottom-44 hidden flex-col items-center gap-3 lg:flex"
      >
        <span className="text-[9px] tracking-[0.4em] text-cream-200/60 uppercase [writing-mode:vertical-lr]">
          {content.scrollLabel}
        </span>
        <span className="flex h-10 w-6 items-start justify-center rounded-full border border-cream-200/30 pt-1.5">
          <span className="animate-scroll-dot block size-1.5 rounded-full bg-gold-400" />
        </span>
      </motion.div>

      {/* Booking widget: immediately visible (no delayed fade) inside Hero */}
      {content.bookingWidget !== false ? (
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-8 md:px-8">
          <BookingWidget content={content.booking} />
        </div>
      ) : null}
    </section>
  );
}
