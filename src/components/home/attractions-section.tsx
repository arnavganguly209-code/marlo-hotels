import { MapPin } from "lucide-react";
import Image from "next/image";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { attractions } from "@/content/gallery";

export function AttractionsSection() {
  return (
    <section className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Nearby Attractions"
          title="Seven centuries at the doorstep"
          description="Palace squares, hilltop stupas and cities of artisans — the valley's greatest treasures sit minutes from the lobby."
        />

        <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {attractions.map((attraction) => (
            <StaggerItem key={attraction.name}>
              <article className="group h-full">
                <div className="img-hover-frame shadow-luxury-sm relative aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={attraction.image.src}
                    alt={attraction.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <span className="glass-dark absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[9px] font-medium tracking-[0.22em] text-gold-300 uppercase">
                    <MapPin className="size-3" />
                    {attraction.distance}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl font-medium text-forest-950">
                  {attraction.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed font-light text-charcoal-900/60">
                  {attraction.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
