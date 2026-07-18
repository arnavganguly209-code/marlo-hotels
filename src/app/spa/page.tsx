import { ArrowRight, Check, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { packages, spaIntro, treatments } from "@/content/spa";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";
import type { SpaTreatment } from "@/types/content";

export const metadata: Metadata = buildMetadata({
  title: "Spa & Wellness",
  description:
    "Marlo Spa — five treatment suites, a couples' pavilion and a thermal circuit fed by mountain spring water. Singing bowl rituals, river-stone massage and results-driven skincare in Kathmandu.",
  path: "/spa",
});

const categories: SpaTreatment["category"][] = [
  "Signature Journey",
  "Massage",
  "Facial",
  "Body Ritual",
];

export default function SpaPage() {
  return (
    <>
      <PageHero
        eyebrow="Spa & Wellness"
        title="Stillness, drawn from the mountains"
        description="Himalayan traditions and contemporary therapy, woven into rituals you will carry home."
        image={{
          src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2400&auto=format&fit=crop",
          alt: "A treatment underway at Marlo Spa",
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Spa & Wellness", href: "/spa" },
        ]}
      />

      {/* Intro + facilities */}
      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 md:px-8 lg:grid-cols-2 lg:gap-24">
          <Reveal direction="right">
            <div className="img-hover-frame shadow-luxury relative aspect-[4/5] overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop"
                alt="Spa ritual details — flowers, stone and warm light"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal direction="left" delay={0.15}>
            <p className="eyebrow">{spaIntro.name}</p>
            <h2 className="font-display mt-5 text-4xl leading-[1.08] font-medium text-forest-950 md:text-5xl">
              {spaIntro.tagline}
            </h2>
            {spaIntro.description.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-6 text-[15px] leading-relaxed font-light text-charcoal-900/70"
              >
                {paragraph}
              </p>
            ))}
            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {spaIntro.facilities.map((facility) => (
                <li
                  key={facility}
                  className="flex items-start gap-2.5 text-sm font-light text-charcoal-900/70"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-600" />
                  {facility}
                </li>
              ))}
            </ul>
            <p className="mt-8 flex items-center gap-2.5 text-sm font-light text-charcoal-900/60">
              <Clock className="size-4 text-gold-600" />
              {spaIntro.hours}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Treatments */}
      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Treatments & Therapies"
            title="The treatment menu"
            description="Every ritual begins with a consultation and closes with tea in the relaxation lounge."
          />

          <div className="mt-16 space-y-16">
            {categories.map((category) => {
              const items = treatments.filter(
                (treatment) => treatment.category === category
              );
              return (
                <Reveal key={category}>
                  <h3 className="gold-rule font-display text-2xl font-medium text-forest-950">
                    {category === "Signature Journey"
                      ? "Signature Journeys"
                      : `${category}s`}
                  </h3>
                  <ul className="mt-7 divide-y divide-forest-800/10">
                    {items.map((treatment) => (
                      <li
                        key={treatment.name}
                        className="grid gap-3 py-6 sm:grid-cols-[1fr_auto] sm:gap-10"
                      >
                        <div>
                          <h4 className="font-display text-xl font-medium text-forest-900">
                            {treatment.name}
                          </h4>
                          <p className="mt-2 text-sm leading-relaxed font-light text-charcoal-900/60">
                            {treatment.description}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-display text-xl text-gold-600">
                            {formatCurrency(treatment.price)}
                          </p>
                          <p className="mt-1 text-[11px] tracking-[0.2em] text-charcoal-900/50 uppercase">
                            {treatment.duration}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="bg-forest-950 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            tone="light"
            eyebrow="Spa Packages"
            title="Whole days, surrendered"
            description="Composed journeys for one, two or the days after the mountain."
          />

          <Stagger className="mt-16 grid gap-8 lg:grid-cols-3">
            {packages.map((spaPackage) => (
              <StaggerItem key={spaPackage.name}>
                <article className="glass-dark shadow-luxury flex h-full flex-col rounded-xl p-8">
                  <p className="text-[10px] tracking-[0.3em] text-gold-400 uppercase">
                    {spaPackage.duration}
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-medium text-ivory">
                    {spaPackage.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed font-light text-cream-200/75">
                    {spaPackage.description}
                  </p>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {spaPackage.inclusions.map((inclusion) => (
                      <li
                        key={inclusion}
                        className="flex items-start gap-2.5 text-xs font-light text-cream-200/75"
                      >
                        <Check className="mt-0.5 size-3.5 shrink-0 text-gold-400" />
                        {inclusion}
                      </li>
                    ))}
                  </ul>
                  <p className="font-display mt-8 border-t border-ivory/10 pt-6 text-3xl font-medium text-gold-400">
                    {formatCurrency(spaPackage.price)}
                    <span className="text-sm font-light text-cream-200/60">
                      {" "}
                      / person
                    </span>
                  </p>
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-16 text-center">
            <Button asChild variant="gold" size="lg">
              <Link href="/contact?subject=Spa booking">
                Book Your Ritual
                <ArrowRight />
              </Link>
            </Button>
            <p className="mt-5 text-sm font-light text-cream-200/60">
              Hotel guests enjoy priority booking · In-suite treatments on
              request
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
