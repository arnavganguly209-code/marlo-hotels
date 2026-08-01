import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  Clock,
  Compass,
  HeartHandshake,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoyalImageFrame } from "@/components/shared/royal-image-frame";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";

export type ExperienceCard = {
  title: string;
  description: string;
};

export type ExperienceImage = {
  src: string;
  alt: string;
};

const ARRANGEMENT = [
  {
    title: "Private Guides Only",
    description: "Historians, chefs and drivers arranged solely for your party.",
    icon: Users,
  },
  {
    title: "Flexible Timing",
    description: "Sunrise flights and sunset drives paced around your stay.",
    icon: Clock,
  },
  {
    title: "Transfers Included",
    description: "Chauffeured vehicles when the journey asks for them.",
    icon: Car,
  },
  {
    title: "Quiet Luxury Pacing",
    description: "Never rushed — every stop composed with Marlo hospitality.",
    icon: Sparkles,
  },
  {
    title: "Hotel-Guest Priority",
    description: "First access to weather windows and scarce appointments.",
    icon: HeartHandshake,
  },
  {
    title: "Bespoke Composition",
    description: "No fixed brochure — we refine each day to what you seek.",
    icon: Compass,
  },
] as const;

export function ExperiencesShowcase({
  experiences,
  images,
}: {
  experiences: ExperienceCard[];
  images: {
    editorial: ExperienceImage;
    accent: ExperienceImage;
    cta?: ExperienceImage;
  };
}) {
  const cards = experiences.slice(0, 6);

  return (
    <>
      {/* Intro */}
      <section className="bg-ivory py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow gold-rule justify-center">Concierge</p>
            <h2 className="font-display mt-6 text-[2.45rem] leading-[1.1] font-semibold tracking-[-0.018em] text-balance text-forest-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.06]">
              Experiences Composed for You
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-[15.5px] leading-[1.85] font-light tracking-[0.014em] text-charcoal-900/70 sm:text-base">
              Culture, quiet adventure and culinary access — arranged privately by the Marlo
              concierge. Timings, guides and entry change with the season. We compose around your
              stay, never a fixed brochure.
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
            <p className="eyebrow">The Valley</p>
            <h2 className="font-display mt-5 text-4xl font-medium tracking-[-0.02em] text-forest-950 md:text-5xl">
              The Valley, Opened Privately
            </h2>
            <p className="mt-8 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              From palace courtyards to ridge-top sunsets, every journey begins with a quiet
              conversation at the desk. We listen for what you want to feel — wonder, stillness,
              craft — then arrange the day with the same precision that shapes your room and table.
            </p>
            <p className="mt-6 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Vehicles, permissions and pacing are handled before you leave the lobby, so the
              experience itself remains unhurried and entirely yours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Signature experiences — text only, no photo clutter */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">Signature</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Journeys We Arrange Often
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
              Share what you seek — we will refine the day. Each journey is reserved for hotel
              guests and private appointment.
            </p>
          </Reveal>

          <Stagger
            stagger={0.05}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6"
          >
            {cards.map((item) => (
              <StaggerItem key={item.title}>
                <article className="group flex h-full flex-col rounded-2xl border border-forest-800/10 bg-cream-50/70 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-gold-500/35 hover:bg-white hover:shadow-luxury-sm md:p-8">
                  <h3 className="font-display text-xl font-medium text-forest-950 transition-colors duration-500 group-hover:text-gold-800 md:text-2xl">
                    {item.title}
                  </h3>
                  <span className="mt-4 block h-px w-10 bg-gold-500/50 transition-all duration-500 group-hover:w-16" />
                  <p className="mt-5 flex-1 text-sm leading-relaxed font-light text-charcoal-900/65">
                    {item.description}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* How we arrange */}
      <section className="bg-cream-100 py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow gold-rule justify-center">How We Work</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-forest-950 md:text-5xl">
              Arranged With Quiet Precision
            </h2>
          </Reveal>

          <Stagger
            stagger={0.04}
            className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:mt-16"
          >
            {ARRANGEMENT.map((item) => {
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

      {/* Second framed image — single accent, not a busy gallery */}
      <section className="bg-ivory py-24 md:py-32 lg:py-36">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <p className="eyebrow">Hospitality Beyond the Lobby</p>
              <h2 className="font-display mt-5 text-4xl font-medium text-forest-950 md:text-5xl">
                From First Light to Last Lantern
              </h2>
              <p className="mt-8 text-[15.5px] leading-[1.85] font-light text-charcoal-900/70">
                Whether a historian-led walk through living temples, a private kitchen session, or
                a ridge-top sunset, every detail is held before you arrive — so the hours themselves
                feel effortless.
              </p>
              <Link
                href="/contact?subject=Experience%20enquiry"
                className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-forest-950 uppercase transition-colors hover:text-gold-700"
              >
                Speak with the concierge <ArrowRight className="size-3.5" />
              </Link>
            </Reveal>
            <Reveal direction="left" className="order-first lg:order-last">
              <RoyalImageFrame
                image={images.accent}
                sizes="(max-width: 1024px) 100vw, 48vw"
              />
            </Reveal>
          </div>
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
              unoptimized={images.cta.src.startsWith("/media/")}
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/88 to-forest-950/72" />
          </div>
        ) : null}

        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow text-gold-400 gold-rule justify-center">Enquire</p>
            <h2 className="font-display mt-6 text-4xl font-medium text-ivory md:text-5xl lg:text-[3.25rem]">
              Begin with a Conversation
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-[15.5px] leading-[1.85] font-light text-cream-200/80">
              Tell us what you wish to see and feel. Our concierge will compose a private journey
              around your stay at Marlo Hotels.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
              <Button asChild variant="gold" size="lg">
                <Link href="/contact?subject=Experience%20enquiry">Enquire Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/rooms">Reserve Your Stay</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
