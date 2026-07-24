import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { OffersEditorContent } from "@/lib/homepage-content";

export function OffersSection({
  content,
}: {
  content: OffersEditorContent;
}) {
  if (!content.enabled) return null;

  return (
    <section className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
        />
        <Stagger className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {content.items.map((offer) => (
            <StaggerItem key={offer.title}>
              <article className="group shadow-luxury-sm hover:shadow-luxury overflow-hidden rounded-2xl bg-white transition duration-700">
                <div className="relative aspect-[16/11] overflow-hidden bg-forest-950">
                  {offer.image?.src ? (
                    <Image
                      src={offer.image.src}
                      alt={offer.image.alt || offer.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized={offer.image.src.startsWith("/media/")}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/55 to-transparent" />
                </div>
                <div className="p-7">
                  <h3 className="font-display text-2xl text-forest-950">
                    {offer.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed font-light text-charcoal-900/65">
                    {offer.description}
                  </p>
                  {offer.buttonText ? (
                    <Link
                      href={offer.buttonLink || "/offers"}
                      className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase"
                    >
                      {offer.buttonText}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : null}
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
        {content.buttonText ? (
          <Reveal className="mt-14 text-center">
            <Button asChild variant="outline-dark" size="lg">
              <Link href={content.buttonLink || "/offers"}>
                {content.buttonText}
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
