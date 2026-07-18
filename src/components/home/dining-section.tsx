import { ArrowRight, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Restaurant } from "@/types/content";

export function DiningSection({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <section className="bg-ivory py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Dining Experience"
          title="Tables worth travelling for"
          description="Three venues, one philosophy — the Himalayan larder treated with the world's finest technique, from tasting menus to midnight cocktails."
        />

        <Stagger className="mt-16 grid gap-8 lg:grid-cols-3">
          {restaurants.map((restaurant, index) => (
            <StaggerItem
              key={restaurant.slug}
              className={index === 0 ? "lg:row-span-2" : ""}
            >
              <article className="group relative h-full overflow-hidden rounded-xl shadow-luxury-sm transition-shadow duration-700 hover:shadow-luxury">
                <div
                  className={`img-hover-frame relative ${
                    index === 0 ? "aspect-[3/4] lg:h-full lg:aspect-auto" : "aspect-[16/10]"
                  }`}
                >
                  <Image
                    src={restaurant.images[0].src}
                    alt={restaurant.images[0].alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/95 via-charcoal-950/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-8">
                  <p className="text-[9px] font-medium tracking-[0.3em] text-gold-400 uppercase">
                    {restaurant.cuisine}
                  </p>
                  <h3 className="font-display mt-2 text-3xl font-medium text-ivory">
                    <Link
                      href={`/dining/${restaurant.slug}`}
                      className="after:absolute after:inset-0 focus-visible:outline-none"
                    >
                      {restaurant.name}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed font-light text-cream-200/80">
                    {restaurant.tagline}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-light text-cream-200/65">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3 text-gold-500" />
                      {restaurant.hours}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3 text-gold-500" />
                      {restaurant.location}
                    </span>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center">
          <Button asChild variant="outline-dark" size="lg">
            <Link href="/dining">
              Discover All Venues
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
