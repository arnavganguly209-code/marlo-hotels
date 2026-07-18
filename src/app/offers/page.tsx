import type { Metadata } from "next";
import { OfferCard } from "@/components/cards/offer-card";
import { PageHero } from "@/components/shared/page-hero";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getOffers } from "@/content/offers";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Offers & Packages",
  description:
    "Seasonal escapes, honeymoon and wellness packages, and the Gift of Marlo — considered offers for stays at Marlo Hotels, Kathmandu.",
  path: "/offers",
});

export default async function OffersPage() {
  const offers = await getOffers();
  const seasonal = offers.filter((offer) => offer.category === "Seasonal");
  const packages = offers.filter((offer) => offer.category === "Package");
  const giftCards = offers.filter((offer) => offer.category === "Gift Card");

  return (
    <>
      <PageHero
        eyebrow="Offers & Packages"
        title="Considered ways to stay"
        description="Seasonal escapes, composed packages and gifts that unwrap into whole days — each with privileges reserved for direct bookings."
        image={{
          src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2400&auto=format&fit=crop",
          alt: "Resort pool in golden morning light",
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Offers", href: "/offers" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="Seasonal Offers"
            title="This season at Marlo"
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {seasonal.map((offer) => (
              <StaggerItem key={offer.slug}>
                <OfferCard offer={offer} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="Packages"
            title="Journeys, composed"
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2">
            {packages.map((offer) => (
              <StaggerItem key={offer.slug}>
                <OfferCard offer={offer} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="Gift Cards"
            title="Give a night, a dinner, a ritual"
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2">
            {giftCards.map((offer) => (
              <StaggerItem key={offer.slug}>
                <OfferCard offer={offer} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
