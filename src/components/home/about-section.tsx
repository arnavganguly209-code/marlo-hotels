import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";

const stats = [
  { value: "68", label: "Rooms & Suites" },
  { value: "3", label: "Dining Venues" },
  { value: "5★", label: "Service Standard" },
  { value: "24/7", label: "Concierge" },
];

export async function AboutSection() {
  const [primary, secondary] = await Promise.all([
    resolveSiteImage("home.about.primary", {
      src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1600&auto=format&fit=crop",
      alt: "Marlo Hotels architecture rising above the gardens",
    }),
    resolveSiteImage("home.about.secondary", {
      src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop",
      alt: "The infinity pool at first light",
    }),
  ]);

  return (
    <section id="about" className="overflow-hidden bg-ivory py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-2 lg:gap-24">
        {/* Offset image composition */}
        <div className="relative">
          <Reveal direction="right">
            <div className="img-hover-frame shadow-luxury relative aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src={primary.src}
                alt={primary.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: primary.objectPosition }}
                unoptimized={primary.src.startsWith("/media/")}
              />
            </div>
          </Reveal>
          <Reveal
            direction="up"
            delay={0.25}
            className="absolute -right-4 -bottom-10 w-1/2 md:-right-8"
          >
            <div className="img-hover-frame shadow-luxury relative aspect-square overflow-hidden rounded-xl border-6 border-ivory">
              <Image
                src={secondary.src}
                alt={secondary.alt}
                fill
                sizes="25vw"
                className="object-cover"
                style={{ objectPosition: secondary.objectPosition }}
                unoptimized={secondary.src.startsWith("/media/")}
              />
            </div>
          </Reveal>
          <Reveal
            delay={0.4}
            className="glass-light shadow-luxury-sm absolute -bottom-6 left-6 hidden rounded-xl px-6 py-4 md:block"
          >
            <p className="font-display text-4xl font-medium text-forest-800">
              Since 2024
            </p>
            <p className="mt-1 text-[10px] tracking-[0.3em] text-gold-600 uppercase">
              A New Landmark
            </p>
          </Reveal>
        </div>

        {/* Copy */}
        <div>
          <Reveal>
            <p className="eyebrow">About Marlo Hotels</p>
            <h2 className="font-display mt-5 text-4xl leading-[1.08] font-medium text-forest-950 text-balance md:text-5xl lg:text-[3.4rem]">
              A sanctuary composed of{" "}
              <em className="text-gold-600">mountain light</em> and quiet
              luxury
            </h2>
            <p className="mt-8 text-[15px] leading-relaxed font-light text-charcoal-900/70">
              Marlo Hotels rises at the meeting point of Kathmandu&apos;s
              royal quarter and the valley&apos;s green rim — a house of
              deep forest tones, hand-carved timber and gold that catches
              the evening sun. Every space was composed with one intention:
              that you feel the mountains before you see them.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed font-light text-charcoal-900/70">
              From the tasting tables of Amaya to the stillness of the spa
              and the infinity pool that pours into the horizon, ours is a
              hospitality of unhurried detail — Himalayan at heart,
              world-class in execution.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-forest-800/10 pt-10 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="font-display text-4xl font-medium text-forest-800">
                    {stat.value}
                  </dd>
                  <dt className="mt-2 text-[10px] tracking-[0.26em] text-charcoal-900/55 uppercase">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.25}>
            <Button asChild variant="forest" size="lg" className="mt-12">
              <Link href="/gallery">
                Explore The Hotel
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
