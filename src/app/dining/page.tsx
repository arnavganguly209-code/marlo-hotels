import { ArrowRight, Clock, MapPin, Shirt } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getRestaurants } from "@/content/dining";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dining",
  description:
    "Three venues, one philosophy — contemporary Himalayan tasting menus at Amaya, all-day Mediterranean at The Terrace, and rare pours at Bar 1959. Fine dining at Marlo Hotels, Kathmandu.",
  path: "/dining",
});

export default async function DiningPage() {
  const [restaurants, hero] = await Promise.all([
    getRestaurants(),
    resolveSiteImage("page.dining.hero", {
      src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2400&auto=format&fit=crop",
      alt: "Amaya's candlelit dining room",
    }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Dining Experience"
        title="Tables worth travelling for"
        description="The Himalayan larder, treated with the world's finest technique — from seven-course tasting journeys to midnight cocktails on vinyl."
        image={{
          src: hero.src,
          alt: hero.alt,
          objectPosition: hero.objectPosition,
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dining", href: "/dining" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl space-y-24 px-5 md:space-y-32 md:px-8">
          {restaurants.map((restaurant, index) => {
            const reversed = index % 2 === 1;
            return (
              <article
                key={restaurant.slug}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
              >
                <Reveal
                  direction={reversed ? "left" : "right"}
                  className={reversed ? "lg:order-2" : ""}
                >
                  <div className="img-hover-frame shadow-luxury relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={restaurant.images[0].src}
                      alt={restaurant.images[0].alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      unoptimized={restaurant.images[0].src.startsWith("/media/")}
                    />
                  </div>
                </Reveal>

                <Reveal
                  direction={reversed ? "right" : "left"}
                  delay={0.15}
                  className={reversed ? "lg:order-1" : ""}
                >
                  <p className="eyebrow">{restaurant.cuisine}</p>
                  <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
                    {restaurant.name}
                  </h2>
                  <p className="font-display mt-3 text-xl text-gold-600 italic">
                    {restaurant.tagline}
                  </p>
                  <p className="mt-6 text-[15px] leading-relaxed font-light text-charcoal-900/70">
                    {restaurant.shortDescription}
                  </p>

                  <dl className="mt-8 space-y-3 border-t border-forest-800/10 pt-7 text-sm font-light text-charcoal-900/70">
                    <div className="flex items-center gap-3">
                      <Clock className="size-4 text-gold-600" />
                      <dt className="sr-only">Hours</dt>
                      <dd>{restaurant.hours}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shirt className="size-4 text-gold-600" />
                      <dt className="sr-only">Dress code</dt>
                      <dd>{restaurant.dressCode}</dd>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-gold-600" />
                      <dt className="sr-only">Location</dt>
                      <dd>{restaurant.location}</dd>
                    </div>
                  </dl>

                  <Button asChild variant="forest" size="lg" className="mt-9">
                    <Link href={`/dining/${restaurant.slug}`}>
                      Explore {restaurant.name}
                      <ArrowRight />
                    </Link>
                  </Button>
                </Reveal>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
