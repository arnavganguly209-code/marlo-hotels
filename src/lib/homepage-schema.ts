import type { HomepageContent } from "@/lib/homepage-content";

export type HomepageSectionKey = keyof HomepageContent;

export const HOMEPAGE_SECTIONS: {
  key: HomepageSectionKey;
  label: string;
  description: string;
  itemLabel?: string;
}[] = [
  { key: "hero", label: "Hero", description: "Hero media, headline, logo, overlay and booking controls." },
  { key: "about", label: "About", description: "Hotel story, imagery, statistics and call to action." },
  { key: "rooms", label: "Rooms Preview", description: "Homepage room cards and section introduction.", itemLabel: "Room" },
  { key: "featuredSuites", label: "Featured Suites", description: "Featured suite cards, pricing and features.", itemLabel: "Suite" },
  { key: "dining", label: "Dining Preview", description: "Restaurant cards, imagery, hours and locations.", itemLabel: "Restaurant" },
  { key: "wellness", label: "Spa Preview", description: "Spa story, images and featured treatments.", itemLabel: "Treatment" },
  { key: "pool", label: "Infinity Pool", description: "Pool banner background, overlay and call to action." },
  { key: "events", label: "Weddings & Events", description: "Wedding and meeting cards.", itemLabel: "Event" },
  { key: "gallery", label: "Gallery Preview", description: "Homepage gallery images and order.", itemLabel: "Image" },
  { key: "experiences", label: "Experiences Preview", description: "Experience cards, duration and imagery.", itemLabel: "Experience" },
  { key: "attractions", label: "Nearby Attractions", description: "Attraction cards, distance and imagery.", itemLabel: "Attraction" },
  { key: "testimonials", label: "Testimonials", description: "Review carousel content and timing.", itemLabel: "Review" },
  { key: "awards", label: "Awards", description: "Awards and recognition strip.", itemLabel: "Award" },
  { key: "instagram", label: "Instagram", description: "Instagram handle, link and image strip.", itemLabel: "Image" },
  { key: "journal", label: "Journal", description: "Homepage article cards and introduction.", itemLabel: "Article" },
  { key: "footerCta", label: "CTA", description: "Newsletter call to action shown above the footer." },
  { key: "footer", label: "Footer CTA", description: "Newsletter, contact details, logo and footer labels." },
];
