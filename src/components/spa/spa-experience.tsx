import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  Bath,
  DoorClosed,
  Droplets,
  Flower2,
  HeartHandshake,
  Leaf,
  Shirt,
  Sparkles,
  Waves,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoyalImageFrame } from "@/components/shared/royal-image-frame";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

const IMAGES = {
  sanctuary: {
    src: "/images/spa/reception-lounge.png",
    alt: "Warm spa reception lounge at Marlo Hotels",
  },
  experience: {
    src: "/images/spa/treatment-rooms.png",
    alt: "Private spa treatment rooms with champagne-gold arches",
  },
  facilities: {
    src: "/images/spa/jacuzzi.png",
    alt: "Private jacuzzi glowing with blue underwater light",
  },
  why: {
    src: "/images/spa/treatment-suite.png",
    alt: "Couples spa suite with Himalayan singing bowls",
  },
  cta: {
    src: "/images/spa/reception-desk.png",
    alt: "Spa reception desk prepared to welcome guests",
  },
} as const;

const SERVICES = [
  {
    name: "Himalayan Massage",
    description:
      "Long, rhythmic strokes guided by mountain breathwork — a ritual that softens travel and restores quiet presence.",
  },
  {
    name: "Hot Stone Therapy",
    description:
      "Warm basalt stones placed along the spine, releasing deep muscular tension with unhurried, grounding pressure.",
  },
  {
    name: "Shirodhara Therapy",
    description:
      "A continuous stream of warm herbal oil across the forehead — classic Ayurvedic calm for mind and nervous system.",
  },
  {
    name: "Sauna & Steam",
    description:
      "Heat and botanical steam to open the body, ease circulation and prepare for deeper therapeutic work.",
  },
  {
    name: "Jacuzzi Experience",
    description:
      "A private soak in illuminated waters — stillness after treatment, or a gentle prelude to massage.",
  },
  {
    name: "Ayurvedic Massage",
    description:
      "Dosha-aware oils and traditional technique, composed to balance energy after days of travel and altitude.",
  },
  {
    name: "Deep Tissue Massage",
    description:
      "Focused pressure for stubborn tension in shoulders, back and legs — precise, considered and restorative.",
  },
  {
    name: "Aromatherapy Massage",
    description:
      "Essential oils chosen for the day — citrus for clarity, sandalwood for calm, florals for soft restoration.",
  },
  {
    name: "Facial Treatments",
    description:
      "Results-driven skincare with high-altitude botanicals, composed for skin that has known sun, wind and city air.",
  },
  {
    name: "Couple Spa Experience",
    description:
      "Side-by-side therapies in a private suite — shared silence, dual tables and a quieter kind of togetherness.",
  },
] as const;

const FACILITIES = [
  { label: "Private Treatment Rooms", icon: DoorClosed },
  { label: "Jacuzzi", icon: Bath },
  { label: "Steam Room", icon: Waves },
  { label: "Sauna", icon: Wind },
  { label: "Couples Therapy Rooms", icon: HeartHandshake },
  { label: "Herbal Oils", icon: Leaf },
  { label: "Relaxation Lounge", icon: Flower2 },
  { label: "Luxury Changing Rooms", icon: Shirt },
  { label: "Fresh Towels", icon: Droplets },
  { label: "Complimentary Herbal Tea", icon: Sparkles },
] as const;

const WHY = [
  {
    title: "Professional Therapists",
    description:
      "Seasoned hands and quiet attentiveness — every treatment paced to your body, never to a clock alone.",
  },
  {
    title: "Himalayan Wellness",
    description:
      "Singing bowls, warm oils and mountain rituals woven into contemporary spa practice.",
  },
  {
    title: "Natural Oils",
    description:
      "Botanical blends selected for purity and fragrance — soft on skin, lasting in memory.",
  },
  {
    title: "Private Environment",
    description:
      "Suites composed for discretion. Screens stay outside. Silence is welcome.",
  },
  {
    title: "Premium Hospitality",
    description:
      "From arrival tea to the final farewell, every gesture is considered and unhurried.",
  },
  {
    title: "Personalized Treatments",
    description:
      "Pressure, duration and oils chosen in consultation — rituals written for you, not a menu.",
  },
  {
    title: "Luxury Relaxation",
    description:
      "Spaces between treatments matter: lounge light, herbal infusions and time to simply arrive.",
  },
] as const;

