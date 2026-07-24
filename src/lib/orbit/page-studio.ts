/**
 * Page-level Orbit studio schemas.
 * Each website PAGE has its own section list (not mixed into Homepage).
 */
export type PageSectionDef = {
  key: string;
  label: string;
  description: string;
  /** Extra field groups shown in the section editor. */
  fields?: Array<
    | "image"
    | "video"
    | "gallery"
    | "hours"
    | "features"
    | "faq"
    | "items"
    | "seo"
  >;
};

export type StudioImage = {
  assetId?: string | null;
  src: string;
  alt: string;
};

export type StudioSectionData = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: StudioImage;
  videoUrl: string;
  videoAssetId: string | null;
  gallery: StudioImage[];
  hours: string;
  features: string;
  faq: string;
  items: string;
  seoTitle: string;
  seoDescription: string;
};

export function emptyStudioSection(label = ""): StudioSectionData {
  return {
    enabled: true,
    eyebrow: "",
    heading: label,
    description: "",
    buttonText: "",
    buttonLink: "",
    image: { assetId: null, src: "", alt: "" },
    videoUrl: "",
    videoAssetId: null,
    gallery: [],
    hours: "",
    features: "",
    faq: "",
    items: "",
    seoTitle: "",
    seoDescription: "",
  };
}

export function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Features / items: "Title | Description" per line */
export function parseTitledLines(value: string) {
  return parseLines(value).map((line) => {
    const [title, ...rest] = line.split("|");
    return {
      title: (title || "").trim(),
      description: rest.join("|").trim(),
    };
  });
}

/** FAQ: "Question | Answer" per line */
export function parseFaqLines(value: string) {
  return parseTitledLines(value).map((item) => ({
    question: item.title,
    answer: item.description,
  }));
}

