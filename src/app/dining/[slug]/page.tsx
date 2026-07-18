import { ArrowRight, Clock, MapPin, Shirt, Wine } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getRestaurantBySlug, getRestaurants } from "@/content/dining";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const restaurants = await getRestaurants();
  return restaurants.map((restaurant) => ({ slug: restaurant.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return {};
  return buildMetadata({
    title: `${restaurant.name} — ${restaurant.cuisine}`,
    description: restaurant.shortDescription,
    path: `/dining/${restaurant.slug}`,
    image: restaurant.images[0].src,
  });
}

export default async function RestaurantPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: restaurant.name,
          servesCuisine: restaurant.cuisine,
          description: restaurant.shortDescription,
          image: restaurant.images.map((image) => image.src),
          url: `${siteConfig.url}/dining/${restaurant.slug}`,
          parentOrganization: { "@type": "Hotel", name: siteConfig.name },
        }}
      />

      <PageHero
        eyebrow={restaurant.cuisine}
        title={restaurant.name}
        description={restaurant.tagline}
        image={restaurant.images[0]}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dining", href: "/dining" },
          { label: restaurant.name, href: `/dining/${restaurant.slug}` },
        ]}
      />

      {/* Narrative + essentials */}
      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <p className="eyebrow">The Restaurant</p>
            <h2 className="font-display mt-4 text-3xl font-medium text-forest-950 md:text-4xl">
              {restaurant.tagline}
            </h2>
            {restaurant.description.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-6 text-[15px] leading-relaxed font-light text-charcoal-900/70"
              >
                {paragraph}
              </p>
            ))}
            {restaurant.wine ? (
              <div className="mt-10 flex gap-4 rounded-xl border border-gold-500/25 bg-cream-50 p-7">
                <Wine className="size-6 shrink-0 text-gold-600" />
                <div>
                  <h3 className="font-display text-xl font-medium text-forest-950">
                    The Cellar
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed font-light text-charcoal-900/70">
                    {restaurant.wine}
                  </p>
                </div>
              </div>
            ) : null}
          </Reveal>

          <aside>
            <div className="lg:sticky lg:top-28">
              <Reveal direction="left">
                <div className="glass-light shadow-luxury rounded-xl p-8">
                  <h3 className="font-display text-2xl font-medium text-forest-950">
                    Essentials
                  </h3>
                  <dl className="mt-6 space-y-4 text-sm font-light text-charcoal-900/75">
                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 size-4 shrink-0 text-gold-600" />
                      <div>
                        <dt className="text-[9px] tracking-[0.28em] text-charcoal-900/50 uppercase">
                          Hours
                        </dt>
                        <dd className="mt-1">{restaurant.hours}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shirt className="mt-0.5 size-4 shrink-0 text-gold-600" />
                      <div>
                        <dt className="text-[9px] tracking-[0.28em] text-charcoal-900/50 uppercase">
                          Dress Code
                        </dt>
                        <dd className="mt-1">{restaurant.dressCode}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-gold-600" />
                      <div>
                        <dt className="text-[9px] tracking-[0.28em] text-charcoal-900/50 uppercase">
                          Location
                        </dt>
                        <dd className="mt-1">{restaurant.location}</dd>
                      </div>
                    </div>
                  </dl>
                  <Button asChild variant="gold" size="md" className="mt-8 w-full">
                    <Link
                      href={`/contact?subject=Table at ${restaurant.name}`}
                    >
                      Reserve A Table
                      <ArrowRight />
                    </Link>
                  </Button>
                  <p className="mt-4 text-center text-[11px] font-light text-charcoal-900/55">
                    Or call {siteConfig.contact.reservations}
                  </p>
                </div>
              </Reveal>
            </div>
          </aside>
        </div>
      </section>

      {/* Chef */}
      <section className="bg-forest-950 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 md:px-8 lg:grid-cols-5">
          <Reveal direction="right" className="lg:col-span-2">
            <div className="img-hover-frame shadow-luxury relative aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={restaurant.chef.image.src}
                alt={restaurant.chef.image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal direction="left" delay={0.15} className="lg:col-span-3">
            <p className="eyebrow">{restaurant.chef.title}</p>
            <h2 className="font-display mt-4 text-4xl font-medium text-ivory md:text-5xl">
              {restaurant.chef.name}
            </h2>
            <p className="mt-7 text-[15px] leading-relaxed font-light text-cream-200/80">
              {restaurant.chef.bio}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Menu */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <SectionHeading
            eyebrow="The Menu"
            title="A taste of the kitchen"
            description="A selection from the current menu — dishes change with the mountain seasons."
          />

          <Stagger className="mt-16 space-y-14">
            {restaurant.menu.map((section) => (
              <StaggerItem key={section.title}>
                <h3 className="gold-rule font-display justify-center text-2xl font-medium text-forest-950">
                  {section.title}
                </h3>
                <ul className="mt-8 space-y-7">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <div className="flex items-baseline gap-3">
                        <h4 className="font-display shrink-0 text-xl font-medium text-forest-900">
                          {item.name}
                        </h4>
                        <span
                          aria-hidden="true"
                          className="w-full border-b border-dotted border-forest-800/25"
                        />
                        <span className="font-display shrink-0 text-lg text-gold-600">
                          {item.price}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-light text-charcoal-900/60 italic">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
