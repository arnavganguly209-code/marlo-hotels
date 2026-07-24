import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Legal",
  description: `Privacy Policy, Terms & Conditions, Cancellation Policy and Cookie Settings for ${siteConfig.name}.`,
  path: "/legal",
});

const sections = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "cancellation", label: "Cancellation Policy" },
  { id: "cookies", label: "Cookie Settings" },
] as const;

export default function LegalPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Policies & guest commitments"
        description="Transparent terms for your stay — privacy, booking conditions, cancellations and cookies."
        image={{ src: "", alt: "Marlo Hotels legal" }}
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
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex min-h-11 items-center rounded-full border border-forest-800/12 bg-white px-4 text-[10px] font-semibold tracking-[0.18em] text-forest-950 uppercase transition hover:border-gold-500 hover:text-gold-700"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </section>

      <div className="bg-ivory">
        <article
          id="privacy"
          className="scroll-mt-28 border-b border-forest-800/10 py-20 md:py-28"
        >
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <Reveal>
              <p className="eyebrow">Privacy</p>
              <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
                Privacy Policy
              </h2>
              <div className="mt-8 space-y-5 text-[15px] leading-relaxed font-light text-charcoal-900/75">
                <p>
                  {siteConfig.name} (“we”, “our”) respects your privacy. This
                  policy explains how we collect, use and protect personal
                  information when you visit our website, make an enquiry or
                  complete a reservation.
                </p>
                <p>
                  We may collect identity and contact details, stay preferences,
                  payment references processed by our payment partners, and
                  technical data such as device type and approximate location
                  for security and performance.
                </p>
                <p>
                  Information is used to fulfil bookings, respond to enquiries,
                  improve our services, and meet legal obligations. We do not
                  sell personal data. Access is limited to authorised staff and
                  trusted processors under confidentiality agreements.
                </p>
                <p>
                  To request access, correction or deletion of your data,
                  contact{" "}
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="text-gold-700 underline-offset-4 hover:underline"
                  >
                    {siteConfig.contact.email}
                  </a>
                  .
                </p>
              </div>
            </Reveal>
          </div>
        </article>

        <article
          id="terms"
          className="scroll-mt-28 border-b border-forest-800/10 py-20 md:py-28"
        >
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <Reveal>
              <p className="eyebrow">Terms</p>
              <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
                Terms & Conditions
              </h2>
              <div className="mt-8 space-y-5 text-[15px] leading-relaxed font-light text-charcoal-900/75">
                <p>
                  By using this website or confirming a reservation with{" "}
                  {siteConfig.name}, you agree to these terms. Rates, room
                  types and inclusions are as stated at the time of booking and
                  may vary by season, length of stay and promotional code.
                </p>
                <p>
                  Guests are responsible for providing accurate booking details
                  and for complying with hotel house rules, including quiet
                  hours, occupancy limits and responsible use of facilities.
                  We reserve the right to refuse or terminate a stay in cases of
                  misconduct or safety risk, without refund where warranted.
                </p>
                <p>
                  Website content is provided for general information. Images
                  and descriptions are illustrative; exact room assignments and
                  views are confirmed on arrival subject to availability.
                </p>
                <p>
                  These terms are governed by the laws of Nepal. For booking
                  questions, write to{" "}
                  <a
                    href={`mailto:${siteConfig.contact.reservationsEmail}`}
                    className="text-gold-700 underline-offset-4 hover:underline"
                  >
                    {siteConfig.contact.reservationsEmail}
                  </a>
                  .
                </p>
              </div>
            </Reveal>
          </div>
        </article>

        <article
          id="cancellation"
          className="scroll-mt-28 border-b border-forest-800/10 py-20 md:py-28"
        >
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <Reveal>
              <p className="eyebrow">Cancellations</p>
              <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
                Cancellation Policy
              </h2>
              <div className="mt-8 space-y-5 text-[15px] leading-relaxed font-light text-charcoal-900/75">
                <p>
                  Cancellation terms depend on the rate selected at booking.
                  Flexible rates typically allow complimentary cancellation
                  until 48 hours before arrival (local hotel time). Advance
                  purchase, promotional and package rates may be non-refundable
                  or carry a fee — the confirmation email states the exact
                  policy for your reservation.
                </p>
                <p>
                  No-shows and early departures may be charged according to the
                  reserved rate. Modifications are subject to availability and
                  may affect price.
                </p>
                <p>
                  To change or cancel, contact reservations promptly with your
                  confirmation number. Force majeure events are reviewed case by
                  case with fairness to the guest.
                </p>
              </div>
            </Reveal>
          </div>
        </article>

        <article id="cookies" className="scroll-mt-28 py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <Reveal>
              <p className="eyebrow">Cookies</p>
              <h2 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
                Cookie Settings
              </h2>
              <div className="mt-8 space-y-5 text-[15px] leading-relaxed font-light text-charcoal-900/75">
                <p>
                  We use essential cookies to operate secure booking sessions
                  and remember basic preferences. Analytics cookies — when
                  enabled — help us understand how guests use the site so we can
                  improve performance and content.
                </p>
                <p>
                  You can control non-essential cookies through your browser
                  settings. Blocking essential cookies may prevent completing a
                  reservation online; our reservations team remains available by
                  phone at {siteConfig.contact.reservations}.
                </p>
                <p>
                  Continued use of the site with cookies enabled constitutes
                  acceptance of this cookie notice, alongside our{" "}
                  <a
                    href="#privacy"
                    className="text-gold-700 underline-offset-4 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </Reveal>
          </div>
        </article>

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
