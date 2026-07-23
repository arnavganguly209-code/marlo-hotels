/**
 * Page-level Orbit studio schemas.
 * Each website PAGE has its own section list (not mixed into Homepage).
 */
export type PageSectionDef = {
  key: string;
  label: string;
  description: string;
};

export const PAGE_STUDIO_SECTIONS: Record<string, PageSectionDef[]> = {
  rooms: [
    { key: "hero", label: "Page Cover", description: "Rooms page cover image." },
    { key: "listing", label: "Intro", description: "Rooms listing introduction." },
    { key: "amenities", label: "Amenities", description: "Shared amenities strip." },
    { key: "gallery", label: "Gallery", description: "Rooms page gallery." },
    { key: "cta", label: "CTA", description: "Bottom call to action." },
    { key: "seo", label: "SEO", description: "Title, description and Open Graph." },
  ],
  dining: [
    { key: "hero", label: "Page Cover", description: "Dining page cover." },
    { key: "restaurants", label: "Restaurants", description: "Venue listing introduction." },
    { key: "gallery", label: "Gallery", description: "Dining gallery." },
    { key: "cta", label: "CTA", description: "Reservations call to action." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  spa: [
    { key: "hero", label: "Page Cover", description: "Spa page cover." },
    { key: "treatments", label: "Treatments", description: "Treatments introduction." },
    { key: "packages", label: "Packages", description: "Packages introduction." },
    { key: "gallery", label: "Gallery", description: "Spa gallery." },
    { key: "cta", label: "CTA", description: "Spa booking CTA." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  gallery: [
    { key: "hero", label: "Gallery Hero", description: "Gallery page hero." },
    { key: "collections", label: "Collections", description: "Collection intro." },
    { key: "cta", label: "CTA", description: "Gallery CTA." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  offers: [
    { key: "hero", label: "Offers Hero", description: "Offers page hero." },
    { key: "listing", label: "Offers Listing", description: "Offers intro." },
    { key: "cta", label: "CTA", description: "Offers CTA." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  experiences: [
    { key: "hero", label: "Experiences Hero", description: "Experiences page hero." },
    { key: "listing", label: "Experiences Listing", description: "Experiences intro." },
    { key: "cta", label: "CTA", description: "Experiences CTA." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  wedding: [
    { key: "hero", label: "Wedding Hero", description: "Wedding page hero." },
    { key: "packages", label: "Packages", description: "Wedding packages intro." },
    { key: "gallery", label: "Gallery", description: "Wedding gallery." },
    { key: "cta", label: "CTA", description: "Enquiry CTA." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  meetings: [
    { key: "hero", label: "Meetings Hero", description: "Meetings page hero." },
    { key: "spaces", label: "Spaces", description: "Meeting spaces intro." },
    { key: "cta", label: "CTA", description: "Enquiry CTA." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  contact: [
    { key: "hero", label: "Contact Hero", description: "Contact page hero." },
    { key: "details", label: "Contact Details", description: "Address, phone, email." },
    { key: "form", label: "Contact Form", description: "Form labels." },
    { key: "seo", label: "SEO", description: "Page SEO metadata." },
  ],
  footer: [
    { key: "brand", label: "Brand", description: "Footer logo and description." },
    { key: "links", label: "Links", description: "Footer link columns." },
    { key: "contact", label: "Contact", description: "Footer contact block." },
    { key: "legal", label: "Legal", description: "Copyright and legal links." },
  ],
};

export const HOMEPAGE_STUDIO_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  rooms: "Rooms Preview",
  featuredSuites: "Featured Suites",
  dining: "Dining Preview",
  wellness: "Spa Preview",
  pool: "Infinity Pool",
  events: "Weddings & Events",
  gallery: "Gallery Preview",
  experiences: "Experiences Preview",
  attractions: "Nearby Attractions",
  testimonials: "Testimonials",
  awards: "Awards",
  instagram: "Instagram",
  journal: "Journal",
  footerCta: "CTA",
  footer: "Footer CTA",
};
