import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarHeart,
  Gift,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoyalImageFrame } from "@/components/shared/royal-image-frame";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { splitParagraphs } from "@/lib/page-studio-content";
import type { StudioSectionData } from "@/lib/orbit/page-studio";

export type OfferCardData = {
  title: string;
  description: string;
  tagline?: string;
  category?: string;
  perks?: string[];
  code?: string;
  discount?: string;
  validity?: string;
};

export type OfferImage = {
  src: string;
  alt: string;
};

const PRIVILEGES = [
  {
    title: "Book Direct",
    description: "Preferential terms and clearer confirmation when you reserve with us.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible Timing",
    description: "Seasonal windows composed around your travel dates — not a rigid catalogue.",
    icon: CalendarHeart,
  },
  {
    title: "Quiet Luxuries",
    description: "Spa rituals, dining moments and room upgrades arranged with discretion.",
    icon: Sparkles,
  },
  {
    title: "Private Codes",
    description: "Apply your offer at checkout when a code is provided — simply and privately.",
    icon: Ticket,
  },
] as const;

export function OffersShowcase({
  offers,
  images,
  sections,
  privileges,
}: {
  offers: OfferCardData[];
  images: {
    editorial: OfferImage;
    accent: OfferImage;
    pair?: OfferImage;
    cta?: OfferImage;
  };
  sections: Record<
    "intro" | "editorial" | "listing" | "privileges" | "accent" | "pair" | "cta",
    StudioSectionData
  >;
  privileges: OfferCardData[];
}) {
  const cards = offers.slice(0, 6);
  const privilegeCards = privileges.slice(0, 4);

  return (
    <>
      {/* Intro */}
      {sections.intro.enabled !== false ? <section className="bg-ivory py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow gold-rule justify-center">{sections.intro.eyebrow}</p>
            <h2 className="font-display mt-6 text-[2.45rem] leading-[1.1] font-semibold tracking-[-0.018em] text-balance text-forest-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.06]">
              {sections.intro.heading}
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[15.5px] leading-[1.85] font-light tracking-[0.014em] text-charcoal-900/70 sm:text-base">
              {sections.intro.description}
            </p>
          </Reveal>
        </div>
      </section> : null}

      {/* Editorial — one clear gallery frame */}
      {sections.editorial.enabled !== false ? <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:gap-16 md:px-8 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="left">
            <RoyalImageFrame
              image={images.editorial}
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
          </Reveal>
          <Reveal direction="right">
            <p className="eyebrow">{sections.editorial.eyebrow}</p>
            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.02em] text-forest-950 md:text-5xl">
              {sections.editorial.heading}
            </h2>
            {splitParagraphs(sections.editorial.description).map((paragraph, index) => (
              <p key={paragraph} className={`${index ? "mt-6" : "mt-8"} text-[15.5px] leading-[1.85] font-light text-charcoal-900/70`}>
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section> : null}

      {/* Featured offers — text-forward, no photo clutter */}
      {sections.listing.enabled !== false ? <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">{sections.listing.eyebrow}</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              {sections.listing.heading}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              {sections.listing.description}
            </p>
          </Reveal>

          {cards.length ? (
            <Stagger
              stagger={0.05}
              className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6"
            >
              {cards.map((offer) => (
                <StaggerItem key={offer.title}>
                  <article className="group flex h-full flex-col rounded-2xl border border-forest-800/10 bg-cream-50/70 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold-500/35 hover:bg-white hover:shadow-luxury-sm md:p-8">
                    <div className="flex items-start justify-between gap-3">
                      {offer.category ? (
                        <span className="text-[10px] font-semibold tracking-[0.22em] text-gold-700 uppercase">
                          {offer.category}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold tracking-[0.22em] text-gold-700 uppercase">
                          Offer
                        </span>
                      )}
                      {offer.discount ? (
                        <span className="font-display text-lg font-medium text-forest-900 italic">
                          {offer.discount}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="font-display mt-4 text-xl font-medium text-forest-950 transition-colors duration-500 group-hover:text-gold-800 md:text-2xl">
                      {offer.title}
                    </h3>
                    {offer.tagline ? (
                      <p className="mt-2 text-xs tracking-[0.12em] text-charcoal-900/45 uppercase">
                        {offer.tagline}
                      </p>
                    ) : null}
                    <span className="mt-4 block h-px w-10 bg-gold-500/50 transition-all duration-500 group-hover:w-16" />
                    <p className="mt-5 flex-1 text-sm leading-relaxed font-light text-charcoal-900/65">
                      {offer.description}
                    </p>
                    {offer.perks?.length ? (
                      <ul className="mt-5 space-y-2">
                        {offer.perks.slice(0, 3).map((perk) => (
                          <li
                            key={perk}
                            className="flex items-start gap-2 text-xs leading-relaxed font-light text-charcoal-900/60"
                          >
                            <Gift className="mt-0.5 size-3.5 shrink-0 text-gold-600" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-7 flex items-center justify-between gap-3 border-t border-forest-800/10 pt-5">
                      {offer.code ? (
                        <span className="text-[10px] font-medium tracking-[0.2em] text-forest-800 uppercase">
                          Code · {offer.code}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium tracking-[0.2em] text-forest-800 uppercase">
                          Book Direct
                        </span>
                      )}
                      <Link
                        href={
                          offer.code
                            ? `/booking?promo=${encodeURIComponent(offer.code)}`
                            : "/rooms"
                        }
                        className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.22em] text-gold-700 uppercase transition-colors hover:text-gold-600"
                      >
                        Reserve
                        <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                      </Link>
                    </div>
                    {offer.validity ? (
                      <p className="mt-3 text-[11px] font-light text-charcoal-900/40 italic">
                        {offer.validity}
                      </p>
                    ) : null}
                  </article>
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <Reveal className="mx-auto mt-14 max-w-xl text-center">
              <p className="text-[15.5px] leading-[1.85] font-light text-charcoal-900/65">
                Seasonal offers appear here when published. Meanwhile, explore rooms and enquire for
                current direct privileges.
              </p>
              <Button asChild variant="outline-dark" size="lg" className="mt-8">
                <Link href="/rooms">Explore Rooms</Link>
              </Button>
            </Reveal>
          )}
        </div>
      </section> : null}

      {/* Why book direct */}
      {sections.privileges.enabled !== false ? <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">{sections.privileges.eyebrow}</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              {sections.privileges.heading}
            </h2>
            {sections.privileges.description ? (
              <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
                {sections.privileges.description}
              </p>
            ) : null}
          </Reveal>

          <Stagger
            stagger={0.04}
            className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:mt-16"
          >
            {privilegeCards.map((item, index) => {
              const Icon = PRIVILEGES[index % PRIVILEGES.length].icon;
              return (
                <StaggerItem key={item.title}>
                  <div className="flex h-full flex-col rounded-2xl border border-forest-800/10 bg-ivory/90 px-5 py-7 transition-colors duration-500 hover:border-gold-500/30 hover:bg-white md:px-6 md:py-8">
                    <span className="grid size-11 place-items-center rounded-full border border-gold-500/35 text-gold-700">
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <h3 className="font-display mt-5 text-lg font-medium text-forest-950 md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed font-light text-charcoal-900/65">
                      {item.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section> : null}

      {/* Accent frame + optional pair */}
      {sections.accent.enabled !== false ? <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="eyebrow">{sections.accent.eyebrow}</p>
              <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 md:text-5xl">
                {sections.accent.heading}
              </h2>
              <p className="mt-8 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
                {sections.accent.description}
              </p>
              <Link
                href={sections.accent.buttonLink || "/contact?subject=Offer%20enquiry"}
                className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-forest-950 uppercase transition-colors hover:text-gold-700"
              >
                {sections.accent.buttonText || "Speak with reservations"} <ArrowRight className="size-3.5" />
              </Link>
            </Reveal>
            <Reveal direction="left" className="order-first lg:order-last">
              <RoyalImageFrame
                image={images.accent}
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </Reveal>
          </div>

          {sections.pair.enabled !== false && images.pair?.src ? (
            <Reveal className="mx-auto mt-16 max-w-3xl lg:mt-20">
              <RoyalImageFrame
                image={images.pair}
                sizes="(max-width: 1024px) 100vw, 56vw"
              />
            </Reveal>
          ) : null}
        </div>
      </section> : null}

      {/* CTA */}
      {sections.cta.enabled !== false ? <section className="relative overflow-hidden bg-forest-950 py-28 md:py-36">
        {images.cta?.src ? (
          <div className="absolute inset-0">
            <Image
              src={images.cta.src}
              alt=""
              fill
              quality={100}
              sizes="100vw"
              className="object-cover object-center opacity-[0.2]"
              unoptimized={
                images.cta.src.startsWith("/media/") || images.cta.src.includes("?")
              }
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/88 to-forest-950/72" />
          </div>
        ) : null}

        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow text-gold-400 gold-rule justify-center">{sections.cta.eyebrow}</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-ivory md:text-5xl lg:text-[3.25rem]">
              {sections.cta.heading}
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.85] font-light text-cream-200/80">
              {sections.cta.description}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Button asChild variant="gold" size="lg">
                <Link href={sections.cta.buttonLink || "/rooms"}>{sections.cta.buttonText || "Explore Rooms & Book"}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact?subject=Offer%20enquiry">Enquire</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section> : null}
    </>
  );
}
