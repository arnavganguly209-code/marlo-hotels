import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { getAboutContent } from "@/content/about";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Marlo Hotels",
  description:
    "The story of Marlo Hotels — a sanctuary of mountain light, quiet luxury and Himalayan hospitality in Kathmandu.",
  path: "/about",
});

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={about.hero.heading}
        description={about.hero.description}
        image={about.hero.image}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="eyebrow">{about.story.eyebrow}</p>
            <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
              {about.story.heading}
            </h2>
            {about.story.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-6 text-[15px] leading-relaxed font-light text-charcoal-900/70"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-forest-950">
            {about.story.image.src ? (
              <Image
                src={about.story.image.src}
                alt={about.story.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={about.story.image.src.startsWith("/media/")}
              />
            ) : null}
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="eyebrow">{about.facilities.eyebrow}</p>
            <h2 className="font-display mt-4 max-w-3xl text-4xl font-medium text-forest-950">
              {about.facilities.heading}
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {about.facilities.items.map((item) => (
              <Reveal key={item.title}>
                <h3 className="font-display text-2xl text-forest-950">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed font-light text-charcoal-900/65">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Reveal>
            <p className="eyebrow">{about.services.eyebrow}</p>
            <h2 className="font-display mt-4 text-4xl font-medium text-forest-950">
              {about.services.heading}
            </h2>
            <p className="mt-6 text-base leading-relaxed font-light text-charcoal-900/70">
              {about.services.description}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="eyebrow">{about.gallery.eyebrow}</p>
            <h2 className="font-display mt-4 text-4xl font-medium text-forest-950">
              {about.gallery.heading}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {about.gallery.images.map((image, index) => (
              <div
                key={`${image.src}-${index}`}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-forest-950"
              >
                {image.src ? (
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized={image.src.startsWith("/media/")}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
          <Reveal>
            <p className="eyebrow">{about.experience.eyebrow}</p>
            <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
              {about.experience.heading}
            </h2>
            <p className="mt-6 text-base font-light text-charcoal-900/70">
              {about.experience.description}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-forest-950 py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
          <p className="eyebrow text-gold-400">{about.cta.eyebrow}</p>
          <h2 className="font-display mt-4 text-4xl font-medium text-ivory md:text-5xl">
            {about.cta.heading}
          </h2>
          <p className="mt-6 text-base font-light text-cream-200/75">
            {about.cta.description}
          </p>
          <Link
            href={about.cta.buttonLink}
            className="mt-10 inline-flex h-12 items-center rounded-xl bg-gold-500 px-8 text-[11px] font-semibold tracking-[0.2em] text-charcoal-950 uppercase"
          >
            {about.cta.buttonText}
          </Link>
        </div>
      </section>
    </>
  );
}
