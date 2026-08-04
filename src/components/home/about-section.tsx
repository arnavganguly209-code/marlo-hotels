import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { AboutEditorContent } from "@/lib/homepage-content";

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

export function AboutSection({ content }: { content: AboutEditorContent }) {
  if (!content.enabled) return null;

  const primary = content.images[0];
  const secondary = content.images[1] ?? primary;
  if (!primary || !secondary) return null;

  return (
    <section id="about" className="overflow-hidden bg-ivory py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-2 lg:gap-24">
        {/* Offset image composition */}
        <div className="relative">
          <Reveal direction="right">
            <div className="img-hover-frame shadow-luxury relative aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={primary.src}
                alt={primary.alt}
                fill
                quality={85}
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: objectPosition(primary) }}
                unoptimized={primary.src.startsWith("/media/")}
              />
            </div>
          </Reveal>
          <Reveal
            direction="up"
            delay={0.25}
            className="absolute -right-4 -bottom-10 w-1/2 md:-right-8"
          >
            <div className="img-hover-frame shadow-luxury relative aspect-square overflow-hidden rounded-xl border-6 border-ivory">
              <Image
                src={secondary.src}
                alt={secondary.alt}
                fill
                quality={85}
                loading="lazy"
                sizes="25vw"
                className="object-cover"
                style={{ objectPosition: objectPosition(secondary) }}
                unoptimized={secondary.src.startsWith("/media/")}
              />
            </div>
          </Reveal>
          <Reveal
            delay={0.4}
            className="glass-light shadow-luxury-sm absolute -bottom-6 left-6 hidden rounded-xl px-6 py-4 md:block"
          >
            <p className="font-display stat-figure text-[3.35rem] text-forest-900 md:text-6xl">
              {content.badgeValue}
            </p>
            <p className="stat-caption mt-1.5 text-gold-600">
              {content.badgeLabel}
            </p>
          </Reveal>
        </div>

        {/* Copy */}
        <div>
          <Reveal>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 className="font-display mt-5 text-[2.45rem] leading-[1.08] font-semibold tracking-[-0.018em] text-forest-950 text-balance sm:text-5xl lg:text-[3.55rem] lg:leading-[1.06]">
              <HighlightedHeading
                heading={content.heading}
                highlightedText={content.highlightedText}
              />
            </h2>
            {[content.description, ...content.paragraphs.slice(1)].map((paragraph, index) => (
              <p
                key={paragraph}
                className={`${index === 0 ? "mt-8" : "mt-5"} text-[15.5px] leading-[1.8] font-normal tracking-[0.014em] text-charcoal-900/70 sm:text-base sm:leading-[1.82]`}
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="about-stats mt-14 grid grid-cols-2 lg:grid-cols-4">
              {content.stats.map((stat) => (
                <div key={stat.label} className="about-stat">
                  <dd className="about-stat-value font-display">{stat.value}</dd>
                  <dt className="about-stat-label">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.25}>
            <Button asChild variant="forest" size="lg" className="mt-12">
              <Link href={content.buttonLink!}>
                {content.buttonText}
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
