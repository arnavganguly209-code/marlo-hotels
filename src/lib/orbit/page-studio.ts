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
    { key: "hero", label: "1 · Cover Image", description: "Top hero photo / video on /spa.", fields: ["image", "video"] },
    { key: "intro", label: "2 · Introduction", description: "Opening headline and story text." },
    { key: "sanctuary", label: "3 · Sanctuary Section", description: "Atmosphere text + framed photo.", fields: ["image"] },
    { key: "experience", label: "4 · Spa Experience", description: "Wide photo + experience cards.", fields: ["image", "items"] },
    { key: "treatments", label: "5 · Signature Treatments", description: "Treatment cards (no prices).", fields: ["items"] },
    { key: "facilities", label: "6 · Spa Facilities", description: "Facility list + photo.", fields: ["image", "features"] },
    { key: "why", label: "7 · Why Choose Us", description: "Reasons list + photo.", fields: ["image", "items"] },
    { key: "journey", label: "8 · Wellness Journey", description: "Step-by-step journey cards.", fields: ["items"] },
    { key: "cta", label: "9 · Bottom CTA", description: "Final call-to-action + soft background photo.", fields: ["image"] },
    { key: "seo", label: "SEO", description: "Google title and description.", fields: ["seo"] },
  ],
  dining: [
    { key: "hero", label: "1 · Cover Image", description: "Top hero photo / video on /dining.", fields: ["image", "video"] },
    { key: "intro", label: "2 · Introduction", description: "Opening headline and story text." },
    { key: "memorable", label: "3 · Memorable Experience", description: "Story text + framed photo.", fields: ["image"] },
    { key: "highlights", label: "4 · Dining Highlights", description: "Highlight cards.", fields: ["items"] },
    { key: "timeline", label: "5 · Meal Timeline", description: "Breakfast / lunch / dinner hours.", fields: ["hours", "items"] },
    { key: "experience", label: "6 · Restaurant Experience", description: "Wide photo + experience points.", fields: ["image", "items"] },
    { key: "why", label: "7 · Why Guests Love Us", description: "Short privilege labels.", fields: ["features"] },
    { key: "gallery", label: "8 · Framed Photos", description: "Up to 4 dining photos (replace / remove).", fields: ["gallery"] },
    { key: "cta", label: "9 · Bottom CTA", description: "Final call-to-action + soft background photo.", fields: ["image"] },
    { key: "hours", label: "Restaurant Hours", description: "Full opening hours (also feeds timeline).", fields: ["hours"] },
    { key: "seo", label: "SEO", description: "Google title and description.", fields: ["seo"] },
  ],
  experiences: [
    { key: "hero", label: "1 · Cover Image", description: "Top hero photo / video on /experiences.", fields: ["image", "video"] },
    { key: "intro", label: "2 · Introduction", description: "Opening headline and story text." },
    { key: "editorial", label: "3 · Valley Section", description: "Story text + framed photo.", fields: ["image"] },
    { key: "listing", label: "4 · Signature Journeys", description: "Experience cards.", fields: ["items"] },
    { key: "features", label: "5 · How We Arrange", description: "Arrangement cards.", fields: ["items"] },
    { key: "accent", label: "6 · Accent Section", description: "Second framed photo + story.", fields: ["image"] },
    { key: "cta", label: "7 · Bottom CTA", description: "Enquiry CTA + soft background photo.", fields: ["image"] },
    { key: "seo", label: "SEO", description: "Google title and description.", fields: ["seo"] },
  ],
  offers: [
    { key: "hero", label: "1 · Cover Image", description: "Top hero photo / video on /offers.", fields: ["image", "video"] },
    { key: "intro", label: "2 · Introduction", description: "Opening headline and story text." },
    { key: "editorial", label: "3 · Editorial Section", description: "Story text + framed photo.", fields: ["image"] },
    { key: "listing", label: "4 · Featured Offers", description: "Offer highlight cards (or use Inventory).", fields: ["items"] },
    { key: "privileges", label: "5 · Why Book Direct", description: "Privilege cards.", fields: ["items"] },
    { key: "accent", label: "6 · Packages Section", description: "Story + framed photo.", fields: ["image"] },
    { key: "pair", label: "7 · Extra Photo", description: "Optional third framed photo.", fields: ["image"] },
    { key: "cta", label: "8 · Bottom CTA", description: "Book CTA + soft background photo.", fields: ["image"] },
    { key: "seo", label: "SEO", description: "Google title and description.", fields: ["seo"] },
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
    // Contact uses ContactStudioEditor — kept for reference only.
    { key: "hero", label: "Cover Banner", description: "Contact cover.", fields: ["image"] },
    { key: "details", label: "Contact Details", description: "Address, phone, email.", fields: ["hours"] },
    { key: "form", label: "Contact Form", description: "Form labels." },
    { key: "map", label: "Google Map", description: "Map coordinates." },
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
