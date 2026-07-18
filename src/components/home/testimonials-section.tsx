"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CollectionSection } from "@/lib/homepage-content";
import type { Testimonial } from "@/types/content";
import { cn } from "@/lib/utils";

export function TestimonialsSection({
  content,
}: {
  content: CollectionSection<Testimonial> & { autoplayMs: number };
}) {
  const items = content.items;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (next: number, dir: number) => {
      if (!items.length) return;
      setDirection(dir);
      setIndex((next + items.length) % items.length);
    },
    [items.length]
  );

  useEffect(() => {
    if (!items.length) return;
    const timer = setInterval(
      () => go(index + 1, 1),
      content.autoplayMs || 7000
    );
    return () => clearInterval(timer);
  }, [index, go, items.length, content.autoplayMs]);

  if (!content.enabled || !items.length) return null;

  const current = items[index] ?? items[0];

  return (
    <section className="bg-forest-950 py-24 md:py-36">
      <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
        <SectionHeading
          tone="light"
          eyebrow={content.eyebrow}
          title={content.heading}
        />

        <div className="relative mt-14 min-h-72" aria-live="polite">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.blockquote
              key={current.name}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="flex justify-center gap-1.5"
                aria-label={`${current.rating} out of 5 stars`}
              >
                {Array.from({ length: current.rating }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="size-4 fill-gold-500 text-gold-500"
                  />
                ))}
              </div>
              <p className="font-display mt-8 text-2xl leading-relaxed font-light text-ivory italic md:text-[1.75rem]">
                “{current.quote}”
              </p>
              <footer className="mt-9">
                <p className="text-sm font-medium tracking-[0.2em] text-gold-400 uppercase">
                  {current.name}
                </p>
                <p className="mt-2 text-xs font-light tracking-wider text-cream-200/60">
                  {current.origin} · {current.stay}
                </p>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => go(index - 1, -1)}
            aria-label="Previous review"
            className="grid size-11 place-items-center rounded-full border border-ivory/20 text-cream-200 transition-colors duration-300 hover:border-gold-400 hover:text-gold-400"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex gap-2.5">
            {items.map((testimonial, dotIndex) => (
              <button
                key={testimonial.name}
                type="button"
                aria-label={`Show review ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                onClick={() => go(dotIndex, dotIndex > index ? 1 : -1)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  dotIndex === index
                    ? "w-8 bg-gold-500"
                    : "w-1.5 bg-ivory/25 hover:bg-ivory/50"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1, 1)}
            aria-label="Next review"
            className="grid size-11 place-items-center rounded-full border border-ivory/20 text-cream-200 transition-colors duration-300 hover:border-gold-400 hover:text-gold-400"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
