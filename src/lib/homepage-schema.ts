import type { HomepageContent } from "@/lib/homepage-content";

export type HomepageSectionKey = keyof HomepageContent;

/** Homepage editor section tabs — flat, not nested under Website. */
export const HOMEPAGE_SECTIONS: {
  key: HomepageSectionKey;
  label: string;
  description: string;
  itemLabel?: string;
}[] = [
  { key: "hero", label: "Hero", description: "Upload one cinematic background video." },
  { key: "about", label: "About", description: "Hotel story and imagery." },
  { key: "rooms", label: "Featured Rooms", description: "Homepage room cards.", itemLabel: "Room" },
  { key: "featuredSuites", label: "Featured Suites", description: "Suite cards.", itemLabel: "Suite" },
  { key: "dining", label: "Dining", description: "Restaurant preview cards.", itemLabel: "Restaurant" },
  { key: "wellness", label: "Spa", description: "Spa preview.", itemLabel: "Treatment" },
  { key: "gallery", label: "Gallery", description: "Homepage gallery.", itemLabel: "Image" },
  { key: "experiences", label: "Experiences", description: "Experience cards.", itemLabel: "Experience" },
  { key: "footerCta", label: "CTA", description: "Call to action above the footer." },
  { key: "footer", label: "Footer CTA", description: "Footer newsletter and contact labels." },
  { key: "pool", label: "Infinity Pool", description: "Pool banner." },
  { key: "events", label: "Events", description: "Wedding and meeting cards.", itemLabel: "Event" },
  { key: "attractions", label: "Attractions", description: "Nearby attractions.", itemLabel: "Attraction" },
  { key: "testimonials", label: "Testimonials", description: "Guest reviews.", itemLabel: "Review" },
  { key: "awards", label: "Awards", description: "Awards strip.", itemLabel: "Award" },
  { key: "instagram", label: "Instagram", description: "Instagram strip.", itemLabel: "Image" },
  { key: "journal", label: "Journal", description: "Article cards.", itemLabel: "Article" },
];
