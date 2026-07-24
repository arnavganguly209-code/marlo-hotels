import { ArrowRight, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import type { LocationEditorContent } from "@/lib/homepage-content";

export function LocationSection({
  content,
}: {
  content: LocationEditorContent;
}) {
  if (!content.enabled) return null;

  return (
    <section className="bg-cream-100 py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 md:text-5xl">
            {content.heading}
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed font-light text-charcoal-900/70">
            {content.description}
          </p>
          <div className="mt-8 space-y-4 text-sm text-charcoal-900/75">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-600" />
              {content.address}
            </p>
            {content.phone ? (
              <p className="flex items-center gap-3">
                <Phone className="size-4 text-gold-600" />
                <a href={`tel:${content.phone.replace(/\s/g, "")}`}>
                  {content.phone}
                </a>
              </p>
            ) : null}
          </div>
          {content.buttonText ? (
            <Button asChild variant="outline-dark" size="lg" className="mt-10">
              <Link
                href={content.buttonLink || content.mapEmbedUrl || "/contact"}
                target={content.mapEmbedUrl ? "_blank" : undefined}
              >
                {content.buttonText}
                <ArrowRight />
              </Link>
            </Button>
          ) : null}
        </Reveal>
        <Reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-forest-950 shadow-luxury">
          {content.mapEmbedUrl ? (
            <iframe
              title="Marlo Hotels location"
              src={content.mapEmbedUrl}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-forest-900 to-forest-950 px-8 text-center">
              <p className="font-display text-2xl text-ivory">{content.address}</p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
