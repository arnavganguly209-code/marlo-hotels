import type { Metadata } from "next";
import { OfferCard } from "@/components/cards/offer-card";
import { LuxuryStudioPage } from "@/components/shared/luxury-studio-page";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { getOffers } from "@/content/offers";
import { getPageStudioDocument } from "@/lib/page-studio-content";
import { PAGE_STUDIO_SECTIONS } from "@/lib/orbit/page-studio";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("offers");
  const seo = doc.seo;
  return buildMetadata({
    title: seo?.seoTitle || "Offers & Packages",
    description:
      seo?.seoDescription ||
      "Seasonal offers and packages at Marlo Hotels Kathmandu. Book direct for considered privileges.",
    path: "/offers",
  });
}

export default async function OffersPage() {
  const [doc, offers] = await Promise.all([
    getPageStudioDocument("offers"),
    getOffers(),
  ]);

  return (
    <LuxuryStudioPage
      moduleLabel="Offers"
      path="/offers"
      doc={doc}
      sectionDefs={PAGE_STUDIO_SECTIONS.offers}
      sectionExtras={
        offers.length
          ? {
              listing: (
                <Stagger className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {offers.map((offer) => (
                    <StaggerItem key={offer.slug}>
                      <OfferCard offer={offer} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ),
            }
          : undefined
      }
    />
  );
}
