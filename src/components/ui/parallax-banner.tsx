"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ParallaxBannerProps = {
  image: { src: string; alt: string };
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
};

export function ParallaxBanner({
  image,
  children,
  className,
  overlayClassName,
}: ParallaxBannerProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={ref}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-forest-950",
        className
      )}
    >
      <motion.div
        style={reduceMotion ? undefined : { y }}
        className="absolute -inset-y-[14%] inset-x-0"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div
        className={cn(
          "absolute inset-0 bg-charcoal-950/55",
          overlayClassName
        )}
      />
      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        {children}
      </div>
    </section>
  );
}
