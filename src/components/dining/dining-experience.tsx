import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Baby,
  Coffee,
  CookingPot,
  HeartHandshake,
  Leaf,
  Sparkles,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoyalImageFrame } from "@/components/shared/royal-image-frame";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

const IMAGES = {
  memorable: {
    src: "/images/dining/seating-palm.png",
    alt: "Wooden dining tables and lattice chairs beside a palm in the Marlo restaurant",
  },
  experience: {
    src: "/images/dining/dining-hall.png",
    alt: "Bright hotel dining hall with service counter and Himalayan artwork",
  },
  gallery: [
    {
      src: "/images/dining/seating-palm.png",
      alt: "Peaceful indoor seating with warm timber and cream walls",
    },
    {
      src: "/images/dining/breakfast-buffet.png",
      alt: "Breakfast buffet with chafing dishes and stacked white china",
    },
    {
      src: "/images/dining/dining-hall.png",
      alt: "Restaurant floor with wooden tables and pendant lighting",
    },
    {
      src: "/images/dining/bar-lounge.png",
      alt: "Bar counter with wooden slats and beverage service",
    },
    {
      src: "/images/dining/buffet-service.png",
      alt: "Buffet service station with fresh plates and warmers",
    },
  ],
  cta: {
    src: "/images/dining/bar-lounge.png",
    alt: "",
  },
} as const;

const HIGHLIGHTS = [
  {
    title: "Fresh Daily Breakfast",
    description:
      "A considered morning table — eggs to order, regional breads, orchard fruit and coffee roasted for altitude.",
  },
  {
    title: "International Cuisine",
    description:
      "Familiar favourites and contemporary plates, composed with quiet precision for travellers and locals alike.",
  },
  {
    title: "Local Nepali Specialties",
    description:
      "Himalayan flavours treated with care — spice, grain and seasonal market produce in generous hospitality.",
  },
  {
    title: "Fresh Coffee & Tea",
    description:
      "Properly pulled espresso, leaf teas and afternoon refreshment for unhurried pauses between the day’s plans.",
  },
  {
    title: "Comfortable Indoor Seating",
    description:
      "Warm timber, soft light and tables spaced for conversation — a dining room that never feels crowded.",
  },
  {
    title: "Premium Hospitality",
    description:
      "Attentive service without interruption — dietary notes remembered, pacing soft-spoken and exact.",
  },
] as const;

const EXPERIENCE_POINTS = [
  {
    title: "Comfortable Seating",
    description:
      "Solid wood tables and cushioned chairs arranged for ease — long lunches and quiet dinners equally welcome.",
  },
  {
    title: "Bright Dining Space",
    description:
      "Cream walls, polished floors and warm recessed light keep the room open, calm and inviting all day.",
  },
  {
    title: "Fresh Ingredients",
    description:
      "Produce chosen for the day, prepared in-house — flavour first, spectacle never required.",
  },
  {
    title: "Personalized Service",
    description:
      "From first coffee to last course, the team listens and adjusts — allergies, preferences and pace included.",
  },
  {
    title: "Relaxed Atmosphere",
    description:
      "No rush at the table. Soft conversation, considered plating and a room that holds stillness well.",
  },
] as const;

const WHY = [
  { title: "Fresh Ingredients", icon: Leaf },
  { title: "Daily Prepared Meals", icon: CookingPot },
  { title: "Comfortable Dining Area", icon: UtensilsCrossed },
  { title: "Professional Service", icon: HeartHandshake },
  { title: "Premium Coffee", icon: Coffee },
  { title: "Family Friendly", icon: Baby },
  { title: "Peaceful Atmosphere", icon: Wind },
  { title: "Quality Hospitality", icon: Sparkles },
] as const;

export type DiningMealStep = {
  step: string;
  hours: string;
  detail: string;
};

