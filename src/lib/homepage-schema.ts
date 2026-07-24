import type { HomepageContent } from "@/lib/homepage-content";

export type HomepageSectionKey = keyof HomepageContent;

/**
 * Orbit Homepage left-panel sections — one card each, full-width editor.
 * Order matches the public luxury homepage narrative.
 */
export const HOMEPAGE_SECTIONS: {
  key: HomepageSectionKey;
  label: string;
  description: string;
  itemLabel?: string;
}[] = [
  { key: "hero", label: "Hero", description: "Cinematic video or cover image." },
  { key: "about", label: "About", description: "Hotel story and imagery." },
  { key: "rooms", label: "Rooms", description: "All room category cards.", itemLabel: "Room" },
  {
    key: "breakfast",
    label: "Restaurant",
    description: "Breakfast & restaurant preview.",
  },
  { key: "dining", label: "Dining Cards", description: "Restaurant venue cards.", itemLabel: "Restaurant" },
  { key: "wellness", label: "Spa", description: "Spa & wellness preview.", itemLabel: "Treatment" },
  {
    key: "facilities",
    label: "Facilities",
    description: "Hotel facilities grid.",
    itemLabel: "Facility",
  },
  {
    key: "whyStay",
    label: "Why Stay",
    description: "Reasons to choose Marlo.",
    itemLabel: "Reason",
  },
  {
    key: "guestServices",
    label: "Guest Services",
    description: "Airport, laundry, concierge and more.",
    itemLabel: "Service",
  },
  {
    key: "attractions",
    label: "Nearby Attractions",
    description: "Places near the hotel.",
    itemLabel: "Attraction",
  },
  {
    key: "testimonials",
    label: "Reviews",
    description: "Guest reviews.",
    itemLabel: "Review",
  },
  {
    key: "offers",
    label: "Offers",
    description: "Special offers preview.",
    itemLabel: "Offer",
  },
  { key: "gallery", label: "Gallery", description: "Homepage gallery.", itemLabel: "Image" },
  {
    key: "location",
    label: "Location",
    description: "Address, map and directions.",
  },
  { key: "footerCta", label: "Newsletter", description: "Newsletter call to action." },
  { key: "footer", label: "Footer CTA", description: "Footer labels and contact." },
];

/** Legacy keys kept in content JSON but hidden from the primary Orbit nav. */
export const HOMEPAGE_LEGACY_SECTIONS: HomepageSectionKey[] = [
  "featuredSuites",
  "pool",
  "events",
  "experiences",
  "awards",
  "instagram",
  "journal",
];