const JOURNEY = [
  { step: "Arrival", detail: "Settle into the lounge with herbal tea and soft light." },
  { step: "Consultation", detail: "A quiet conversation about pressure, focus and intention." },
  { step: "Treatment", detail: "Private suites, considered technique, uninterrupted calm." },
  { step: "Relaxation", detail: "Time to integrate — no rush back into the day." },
  { step: "Refreshment", detail: "A final infusion before you return restored." },
] as const;

const EXPERIENCE_POINTS = [
  {
    title: "Private Treatment Rooms",
    description:
      "Suites finished in cream, champagne gold and soft textile — composed for privacy and deep rest.",
  },
  {
    title: "Peaceful Atmosphere",
    description:
      "Warm cove lighting, quiet corridors and a pace that never hurries the guest.",
  },
  {
    title: "Premium Wellness Experience",
    description:
      "From thermal rituals to signature massage, every detail is tuned to five-star calm.",
  },
  {
    title: "Professional Therapists",
    description:
      "Skilled practitioners who listen first — then compose the treatment your body asks for.",
  },
] as const;

export function SpaExperience() {
  return (
    <>
      {/* 1 — Introduction */}
      <section className="bg-ivory py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow gold-rule justify-center">Marlo Spa</p>
            <h2 className="font-display mt-6 text-[2.45rem] leading-[1.1] font-semibold tracking-[-0.018em] text-balance text-forest-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.06]">
              Wellness Inspired by the Himalayas
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[15.5px] leading-[1.85] font-light tracking-[0.014em] text-charcoal-900/70 sm:text-base">
              Here, wellness is composed like hospitality — unhurried, precise and deeply personal.
              Drawing on Himalayan healing traditions and contemporary therapy, Marlo Spa invites
              you into balance: warm oils, quiet suites and rituals that restore body, mind and
              spirit after travel through the valley.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 2 — Sanctuary of Calm */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:gap-16 md:px-8 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="left">
            <RoyalImageFrame
              image={IMAGES.sanctuary}
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
          </Reveal>
          <Reveal direction="right">
            <p className="eyebrow">Atmosphere</p>
            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.02em] text-forest-950 md:text-5xl">
              A Sanctuary of Calm
            </h2>
            <p className="mt-8 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Step from the lobby into a softer register of light and sound. Warm timber, amber
              glow and carefully considered quiet prepare you for what follows — not a schedule of
              treatments, but a passage into stillness. Our spa is designed as a refuge within the
              hotel: private enough for true rest, generous enough for unhurried arrival.
            </p>
            <p className="mt-6 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Whether you come after a day among the valley&apos;s temples or before an evening at
              Amaya, the sanctuary meets you without hurry — herbal tea, soft seating and the
              assurance that every ritual begins in calm.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3 — Luxury Spa Experience */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">The Experience</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Luxury Spa Experience
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Private rooms, considered materials and therapists who listen first — a spa experience
              composed to the standard of the world&apos;s great houses of hospitality.
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
            className="mt-14 grid gap-10 sm:grid-cols-2 lg:mt-20 lg:gap-x-16 lg:gap-y-14"
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

      {/* 4 — Signature Services */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">Treatments</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Our Signature Wellness Services
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Rituals composed without published rates — enquire with the spa desk for availability
              and a journey written around your stay.
            </p>
          </Reveal>

          <Stagger
            stagger={0.05}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6"
          >
            {SERVICES.map((service) => (
              <StaggerItem key={service.name}>
                <article className="group h-full rounded-2xl border border-forest-800/10 bg-ivory/80 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold-500/35 hover:bg-white hover:shadow-luxury-sm md:p-8">
                  <h3 className="font-display text-xl font-medium text-forest-950 transition-colors duration-500 group-hover:text-gold-800 md:text-2xl">
                    {service.name}
                  </h3>
                  <span className="mt-4 block h-px w-10 bg-gold-500/50 transition-all duration-500 group-hover:w-16" />
                  <p className="mt-5 text-sm leading-relaxed font-light text-charcoal-900/65">
                    {service.description}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* 5 — Spa Facilities */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Reveal>
                <p className="eyebrow">Amenities</p>
                <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 md:text-5xl">
                  Spa Facilities
                </h2>
                <p className="mt-6 max-w-xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
                  Every space is arranged for ease — from the privacy of treatment suites to the
                  glow of the jacuzzi and the quiet of the relaxation lounge.
                </p>
              </Reveal>

              <Stagger
                stagger={0.04}
                className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-5"
              >
                {FACILITIES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <StaggerItem key={item.label}>
                      <div className="flex items-start gap-3.5 rounded-xl border border-forest-800/8 bg-cream-50/80 px-4 py-4 transition-colors duration-500 hover:border-gold-500/30 hover:bg-white md:px-5 md:py-5">
                        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border border-gold-500/30 text-gold-700">
                          <Icon className="size-4" strokeWidth={1.5} />
                        </span>
                        <p className="pt-1.5 text-[13px] leading-snug font-medium tracking-[0.02em] text-forest-950 md:text-sm">
                          {item.label}
                        </p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </div>

            <Reveal direction="left" className="order-first lg:order-last">
              <RoyalImageFrame
                image={IMAGES.facilities}
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6 — Why Choose Our Spa */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-start gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal className="lg:sticky lg:top-32">
              <RoyalImageFrame
                image={IMAGES.why}
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </Reveal>

            <div>
              <Reveal>
                <p className="eyebrow">Why Marlo Spa</p>
                <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 md:text-5xl">
                  Why Choose Our Spa
                </h2>
                <p className="mt-6 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
                  Not an amenity checklist — a considered house of wellness within Marlo Hotels,
                  where Himalayan tradition meets international five-star care.
                </p>
              </Reveal>

              <div className="mt-12 space-y-8 border-t border-forest-800/10 pt-2">
                {WHY.map((item, index) => (
                  <Reveal key={item.title} delay={index * 0.04}>
                    <div className="border-b border-forest-800/10 pb-8">
                      <h3 className="font-display text-2xl font-medium text-forest-950">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed font-light text-charcoal-900/65">
                        {item.description}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Wellness Journey */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow gold-rule justify-center">Your Path</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Wellness Journey
            </h2>
            <p className="mx-auto mt-6 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              A simple, elegant passage from arrival to refreshment — every step held with care.
            </p>
          </Reveal>

          <Stagger
            stagger={0.1}
            className="relative mt-16 flex flex-col gap-0 md:mt-20 md:flex-row md:items-stretch md:justify-between md:gap-0"
          >
            {JOURNEY.map((item, index) => (
              <StaggerItem
                key={item.step}
                className="relative flex flex-1 flex-col items-center text-center"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <span className="grid size-14 place-items-center rounded-full border border-gold-500/40 bg-cream-50 text-gold-700 shadow-luxury-sm md:size-16">
                    <span className="font-display text-xl text-forest-950 md:text-2xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <h3 className="font-display mt-5 text-xl font-medium text-forest-950 md:mt-6 md:text-2xl">
                    {item.step}
                  </h3>
                  <p className="mt-3 max-w-[11rem] text-sm leading-relaxed font-light text-charcoal-900/65">
                    {item.detail}
                  </p>
                </div>

                {index < JOURNEY.length - 1 ? (
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

      {/* 8 — Luxury CTA */}
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
            <p className="eyebrow text-gold-400 gold-rule justify-center">Reserve Quiet</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-ivory md:text-5xl lg:text-[3.25rem]">
              Restore Your Mind, Body &amp; Spirit
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.85] font-light text-cream-200/80">
              Speak with our spa desk to compose a ritual around your stay — private suites,
              signature therapies and Himalayan calm, arranged with Marlo hospitality.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Button asChild variant="gold" size="lg">
                <Link href="/contact?subject=Spa%20booking">Book Spa</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
