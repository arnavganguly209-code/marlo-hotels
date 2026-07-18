import { ArrowRight, Check, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getExperiences } from "@/content/experiences";
import { resolveSiteImage } from "@/lib/orbit/resolve-image";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Experiences",
  description:
    "Sunrise flights past Everest, historian-led heritage walks, monastery mornings and private ateliers — luxury experiences composed by the Marlo Hotels concierge in Kathmandu.",
  path: "/experiences",
});

export default async function ExperiencesPage() {
  const [experiences, hero] = await Promise.all([
    getExperiences(),
    resolveSiteImage("page.experiences.hero", {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2400&auto=format&fit=crop",
      alt: "The Himalayan range at sunrise",
    }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Luxury Experiences"
        title="The valley, opened for you"
        description="Composed by our concierge and impossible to book anywhere else — culture, adventure, wellness and doors that open only for Marlo guests."
        image={{
          src: hero.src,
          alt: hero.alt,
          objectPosition: hero.objectPosition,
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Experiences", href: "/experiences" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl space-y-24 px-5 md:space-y-32 md:px-8">
          {experiences.map((experience, index) => {
            const reversed = index % 2 === 1;
            return (
              <article
                key={experience.slug}
                id={experience.slug}
                className="grid scroll-mt-32 items-center gap-10 lg:grid-cols-2 lg:gap-20"
              >
                <Reveal
                  direction={reversed ? "left" : "right"}
                  className={reversed ? "lg:order-2" : ""}
                >
                  <div className="img-hover-frame shadow-luxury relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={experience.image.src}
                      alt={experience.image.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      unoptimized={experience.image.src.startsWith("/media/")}
                    />
                    <span className="glass-dark absolute top-5 left-5 rounded-full px-4 py-1.5 text-[9px] font-medium tracking-[0.28em] text-gold-300 uppercase">
                      {experience.category}
                    </span>
                  </div>
                </Reveal>

                <Reveal
                  direction={reversed ? "right" : "left"}
                  delay={0.15}
                  className={reversed ? "lg:order-1" : ""}
                >
                  <p className="flex items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-gold-600 uppercase">
                    <Clock className="size-3.5" />
                    {experience.duration}
                  </p>
                  <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
                    {experience.title}
                  </h2>
                  <p className="mt-6 text-[15px] leading-relaxed font-light text-charcoal-900/70">
                    {experience.description}
                  </p>
                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {experience.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2.5 text-sm font-light text-charcoal-900/70"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-gold-600" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="forest" size="lg" className="mt-9">
                    <Link
                      href={`/contact?subject=Experience — ${experience.title}`}
                    >
                      Arrange This Experience
                      <ArrowRight />
                    </Link>
                  </Button>
                </Reveal>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
