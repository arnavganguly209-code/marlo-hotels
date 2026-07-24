import { ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { BreakfastEditorContent } from "@/lib/homepage-content";

export function BreakfastSection({
  content,
}: {
  content: BreakfastEditorContent;
}) {
  if (!content.enabled) return null;
  const image = content.images[0];

  return (
    <section className="overflow-hidden bg-ivory py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-forest-950 shadow-luxury lg:aspect-[5/6]">
          {image?.src ? (
            <Image
              src={image.src}
              alt={image.alt || content.heading}
              fill
              className="object-cover transition duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={100}
              unoptimized={image.src.startsWith("/media/")}
              style={{
                objectPosition: `${image.focalX ?? 50}% ${image.focalY ?? 50}%`,
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-forest-900 to-forest-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/50 via-transparent to-transparent" />
        </Reveal>

        <Reveal>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 text-balance md:text-5xl">
            {content.heading}
          </h2>
          <p className="mt-7 text-[15px] leading-relaxed font-light text-charcoal-900/70">
            {content.description}
          </p>
          {content.timings.length ? (
            <ul className="mt-10 space-y-4 border-y border-forest-800/10 py-6">
              {content.timings.map((timing) => (
                <li
                  key={timing.label}
                  className="flex items-start justify-between gap-6"
                >
                  <span className="flex items-center gap-2 text-sm text-forest-950">
                    <Clock className="size-4 text-gold-600" />
                    {timing.label}
                  </span>
                  <span className="text-sm font-light text-charcoal-900/65">
                    {timing.hours}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {content.buttonText ? (
            <Button asChild variant="outline-dark" size="lg" className="mt-10">
              <Link href={content.buttonLink || "/dining"}>
                {content.buttonText}
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
