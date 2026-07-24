import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { WellnessEditorContent } from "@/lib/homepage-content";
import { formatCurrency } from "@/lib/utils";

function objectPosition(image: { focalX?: number; focalY?: number }) {
  return `${image.focalX ?? 50}% ${image.focalY ?? 50}%`;
}

function HighlightedHeading({
  heading,
  highlightedText,
}: {
  heading: string;
  highlightedText?: string;
}) {
  if (!highlightedText || !heading.includes(highlightedText)) {
    return <>{heading}</>;
  }
  const index = heading.indexOf(highlightedText);
  return (
    <>
      {heading.slice(0, index)}
      <em className="text-gold-600">{highlightedText}</em>
      {heading.slice(index + highlightedText.length)}
    </>
  );
}

export function WellnessSection({
  content,
}: {
  content: WellnessEditorContent;
}) {
  if (!content.enabled) return null;

  const primary = content.images[0];
  const secondary = content.images[1] ?? primary;

  return (
    <section className="overflow-hidden bg-cream-100 py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-2 lg:gap-24">
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 className="font-display mt-5 text-4xl leading-[1.08] font-medium text-forest-950 text-balance md:text-5xl">
              <HighlightedHeading
                heading={content.heading}
                highlightedText={content.highlightedText}
              />
            </h2>
            <p className="mt-7 text-[15px] leading-relaxed font-light text-charcoal-900/70">
              {content.description}
            </p>
          </Reveal>

          {content.treatments.length ? (
            <Reveal delay={0.15}>
              <ul className="mt-10 divide-y divide-forest-800/10 border-y border-forest-800/10">
                {content.treatments.map((treatment) => (
                  <li
                    key={treatment.name}
                    className="flex items-baseline justify-between gap-6 py-5"
                  >
                    <div>
                      <h3 className="font-display text-xl font-medium text-forest-900">
                        {treatment.name}
                      </h3>
                      <p className="mt-1 text-xs font-light tracking-wider text-charcoal-900/55 uppercase">
                        {treatment.duration}
                      </p>
                    </div>
                    <span className="font-display shrink-0 text-xl text-gold-600">
                      {formatCurrency(treatment.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          <Reveal delay={0.25}>
            <Button asChild variant="forest" size="lg" className="mt-10">
              <Link href={content.buttonLink!}>
                {content.buttonText}
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="relative order-1 lg:order-2">
          <Reveal direction="left">
            <div className="img-hover-frame shadow-luxury relative aspect-[4/5] overflow-hidden rounded-xl bg-forest-950">
              {primary?.src ? (
                <Image
                  src={primary.src}
                  alt={primary.alt}
                  fill
                  quality={100}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  style={{ objectPosition: objectPosition(primary) }}
                  unoptimized={primary.src.startsWith("/media/")}
                />
              ) : null}
            </div>
          </Reveal>
          {secondary?.src ? (
            <Reveal
              delay={0.25}
              className="absolute -bottom-10 -left-4 w-1/2 md:-left-8"
            >
              <div className="img-hover-frame shadow-luxury relative aspect-[4/3] overflow-hidden rounded-xl border-6 border-cream-100">
                <Image
                  src={secondary.src}
                  alt={secondary.alt}
                  fill
                  quality={100}
                  sizes="25vw"
                  className="object-cover"
                  style={{ objectPosition: objectPosition(secondary) }}
                  unoptimized={secondary.src.startsWith("/media/")}
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}
