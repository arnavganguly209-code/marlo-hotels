import type { Metadata } from "next";
import {
  OffersShowcase,
  type OfferCardData,
  type OfferImage,
} from "@/components/offers/offers-showcase";
import { PageHero } from "@/components/shared/page-hero";
import { getOffers } from "@/content/offers";
import { getGalleryContent } from "@/lib/gallery-content";
import {
  getPageStudioDocument,
  sectionItems,
} from "@/lib/page-studio-content";
import { buildMetadata } from "@/lib/seo";
import { withMediaCacheBust } from "@/lib/media-cache";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("offers");
  const seo = doc.seo;
  const hero = doc.hero;
  return buildMetadata({
    title: seo?.seoTitle || hero?.seoTitle || "Offers & Packages",
    description:
      seo?.seoDescription ||
      hero?.seoDescription ||
      "Seasonal offers and packages at Marlo Hotels Kathmandu. Book direct for considered privileges.",
    path: "/offers",
  });
}

function pickGalleryImage(
  images: { src: string; alt: string; category: string }[],
  matchers: RegExp[],
  used: Set<string>
): OfferImage | null {
  for (const matcher of matchers) {
    const hit = images.find(
      (image) =>
        image.src &&
        !used.has(image.src) &&
        (matcher.test(image.src) ||
          matcher.test(image.alt) ||
          matcher.test(image.category))
    );
    if (hit) {
      used.add(hit.src);
      return {
        src: withMediaCacheBust(hit.src),
        alt: hit.alt || "Marlo Hotels",
      };
    }
  }
  const fallback = images.find((image) => image.src && !used.has(image.src));
  if (!fallback) return null;
  used.add(fallback.src);
  return {
    src: withMediaCacheBust(fallback.src),
    alt: fallback.alt || "Marlo Hotels",
  };
}

export default async function OffersPage() {
  const [doc, offers, gallery] = await Promise.all([
    getPageStudioDocument("offers"),
    getOffers(),
    getGalleryContent(),
  ]);
  const hero = doc.hero;

  const inventoryCards: OfferCardData[] = offers.map((offer) => ({
    title: offer.title,
    description: offer.description,
    tagline: offer.tagline,
    category: offer.category,
    perks: offer.perks,
    code: offer.code,
    discount: offer.discount,
    validity: offer.validity,
  }));

  const studioCards: OfferCardData[] = sectionItems(doc.listing).map((item) => ({
    title: item.title,
    description: item.description || "",
    category: "Seasonal",
  }));

  const listing = inventoryCards.length ? inventoryCards : studioCards;

  const used = new Set<string>();
  const galleryImages = gallery.images.filter((image) => Boolean(image.src));

  const fallbackFrame: OfferImage = {
    src: "/images/dining/seating-palm.png",
    alt: "Marlo Hotels hospitality",
  };

  // Max four photographs — clear royal frames, never a crowded collage.
  const editorial =
    pickGalleryImage(
      galleryImages,
      [/premier/i, /executive/i, /room/i, /Rooms/],
      used
    ) ||
    pickGalleryImage(galleryImages, [/./], used) ||
    fallbackFrame;

  const accent =
    pickGalleryImage(
      galleryImages,
      [/spa/i, /massage/i, /jacuzzi/i, /Spa/],
      used
    ) ||
    pickGalleryImage(galleryImages, [/dining/i, /restaurant/i], used) ||
    pickGalleryImage(galleryImages, [/./], used) ||
    fallbackFrame;

  const pair =
    pickGalleryImage(
      galleryImages,
      [/dining/i, /restaurant/i, /breakfast/i, /Dining/],
      used
    ) || undefined;

  const cta =
    pickGalleryImage(
      galleryImages,
      [/gate/i, /entrance/i, /lobby/i, /architecture/i],
      used
    ) || accent;

  return (
    <>
      {/* Hero cover — Orbit / studio image unchanged */}
      <PageHero
        eyebrow={hero?.eyebrow || "Offers & Packages"}
        title={hero?.heading || "Considered ways to stay"}
        description={hero?.description}
        image={{
          src: hero?.image?.src || "",
          alt: hero?.image?.alt || "Offers at Marlo Hotels",
        }}
        videoUrl={hero?.videoUrl || undefined}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Offers", href: "/offers" },
        ]}
      />

      <OffersShowcase
        offers={listing}
        images={{ editorial, accent, pair, cta }}
      />
    </>
  );
}
