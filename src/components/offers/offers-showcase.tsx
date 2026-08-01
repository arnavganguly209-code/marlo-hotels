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
}: {
  offers: OfferCardData[];
  images: {
    editorial: OfferImage;
    accent: OfferImage;
    pair?: OfferImage;
    cta?: OfferImage;
  };
}) {
  const cards = offers.slice(0, 6);

  return (
    <>
      {/* Intro */}
      <section className="bg-ivory py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow gold-rule justify-center">Direct Privileges</p>
            <h2 className="font-display mt-6 text-[2.45rem] leading-[1.1] font-semibold tracking-[-0.018em] text-balance text-forest-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.06]">
              Offers Without Noise
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[15.5px] leading-[1.85] font-light tracking-[0.014em] text-charcoal-900/70 sm:text-base">
              Seasonal privileges and composed packages for guests who book direct. Each offer is
              considered — never crowded with promotions — and refined quietly for your stay in the
              valley.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Editorial — one clear gallery frame */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:gap-16 md:px-8 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="left">
            <RoyalImageFrame
              image={images.editorial}
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
          </Reveal>
          <Reveal direction="right">
            <p className="eyebrow">Stay With Intention</p>
            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.02em] text-forest-950 md:text-5xl">
              Considered Ways to Arrive
            </h2>
            <p className="mt-8 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              From advance purchase to wellness escapes, every privilege is shaped for guests who
              prefer clarity over clutter. Terms remain private; hospitality remains unhurried.
            </p>
            <p className="mt-6 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Select a package that suits your journey, or enquire and we will compose something
              quieter still — rooms, rituals and table, held together.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured offers — text-forward, no photo clutter */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">This Season</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Featured Privileges
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Book direct to secure current terms. Where a code is shown, apply it at checkout.
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
      </section>

      {/* Why book direct */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">Why Direct</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Privileges Held Quietly
            </h2>
          </Reveal>

          <Stagger
            stagger={0.04}
            className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:mt-16"
          >
            {PRIVILEGES.map((item) => {
              const Icon = item.icon;
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
      </section>

      {/* Accent frame + optional pair */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="eyebrow">Composed for Two — or the Family</p>
              <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 md:text-5xl">
                Packages Shaped Around Your Stay
              </h2>
              <p className="mt-8 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
                Honeymoon quiet, wellness mornings, or an advance-purchase rate that simply makes
                room for longer — each package is held with the same care as your suite and table.
              </p>
              <Link
                href="/contact?subject=Offer%20enquiry"
                className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-forest-950 uppercase transition-colors hover:text-gold-700"
              >
                Speak with reservations <ArrowRight className="size-3.5" />
              </Link>
            </Reveal>
            <Reveal direction="left" className="order-first lg:order-last">
              <RoyalImageFrame
                image={images.accent}
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </Reveal>
          </div>

          {images.pair?.src ? (
            <Reveal className="mx-auto mt-16 max-w-3xl lg:mt-20">
              <RoyalImageFrame
                image={images.pair}
                sizes="(max-width: 1024px) 100vw, 56vw"
              />
            </Reveal>
          ) : null}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-forest-950 py-28 md:py-36">
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
            <p className="eyebrow text-gold-400 gold-rule justify-center">Book Direct</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-ivory md:text-5xl lg:text-[3.25rem]">
              Continue to Rooms
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.85] font-light text-cream-200/80">
              Select a room, complete your booking, and apply your offer code at checkout when one
              is provided. Our team remains available for private arrangements.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Button asChild variant="gold" size="lg">
                <Link href="/rooms">Explore Rooms & Book</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact?subject=Offer%20enquiry">Enquire</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
