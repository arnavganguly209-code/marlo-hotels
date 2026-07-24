import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import {
  sectionFaq,
  sectionFeatures,
  sectionGallery,
  sectionHours,
  sectionItems,
  type PageStudioDocument,
} from "@/lib/page-studio-content";
import type { PageSectionDef, StudioSectionData } from "@/lib/orbit/page-studio";

function MediaFrame({
  image,
  className = "aspect-[4/5]",
  label = "Image coming soon",
}: {
  image?: { src: string; alt: string };
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-forest-950 ${className}`}
    >
      {image?.src ? (
        <Image
          src={image.src}
          alt={image.alt || ""}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized={image.src.startsWith("/media/")}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-forest-900 to-forest-950">
          <p className="text-[10px] tracking-[0.28em] text-cream-200/35 uppercase">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}

function CopyBlock({
  section,
  tone = "dark",
}: {
  section?: StudioSectionData;
  tone?: "dark" | "light";
}) {
  if (!section || section.enabled === false) return null;
  const light = tone === "light";
  return (
    <Reveal>
      {section.eyebrow ? (
        <p className={light ? "eyebrow text-gold-400" : "eyebrow"}>
          {section.eyebrow}
        </p>
      ) : null}
      {section.heading ? (
        <h2
          className={
            light
              ? "font-display mt-4 text-4xl font-medium text-ivory md:text-5xl"
              : "font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl"
          }
        >
          {section.heading}
        </h2>
      ) : null}
      {section.description ? (
        <p
          className={
            light
              ? "mt-6 whitespace-pre-line text-[15px] leading-relaxed font-light text-cream-200/75"
              : "mt-6 whitespace-pre-line text-[15px] leading-relaxed font-light text-charcoal-900/70"
          }
        >
          {section.description}
        </p>
      ) : null}
      {section.buttonText ? (
        <Link
          href={section.buttonLink || "#"}
          className={
            light
              ? "mt-8 inline-flex h-12 items-center rounded-xl bg-gold-500 px-7 text-[11px] font-semibold tracking-[0.2em] text-charcoal-950 uppercase"
              : "mt-8 inline-flex h-12 items-center rounded-xl border border-forest-800/15 px-7 text-[11px] font-semibold tracking-[0.2em] text-forest-950 uppercase"
          }
        >
          {section.buttonText}
        </Link>
      ) : null}
    </Reveal>
  );
}

export function LuxuryStudioPage({
  moduleLabel,
  path,
  doc,
  sectionDefs,
  sectionExtras,
}: {
  moduleLabel: string;
  path: string;
  doc: PageStudioDocument;
  sectionDefs: PageSectionDef[];
  /** Extra content rendered after a section’s built-in blocks */
  sectionExtras?: Partial<Record<string, ReactNode>>;
}) {
  const hero = doc.hero;
  const order = sectionDefs
    .map((item) => item.key)
    .filter((key) => key !== "hero" && key !== "seo");

  return (
    <>
      <PageHero
        eyebrow={hero?.eyebrow || moduleLabel}
        title={hero?.heading || moduleLabel}
        description={hero?.description}
        image={{
          src: hero?.image?.src || "",
          alt: hero?.image?.alt || moduleLabel,
        }}
        videoUrl={hero?.videoUrl || undefined}
        crumbs={[
          { label: "Home", href: "/" },
          { label: moduleLabel, href: path },
        ]}
      />

      {order.map((key, index) => {
        const section = doc[key];
        const meta = sectionDefs.find((item) => item.key === key);
        if (!section || section.enabled === false) return null;
        const fields = new Set(meta?.fields || []);
        const showImage = fields.has("image");
        const items = sectionItems(section);
        const features = sectionFeatures(section);
        const hours = sectionHours(section);
        const faq = sectionFaq(section);
        const gallery = sectionGallery(section);
        const tone = index % 2 === 0 ? "ivory" : "cream";
        const bg = tone === "ivory" ? "bg-ivory" : "bg-cream-100";
        const isCta = key === "cta" || key === "booking";

        if (isCta) {
          return (
            <section key={key} className="bg-forest-950 py-24 md:py-32">
              <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
                <CopyBlock section={section} tone="light" />
              </div>
            </section>
          );
        }

        return (
          <section key={key} className={`${bg} py-24 md:py-32`}>
            <div className="mx-auto max-w-7xl px-5 md:px-8">
              <div
                className={
                  showImage
                    ? "grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
                    : "max-w-3xl"
                }
              >
                {showImage ? (
                  <MediaFrame
                    image={section.image}
                    className="aspect-[4/5] shadow-luxury"
                  />
                ) : null}
                <CopyBlock section={section} />
              </div>

              {items.length ? (
                <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <StaggerItem key={item.title}>
                      <article className="rounded-2xl border border-forest-800/8 bg-white p-7 shadow-luxury-sm">
                        <h3 className="font-display text-2xl text-forest-950">
                          {item.title}
                        </h3>
                        {item.description ? (
                          <p className="mt-3 text-sm leading-relaxed font-light text-charcoal-900/65">
                            {item.description}
                          </p>
                        ) : null}
                      </article>
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}

              {features.length ? (
                <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="rounded-xl border border-forest-800/8 bg-white px-5 py-4 text-sm text-forest-950"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              ) : null}

              {hours.length ? (
                <dl className="mt-12 max-w-xl space-y-3">
                  {hours.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-6 border-b border-forest-800/10 py-3 text-sm"
                    >
                      <dt className="text-forest-950">{item.label}</dt>
                      <dd className="font-light text-charcoal-900/65">
                        {item.hours}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {fields.has("gallery") ? (
                <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {(gallery.length
                    ? gallery
                    : [{ src: "", alt: "" }, { src: "", alt: "" }, { src: "", alt: "" }]
                  ).map((image, index) => (
                    <MediaFrame
                      key={`${image.src || "empty"}-${index}`}
                      image={image}
                      className="aspect-[4/5]"
                    />
                  ))}
                </div>
              ) : null}

              {faq.length ? (
                <div className="mt-14 divide-y divide-forest-800/10 border-y border-forest-800/10">
                  {faq.map((item) => (
                    <details key={item.question} className="group py-5">
                      <summary className="cursor-pointer list-none font-display text-xl text-forest-950">
                        {item.question}
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed font-light text-charcoal-900/65">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              ) : null}

              {sectionExtras?.[key] ? (
                <div className="mt-14">{sectionExtras[key]}</div>
              ) : null}
            </div>
          </section>
        );
      })}
    </>
  );
}