export function DiningExperience({
  mealTimeline,
}: {
  mealTimeline: DiningMealStep[];
}) {
  return (
    <>
      {/* 2 — Introduction */}
      <section className="bg-ivory py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow gold-rule justify-center">Dining</p>
            <h2 className="font-display mt-6 text-[2.45rem] leading-[1.1] font-semibold tracking-[-0.018em] text-balance text-forest-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.06]">
              An Elegant Dining Experience
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[15.5px] leading-[1.85] font-light tracking-[0.014em] text-charcoal-900/70 sm:text-base">
              At Marlo Hotels, the table is composed with the same care as the suites —
              freshly prepared cuisine, a peaceful dining atmosphere, comfortable seating and
              warm hospitality. International quality service meets Himalayan generosity, so
              every meal feels unhurried, considered and quietly memorable.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3 — Memorable Experience */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:gap-16 md:px-8 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="left">
            <RoyalImageFrame
              image={IMAGES.memorable}
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
          </Reveal>
          <Reveal direction="right">
            <p className="eyebrow">The Restaurant</p>
            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.02em] text-forest-950 md:text-5xl">
              Where Every Meal Becomes a Memorable Experience
            </h2>
            <p className="mt-8 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Light falls softly across timber and cream. Tables are spaced for conversation.
              The kitchen works without spectacle — seasonal produce, careful technique and a
              service rhythm that never hurries the guest. Whether you arrive for first light
              breakfast or a lingering dinner, the room holds you with the same quiet luxury
              that defines Marlo.
            </p>
            <p className="mt-6 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              From Nepal’s own flavours to familiar international plates, every dish is prepared
              to be shared, savoured and remembered — hospitality that feels personal, never
              performative.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4 — Dining Highlights */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">Highlights</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Dining Highlights
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              The essentials of a five-star table — freshness, comfort and hospitality held in
              balance from morning until late evening.
            </p>
          </Reveal>

          <Stagger
            stagger={0.05}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6"
          >
            {HIGHLIGHTS.map((item) => (
              <StaggerItem key={item.title}>
                <article className="group h-full rounded-2xl border border-forest-800/10 bg-cream-50/70 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold-500/35 hover:bg-white hover:shadow-luxury-sm md:p-8">
                  <h3 className="font-display text-xl font-medium text-forest-950 transition-colors duration-500 group-hover:text-gold-800 md:text-2xl">
                    {item.title}
                  </h3>
                  <span className="mt-4 block h-px w-10 bg-gold-500/50 transition-all duration-500 group-hover:w-16" />
                  <p className="mt-5 text-sm leading-relaxed font-light text-charcoal-900/65">
                    {item.description}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 5 — Meal Experience Timeline */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow gold-rule justify-center">The Day at Table</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Meal Experience Timeline
            </h2>
            <p className="mx-auto mt-6 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              A calm passage through the day — timings drawn from Marlo’s live restaurant hours.
            </p>
          </Reveal>

          <Stagger
            stagger={0.1}
            className="relative mt-16 flex flex-col gap-0 md:mt-20 md:flex-row md:items-stretch md:justify-between"
          >
            {mealTimeline.map((item, index) => (
              <StaggerItem
                key={item.step}
                className="relative flex flex-1 flex-col items-center text-center"
              >
                <div className="relative z-10 flex flex-col items-center px-2">
                  <span className="grid size-14 place-items-center rounded-full border border-gold-500/40 bg-ivory text-gold-700 shadow-luxury-sm md:size-16">
                    <span className="font-display text-xl text-forest-950 md:text-2xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <h3 className="font-display mt-5 text-xl font-medium text-forest-950 md:mt-6 md:text-2xl">
                    {item.step}
                  </h3>
                  {item.hours ? (
                    <p className="mt-2 text-[11px] font-semibold tracking-[0.16em] text-gold-700 uppercase">
                      {item.hours}
                    </p>
                  ) : null}
                  <p className="mt-3 max-w-[12rem] text-sm leading-relaxed font-light text-charcoal-900/65">
                    {item.detail}
                  </p>
                </div>

                {index < mealTimeline.length - 1 ? (
                  <>
                    <ArrowDown
                      className="my-5 size-4 text-gold-600/70 md:hidden"
                      strokeWidth={1.5}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-7 right-0 left-[calc(50%+2.25rem)] hidden h-px bg-gradient-to-r from-gold-500/50 to-gold-500/15 md:block"
                    />
                  </>
                ) : null}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 6 — Restaurant Experience */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">The Room</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Restaurant Experience
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              A bright, composed dining space — comfortable seating, fresh ingredients and
              personalized service in a relaxed atmosphere.
            </p>
          </Reveal>

          <Reveal className="mt-14 md:mt-16">
            <RoyalImageFrame
              image={IMAGES.experience}
              sizes="(max-width: 768px) 100vw, min(1200px, 92vw)"
              className="mx-auto max-w-6xl"
            />
          </Reveal>

          <Stagger
            stagger={0.08}
            className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-x-14 lg:gap-y-12"
          >
            {EXPERIENCE_POINTS.map((item) => (
              <StaggerItem key={item.title}>
                <h3 className="font-display text-2xl font-medium text-forest-950 md:text-[1.65rem]">
                  {item.title}
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed font-light text-charcoal-900/65">
                  {item.description}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 7 — Why Guests Love Dining */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">Why Marlo</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Why Guests Love Dining With Us
            </h2>
          </Reveal>

          <Stagger
            stagger={0.04}
            className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:mt-16"
          >
            {WHY.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.title}>
                  <div className="flex h-full flex-col items-center rounded-2xl border border-forest-800/10 bg-ivory/90 px-4 py-8 text-center transition-colors duration-500 hover:border-gold-500/30 hover:bg-white md:py-10">
                    <span className="grid size-12 place-items-center rounded-full border border-gold-500/35 text-gold-700">
                      <Icon className="size-5" strokeWidth={1.5} />
                    </span>
                    <p className="font-display mt-5 text-lg font-medium text-forest-950 md:text-xl">
                      {item.title}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* 8 — Gallery */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">Gallery</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              The Dining Room, Framed
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Tables, buffet light and the quiet architecture of hospitality — shown in full,
              never cropped for effect.
            </p>
          </Reveal>

          <Stagger
            stagger={0.07}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-2 lg:gap-8"
          >
            {IMAGES.gallery.map((image) => (
              <StaggerItem key={image.src}>
                <RoyalImageFrame
                  image={image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 9 — CTA */}
      <section className="relative overflow-hidden bg-forest-950 py-28 md:py-36">
        <div className="absolute inset-0">
          <Image
            src={IMAGES.cta.src}
            alt=""
            fill
            quality={100}
            sizes="100vw"
            className="object-cover object-center opacity-[0.22]"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/88 to-forest-950/72" />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow text-gold-400 gold-rule justify-center">
              Reservations
            </p>
            <h2 className="font-display mt-6 text-4xl font-medium text-ivory md:text-5xl lg:text-[3.25rem]">
              Enjoy Every Meal at Marlo Hotels
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.85] font-light text-cream-200/80">
              Begin with a room, then a table — breakfast through dinner, composed with Marlo
              hospitality for guests who prefer the unhurried meal.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Button asChild variant="gold" size="lg">
                <Link href="/rooms">Reserve Your Stay</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact?subject=Dining%20reservation">Contact Us</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
