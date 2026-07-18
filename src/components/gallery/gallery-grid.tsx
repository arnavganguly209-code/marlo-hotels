"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { galleryCategories, galleryImages } from "@/content/gallery";
import { cn } from "@/lib/utils";

export function GalleryGrid() {
  const [category, setCategory] =
    useState<(typeof galleryCategories)[number]>("All");

  const filtered =
    category === "All"
      ? galleryImages
      : galleryImages.filter((image) => image.category === category);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Filter gallery by category"
        className="flex flex-wrap justify-center gap-3"
      >
        {galleryCategories.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            onClick={() => setCategory(item)}
            className={cn(
              "rounded-full border px-6 py-2.5 text-[10px] font-medium tracking-[0.26em] uppercase transition-all duration-400",
              category === item
                ? "border-gold-500 bg-gold-500 text-charcoal-950 shadow-gold"
                : "border-forest-800/25 text-forest-900 hover:border-gold-500 hover:text-gold-600"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <motion.div layout className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((image) => (
            <motion.figure
              key={image.src}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="img-hover-frame group relative aspect-[4/3] overflow-hidden rounded-xl shadow-luxury-sm"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                unoptimized={image.src.startsWith("/media/")}
              />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-charcoal-950/90 to-transparent p-5 pt-14 transition-transform duration-500 group-hover:translate-y-0">
                <span className="text-[9px] font-medium tracking-[0.28em] text-gold-400 uppercase">
                  {image.category}
                </span>
                <p className="mt-1 text-sm font-light text-ivory">
                  {image.alt}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
