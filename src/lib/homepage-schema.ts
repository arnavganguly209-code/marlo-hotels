import type { HomepageContent } from "@/lib/homepage-content";

export type HomepageSectionKey = keyof HomepageContent;

export const HOMEPAGE_SECTIONS: {
  key: HomepageSectionKey;
  label: string;
  description: string;
  itemLabel?: string;
}[] = [
  { key: "hero", label: "Hero Section", description: "Hero media, headline, logo, overlay and booking controls." },
  { key: "about", label: "About Section", description: "Hotel story, imagery, statistics and call to action." },
  { key: "rooms", label: "Rooms Section", description: "Homepage room cards and section introduction.", itemLabel: "Room" },
  { key: "featuredSuites", label: "Featured Suites", description: "Featured suite cards, pricing and features.", itemLabel: "Suite" },
  { key: "dining", label: "Dining Section", description: "Restaurant cards, imagery, hours and locations.", itemLabel: "Restaurant" },
  { key: "wellness", label: "Spa Section", description: "Spa story, images and featured treatments.", itemLabel: "Treatment" },
  { key: "pool", label: "Infinity Pool Section", description: "Pool banner background, overlay and call to action." },
  { key: "events", label: "Weddings & Events", description: "Wedding and meeting cards.", itemLabel: "Event" },
  { key: "gallery", label: "Gallery Section", description: "Homepage gallery images and order.", itemLabel: "Image" },
  { key: "experiences", label: "Experiences Section", description: "Experience cards, duration and imagery.", itemLabel: "Experience" },
  { key: "attractions", label: "Nearby Attractions", description: "Attraction cards, distance and imagery.", itemLabel: "Attraction" },
  { key: "testimonials", label: "Guest Reviews", description: "Review carousel content and timing.", itemLabel: "Review" },
  { key: "awards", label: "Awards", description: "Awards and recognition strip.", itemLabel: "Award" },
  { key: "instagram", label: "Instagram Section", description: "Instagram handle, link and image strip.", itemLabel: "Image" },
  { key: "journal", label: "Journal Section", description: "Homepage article cards and introduction.", itemLabel: "Article" },
  { key: "footerCta", label: "Footer CTA", description: "Newsletter call to action shown above the footer." },
  { key: "footer", label: "Footer", description: "Newsletter, contact details, logo and footer labels." },
];
