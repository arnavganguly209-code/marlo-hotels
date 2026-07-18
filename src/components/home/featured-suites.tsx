import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "@/types/content";

export function FeaturedSuites({ suites }: { suites: Room[] }) {
  return (
    <section className="bg-forest-950 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          tone="light"
          eyebrow="Featured Suites"
          title="The addresses guests return for"
          description="Our signature suites pair residential scale with the craft of the valley — private terraces, carved timber and service that reads your mind."
        />

        <div className="mt-20 space-y-24 md:space-y-32">
          {suites.map((suite, index) => {
            const reversed = index % 2 === 1;
            return (
              <div
                key={suite.slug}
                className="grid items-center gap-10 lg:grid-cols-12 lg:gap-0"
              >
                <Reveal
                  direction={reversed ? "left" : "right"}
                  className={
                    reversed
                      ? "lg:order-2 lg:col-span-7 lg:col-start-6"
                      : "lg:col-span-7"
                  }
                >
                  <div className="img-hover-frame shadow-luxury relative aspect-[16/11] overflow-hidden rounded-xl">
                    <Image
                      src={suite.images[0].src}
                      alt={suite.images[0].alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>

                <Reveal
                  direction={reversed ? "right" : "left"}
                  delay={0.15}
                  className={
                    reversed
                      ? "lg:order-1 lg:col-span-5 lg:col-start-1 lg:row-start-1"
                      : "lg:col-span-5 lg:col-start-8 lg:row-start-1"
                  }
                >
                  <div
                    className={`glass-dark shadow-luxury relative z-10 rounded-xl p-8 md:p-10 ${
                      reversed ? "lg:-mr-16" : "lg:-ml-16"
                    }`}
                  >
                    <p className="eyebrow">{suite.tagline}</p>
                    <h3 className="font-display mt-4 text-3xl font-medium text-ivory md:text-4xl">
                      {suite.name}
                    </h3>
                    <p className="mt-5 text-sm leading-relaxed font-light text-cream-200/80">
                      {suite.shortDescription}
                    </p>
                    <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                      {suite.features.slice(0, 4).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-xs font-light text-cream-200/75"
                        >
                          <Check className="mt-0.5 size-3.5 shrink-0 text-gold-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-ivory/10 pt-6">
                      <p>
                        <span className="block text-[9px] tracking-[0.3em] text-cream-200/60 uppercase">
                          From
                        </span>
                        <span className="font-display text-3xl font-medium text-gold-400">
                          {formatCurrency(suite.priceFrom)}
                          <span className="text-sm font-light text-cream-200/70">
                            {" "}
                            / night
                          </span>
                        </span>
                      </p>
                      <Button asChild variant="gold" size="sm">
                        <Link href={`/rooms/${suite.slug}`}>
                          Explore Suite
                          <ArrowRight />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
