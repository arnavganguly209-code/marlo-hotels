import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ParallaxBanner } from "@/components/ui/parallax-banner";
import { Reveal } from "@/components/ui/reveal";
import type { PoolEditorContent } from "@/lib/homepage-content";

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
      <em className="text-gold-300">{highlightedText}</em>
      {heading.slice(index + highlightedText.length)}
    </>
  );
}

function overlayClassName(overlay: PoolEditorContent["overlay"]) {
  if (overlay === "Light") {
    return "bg-gradient-to-b from-charcoal-950/40 via-charcoal-950/20 to-charcoal-950/50";
  }
  if (overlay === "Dark") {
    return "bg-gradient-to-b from-charcoal-950/80 via-charcoal-950/55 to-charcoal-950/85";
  }
  return "bg-gradient-to-b from-charcoal-950/60 via-charcoal-950/35 to-charcoal-950/70";
}

export function PoolBanner({ content }: { content: PoolEditorContent }) {
  if (!content.enabled) return null;

  return (
    <ParallaxBanner
      image={{
        src: content.image.src,
        alt: content.image.alt,
        focalX: content.image.focalX,
        focalY: content.image.focalY,
      }}
      className="min-h-[70vh] py-32"
      overlayClassName={overlayClassName(content.overlay)}
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow gold-rule justify-center">{content.eyebrow}</p>
        <h2 className="font-display mt-6 text-4xl leading-[1.08] font-medium text-ivory text-balance md:text-6xl">
          <HighlightedHeading
            heading={content.heading}
            highlightedText={content.highlightedText}
          />
        </h2>
        <p className="mx-auto mt-7 max-w-lg text-[15px] leading-relaxed font-light text-cream-200/85">
          {content.description}
        </p>
        <Button asChild variant="outline" size="lg" className="mt-10">
          <Link href={content.buttonLink!}>
            {content.buttonText}
            <ArrowRight />
          </Link>
        </Button>
      </Reveal>
    </ParallaxBanner>
  );
}
