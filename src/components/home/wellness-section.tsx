import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { treatments } from "@/content/spa";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";
import { formatCurrency } from "@/lib/utils";

export async function WellnessSection() {
  const highlights = treatments.filter(
    (treatment) => treatment.category === "Signature Journey"
  );
  const [primary, secondary] = await Promise.all([
    resolveSiteImage("home.wellness.primary", {
      src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop",
      alt: "A Marlo Spa ritual with flowers and warm stone",
    }),
    resolveSiteImage("home.wellness.secondary", {
      src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
      alt: "Treatment suite at Marlo Spa",
    }),
  ]);

  return (
    <section className="overflow-hidden bg-cream-100 py-24 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-2 lg:gap-24">
        <div className="order-2 lg:order-1">
          <Reveal>
            <p className="eyebrow">Spa & Wellness</p>
            <h2 className="font-display mt-5 text-4xl leading-[1.08] font-medium text-forest-950 text-balance md:text-5xl">
              Stillness, drawn from the <em className="text-gold-600">mountains</em>
            </h2>
            <p className="mt-7 text-[15px] leading-relaxed font-light text-charcoal-900/70">
              Five treatment suites, a couples&apos; pavilion and a thermal
              circuit fed by mountain spring water. Our therapies weave
              singing bowls, warmed river stone and valley-pressed oils
              into rituals you will carry home.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-10 divide-y divide-forest-800/10 border-y border-forest-800/10">
              {highlights.map((treatment) => (
                <li
                  key={treatment.name}
                  className="flex items-baseline justify-between gap-6 py-5"
                >
                  <div>
                    <h3 className="font-display text-xl font-medium text-forest-900">
                      {treatment.name}
                    </h3>
                    <p className="mt-1 text-xs font-light tracking-wider text-charcoal-900/55 uppercase">
                      {treatment.duration}
                    </p>
                  </div>
                  <span className="font-display shrink-0 text-xl text-gold-600">
                    {formatCurrency(treatment.price)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.25}>
            <Button asChild variant="forest" size="lg" className="mt-10">
              <Link href="/spa">
                Enter Marlo Spa
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="relative order-1 lg:order-2">
          <Reveal direction="left">
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
            delay={0.25}
            className="absolute -bottom-10 -left-4 w-1/2 md:-left-8"
          >
            <div className="img-hover-frame shadow-luxury relative aspect-[4/3] overflow-hidden rounded-xl border-6 border-cream-100">
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
        </div>
      </div>
    </section>
  );
}
