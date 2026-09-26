import Link from "next/link";
import { RoomCard } from "@/components/cards/room-card";
import { JsonLd } from "@/components/shared/json-ld";
import { PageHero } from "@/components/shared/page-hero";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { breadcrumbJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import {
  pathToPublicUrl,
  type SeoLandingPageRecord,
} from "@/lib/seo-landing/types";
import type { Room } from "@/types/content";

type Props = {
  page: SeoLandingPageRecord;
  rooms: Room[];
  related: SeoLandingPageRecord[];
};

export function SeoLandingView({ page, rooms, related }: Props) {
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Hotels", href: "/hotels/kathmandu" },
    { label: page.h1, href: pathToPublicUrl(page.path) },
  ];

  const itemList =
    rooms.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: rooms.map((room, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: room.name,
            url: `${siteConfig.url}/rooms/${room.slug}`,
          })),
        }
      : null;

  const faqSchema =
    page.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <PageHero
        eyebrow="Marlo Hotels · Kathmandu"
        title={page.h1}
        description={page.intro}
        image={{
          src: page.featuredImageUrl || "/images/brand/social-share.jpg",
          alt: page.featuredImageAlt || page.h1,
        }}
        crumbs={crumbs}
      />

      {itemList ? <JsonLd data={itemList} /> : null}
      {faqSchema ? <JsonLd data={faqSchema} /> : null}

      <section className="section-pad bg-ivory-50">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {page.body ? (
            <p className="font-body text-base leading-relaxed text-forest-800/85 whitespace-pre-line">
              {page.body}
            </p>
          ) : null}
          <p className="mt-6 text-sm text-forest-800/70">
            Results below are Marlo Hotels room categories from our live
            catalogue — not a multi-hotel directory.
          </p>
        </div>
      </section>

      <section className="section-pad border-t border-forest-900/8 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Rooms & Suites"
            title="Available at Marlo"
            description="Live categories from our rooms catalogue. Open any room for details and availability."
          />
          {rooms.length ? (
            <Stagger className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <StaggerItem key={room.slug}>
                  <RoomCard room={room} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="mt-10 text-sm text-forest-800/70">
              No published rooms match this view right now.{" "}
              <Link href="/rooms" className="underline underline-offset-4">
                View all rooms
              </Link>
              .
            </p>
          )}
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="inline-flex h-12 items-center justify-center rounded-full bg-gold-500 px-8 text-[11px] font-semibold tracking-[0.16em] text-forest-950 uppercase"
            >
              Check availability
            </Link>
            <Link
              href="/rooms"
              className="inline-flex h-12 items-center justify-center rounded-full border border-forest-900/15 px-8 text-[11px] font-semibold tracking-[0.16em] text-forest-900 uppercase"
            >
              All rooms
            </Link>
          </div>
        </div>
      </section>

      {page.faqs.length ? (
        <section className="section-pad border-t border-forest-900/8 bg-ivory-50">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <SectionHeading eyebrow="FAQ" title="Common questions" />
            <div className="mt-10 space-y-6">
              {page.faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="font-display text-xl text-forest-950">
                    {faq.question}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-800/80">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="section-pad border-t border-forest-900/8 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeading
              eyebrow="Explore"
              title="Related stays"
              description="More Marlo guides for Kathmandu and Thamel."
            />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.path}>
                  <Link
                    href={pathToPublicUrl(item.path)}
                    className="block rounded-2xl border border-forest-900/10 bg-ivory-50 px-5 py-4 transition hover:border-gold-500/40"
                  >
                    <span className="font-display text-lg text-forest-950">
                      {item.h1}
                    </span>
                    <span className="mt-1 block text-xs text-forest-800/60">
                      {pathToPublicUrl(item.path)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* BreadcrumbList also emitted by PageHero */}
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((c) => ({ name: c.label, path: c.href }))
        )}
      />
    </>
  );
}