export const PAGE_STUDIO_SECTIONS: Record<string, PageSectionDef[]> = {
  about: [
    { key: "hero", label: "Cover", description: "About page cover.", fields: ["image", "video"] },
    { key: "story", label: "Luxury Story", description: "Brand story.", fields: ["image"] },
    { key: "facilities", label: "Facilities", description: "Facilities intro.", fields: ["items"] },
    { key: "services", label: "Services", description: "Services intro." },
    { key: "gallery", label: "Gallery", description: "About gallery.", fields: ["gallery"] },
    { key: "experience", label: "Experience", description: "Experience section." },
    { key: "cta", label: "CTA", description: "Bottom call to action." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  rooms: [
    { key: "hero", label: "Page Cover", description: "Rooms cover.", fields: ["image", "video"] },
    { key: "listing", label: "Intro", description: "Rooms introduction." },
    { key: "amenities", label: "Amenities", description: "Shared amenities.", fields: ["features"] },
    { key: "gallery", label: "Gallery", description: "Rooms gallery.", fields: ["gallery"] },
    { key: "cta", label: "CTA", description: "Bottom CTA." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  spa: [
    { key: "hero", label: "Hero Cover", description: "Spa hero cover / video.", fields: ["image", "video"] },
    { key: "intro", label: "Spa Introduction", description: "Opening story.", fields: ["image"] },
    {
      key: "treatments",
      label: "Signature Treatments",
      description: "Treatment names and descriptions (no prices).",
      fields: ["items"],
    },
    { key: "philosophy", label: "Wellness Philosophy", description: "Spa philosophy.", fields: ["image"] },
    { key: "relaxation", label: "Relaxation Area", description: "Relaxation spaces.", fields: ["image"] },
    { key: "features", label: "Spa Features", description: "Feature list.", fields: ["features"] },
    { key: "hours", label: "Opening Hours", description: "Spa opening hours.", fields: ["hours"] },
    { key: "gallery", label: "Gallery", description: "Spa gallery.", fields: ["gallery"] },
    { key: "cta", label: "Call To Action", description: "Mid-page CTA." },
    { key: "faq", label: "FAQ", description: "Spa FAQs.", fields: ["faq"] },
    { key: "booking", label: "Booking CTA", description: "Final booking CTA." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  dining: [
    { key: "hero", label: "Hero Cover", description: "Dining hero.", fields: ["image", "video"] },
    { key: "intro", label: "Restaurant Introduction", description: "Dining intro.", fields: ["image"] },
    { key: "breakfast", label: "Breakfast Area", description: "Breakfast story.", fields: ["image", "hours"] },
    { key: "experience", label: "Restaurant Experience", description: "Dining experience.", fields: ["image"] },
    { key: "cuisine", label: "Cuisine", description: "Cuisine highlights.", fields: ["features"] },
    { key: "chef", label: "Chef Story", description: "Chef narrative.", fields: ["image"] },
    { key: "gallery", label: "Gallery", description: "Dining gallery.", fields: ["gallery"] },
    { key: "hours", label: "Opening Hours", description: "Restaurant hours.", fields: ["hours"] },
    { key: "cta", label: "Reservation CTA", description: "Reserve a table." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  experiences: [
    { key: "hero", label: "Hero Cover", description: "Experiences hero.", fields: ["image", "video"] },
    { key: "intro", label: "Introduction", description: "Experiences intro.", fields: ["image"] },
    {
      key: "listing",
      label: "Experiences",
      description: "Experience cards (Title | Description).",
      fields: ["items", "gallery"],
    },
    { key: "features", label: "Highlights", description: "Highlight icons/text.", fields: ["features"] },
    { key: "gallery", label: "Gallery", description: "Experiences gallery.", fields: ["gallery"] },
    { key: "cta", label: "CTA", description: "Enquiry CTA." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  offers: [
    { key: "hero", label: "Hero Cover", description: "Offers hero.", fields: ["image", "video"] },
    { key: "intro", label: "Introduction", description: "Offers intro." },
    {
      key: "listing",
      label: "Offer Cards",
      description: "Offer cards (Title | Description). Manage inventory for live offers.",
      fields: ["items", "gallery"],
    },
    { key: "gallery", label: "Gallery", description: "Offers gallery.", fields: ["gallery"] },
    { key: "cta", label: "CTA", description: "Offers CTA." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  gallery: [
    { key: "hero", label: "Gallery Hero", description: "Gallery hero.", fields: ["image"] },
    { key: "collections", label: "Collections", description: "Collection intro.", fields: ["gallery"] },
    { key: "cta", label: "CTA", description: "Gallery CTA." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  wedding: [
    { key: "hero", label: "Wedding Hero", description: "Wedding hero.", fields: ["image", "video"] },
    { key: "packages", label: "Packages", description: "Wedding packages.", fields: ["items"] },
    { key: "gallery", label: "Gallery", description: "Wedding gallery.", fields: ["gallery"] },
    { key: "cta", label: "CTA", description: "Enquiry CTA." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  meetings: [
    { key: "hero", label: "Meetings Hero", description: "Meetings hero.", fields: ["image"] },
    { key: "spaces", label: "Spaces", description: "Meeting spaces.", fields: ["items"] },
    { key: "cta", label: "CTA", description: "Enquiry CTA." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  contact: [
    { key: "hero", label: "Contact Hero", description: "Contact hero.", fields: ["image"] },
    { key: "details", label: "Contact Details", description: "Address, phone, email.", fields: ["hours"] },
    { key: "form", label: "Contact Form", description: "Form labels." },
    { key: "seo", label: "SEO", description: "Metadata.", fields: ["seo"] },
  ],
  footer: [
    { key: "brand", label: "Brand", description: "Footer brand.", fields: ["image"] },
    { key: "links", label: "Links", description: "Footer links." },
    { key: "contact", label: "Contact", description: "Footer contact." },
    { key: "legal", label: "Legal", description: "Legal links." },
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
