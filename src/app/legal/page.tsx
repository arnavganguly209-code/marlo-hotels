import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { getLegalContent } from "@/lib/legal-content";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Legal",
  description: `Privacy Policy, Terms & Conditions, Cancellation Policy and Cookie Settings for ${siteConfig.name}.`,
  path: "/legal",
});

const SECTION_IDS = ["privacy", "terms", "cancellation", "cookies"] as const;

const EYEBROWS: Record<(typeof SECTION_IDS)[number], string> = {
  privacy: "Privacy",
  terms: "Terms",
  cancellation: "Cancellations",
  cookies: "Cookies",
};

function paragraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default async function LegalPage() {
  const content = await getLegalContent();

  return (
    <>
      <PageHero
        eyebrow={content.cover.eyebrow || "Legal"}
        title={content.cover.title || "Policies & guest commitments"}
        description={content.cover.description}
        image={{ src: content.cover.src, alt: content.cover.alt }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Legal", href: "/legal" },
        ]}
      />

      <section className="border-b border-forest-800/10 bg-cream-100">
        <nav
          aria-label="Legal sections"
          className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 py-5 md:gap-4 md:px-8"
        >
          {SECTION_IDS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-forest-800/12 bg-white px-4 text-[10px] font-semibold tracking-[0.18em] text-forest-950 uppercase transition hover:border-gold-500 hover:text-gold-700"
            >
              {content.sections[id].heading}
            </a>
          ))}
        </nav>
      </section>

      <div className="bg-ivory">
        {SECTION_IDS.map((id, index) => (
          <article
            key={id}
            id={id}
            className={`scroll-mt-28 py-20 md:py-28 ${
              index < SECTION_IDS.length - 1
                ? "border-b border-forest-800/10"
                : ""
            }`}
          >
            <div className="mx-auto max-w-3xl px-5 md:px-8">
              <Reveal>
                <p className="eyebrow">{EYEBROWS[id]}</p>
                <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
                  {content.sections[id].heading}
                </h2>
                <div className="mt-8 space-y-5 text-[15px] leading-relaxed font-light text-charcoal-900/75">
                  {paragraphs(content.sections[id].body).map(
                    (paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    )
                  )}
                </div>
              </Reveal>
            </div>
          </article>
        ))}

        <div className="border-t border-forest-800/10 bg-cream-100 py-12">
          <p className="mx-auto max-w-3xl px-5 text-center text-sm font-light text-charcoal-900/60 md:px-8">
            Questions about these policies?{" "}
            <Link
              href="/contact"
              className="font-medium text-forest-950 underline-offset-4 hover:underline"
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
