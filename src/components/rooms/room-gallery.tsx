"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import type { ImageAsset } from "@/types/content";
import { cn } from "@/lib/utils";

export function RoomGallery({ images }: { images: ImageAsset[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="shadow-luxury relative aspect-[16/10] overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[active].src}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[active].src}
              alt={images[active].alt}
              fill
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
              unoptimized={images[active].src.startsWith("/media/")}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        role="tablist"
        aria-label="Room photographs"
        className="mt-4 grid grid-cols-3 gap-4"
      >
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={image.alt}
            onClick={() => setActive(index)}
            className={cn(
              "img-hover-frame relative aspect-[4/3] overflow-hidden rounded-lg transition-all duration-500",
              index === active
                ? "ring-2 ring-gold-500 ring-offset-2 ring-offset-ivory"
                : "opacity-75 hover:opacity-100"
            )}
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes="22vw"
              className="object-cover"
              unoptimized={image.src.startsWith("/media/")}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
