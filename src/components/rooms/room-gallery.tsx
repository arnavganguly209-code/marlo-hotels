"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { ImageAsset } from "@/types/content";
import { cn } from "@/lib/utils";

export function RoomGallery({ images }: { images: ImageAsset[] }) {
  const [active, setActive] = useState(0);
  const safe = images.filter((image) => image.src);
  if (!safe.length) {
    return (
      <div className="shadow-luxury relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl bg-forest-950 text-sm text-cream-200/70">
        Upload room photos in Orbit → Rooms inventory
      </div>
    );
  }

  return (
    <div>
      <div className="shadow-luxury relative aspect-[16/10] overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={safe[active]?.src}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={safe[active].src}
              alt={safe[active].alt}
              fill
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              unoptimized={safe[active].src.startsWith("/media/")}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {safe.length > 1 ? (
        <div
          role="tablist"
          aria-label="Room photographs"
          className="mt-4 grid grid-cols-3 gap-4"
        >
          {safe.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              role="tab"
              aria-selected={active === index}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg",
                active === index
                  ? "ring-2 ring-gold-500 ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="200px"
                className="object-cover"
                unoptimized={image.src.startsWith("/media/")}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
