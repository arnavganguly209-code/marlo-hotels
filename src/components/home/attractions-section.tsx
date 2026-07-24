import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageContent } from "@/lib/homepage-content";

export function AttractionsSection({
  content,
}: {
  content: HomepageContent["attractions"];
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

        <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {content.items.map((attraction) => {
            const imageSrc = attraction.image?.src || "";
            const badge = attraction.badge || attraction.distance;
            return (
              <StaggerItem key={attraction.name}>
                <article className="group h-full">
                  <div className="img-hover-frame shadow-luxury-sm relative aspect-[4/5] overflow-hidden rounded-xl bg-forest-950">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={attraction.image.alt || attraction.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover"
                        quality={100}
                        unoptimized={imageSrc.startsWith("/media/")}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-forest-900 to-forest-950" />
                    )}
                    {badge ? (
                      <span className="glass-dark absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[9px] font-medium tracking-[0.22em] text-gold-300 uppercase">
                        <MapPin className="size-3" />
                        {badge}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-display mt-5 text-xl font-medium text-forest-950">
                    {attraction.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed font-light text-charcoal-900/60">
                    {attraction.description}
                  </p>
                  {attraction.distance && attraction.badge ? (
                    <p className="mt-2 text-xs font-light text-charcoal-900/50">
                      {attraction.distance}
                    </p>
                  ) : null}
                  {attraction.buttonText ? (
                    <Link
                      href={attraction.buttonLink || "/experiences"}
                      className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase"
                    >
                      {attraction.buttonText}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : null}
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
