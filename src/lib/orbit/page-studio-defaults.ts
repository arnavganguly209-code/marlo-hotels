import {
  emptyStudioSection,
  PAGE_STUDIO_SECTIONS,
  type StudioSectionData,
} from "@/lib/orbit/page-studio";

function section(
  partial: Partial<StudioSectionData> & { heading?: string }
): StudioSectionData {
  return {
    ...emptyStudioSection(partial.heading || ""),
    ...partial,
    image: {
      assetId: null,
      src: "",
      alt: partial.image?.alt || partial.heading || "",
    },
    gallery: [],
    videoUrl: "",
    videoAssetId: null,
  };
}

/** Luxury copy defaults — all media deliberately empty for CMS upload. */
export const PAGE_STUDIO_DEFAULTS: Record<
  string,
  Record<string, StudioSectionData>
> = {
  spa: {
    hero: section({
      eyebrow: "Spa & Wellness",
      heading: "A sanctuary of stillness",
      description:
        "Himalayan traditions and contemporary therapy, composed into rituals of quiet luxury.",
      buttonText: "Book a Ritual",
      buttonLink: "/contact?subject=Spa booking",
      seoTitle: "Spa & Wellness | Marlo Hotels",
      seoDescription:
        "Marlo Spa — signature treatments, thermal wellness and private relaxation in Kathmandu.",
    }),
    intro: section({
      eyebrow: "Marlo Spa",
      heading: "Where the mountains teach stillness",
      description:
        "Five private treatment suites, a couples pavilion and a thermal circuit fed by mountain spring water. Every journey begins with a quiet consultation and ends with tea in the relaxation lounge.\n\nWe do not publish package pricing. Our therapists compose each ritual to the guest — duration, pressure and botanical oils chosen in the moment.",
    }),
    treatments: section({
      eyebrow: "Signature Treatments",
      heading: "Rituals without published rates",
      description:
        "Enquire with the spa desk for availability and investment. Treatments are reserved for hotel guests and private appointments.",
      items: [
        "Singing Bowl Journey | Himalayan bowls, warm oils and guided breath for deep nervous-system reset",
        "River Stone Massage | Basalt stones heated by spring water, long strokes along the spine",
        "Botanical Facial | Results-driven skincare with high-altitude botanicals",
        "Couples Pavilion Ritual | Side-by-side therapies in a private suite with shared tea service",
        "Body Polish & Wrap | Mineral scrub followed by a nourishing wrap and scalp massage",
        "In-Suite Wellness | Treatments delivered discreetly to your room on request",
      ].join("\n"),
    }),
    philosophy: section({
      eyebrow: "Wellness Philosophy",
      heading: "Less noise. More presence.",
      description:
        "We believe spa is not an amenity — it is the quiet centre of the stay. Light, scent and sound are considered as carefully as technique. Screens stay outside. Silence is welcome.",
    }),
    relaxation: section({
      eyebrow: "Relaxation Area",
      heading: "Spaces between treatments",
      description:
        "A fire-warmed lounge, herbal infusions and daybeds overlooking the garden canopy. Arrive early. Stay after. The room is yours.",
    }),
    features: section({
      eyebrow: "Spa Features",
      heading: "The spa, considered",
      features: [
        "Five private treatment suites",
        "Couples pavilion",
        "Thermal circuit with spring water",
        "Relaxation lounge & herbal tea service",
        "In-suite treatments on request",
        "Hotel-guest priority booking",
      ].join("\n"),
    }),
    hours: section({
      eyebrow: "Opening Hours",
      heading: "When we welcome you",
      description: "Appointments preferred. Walk-ins welcomed when suites are free.",
      hours: [
        "Daily | 9:00 AM – 9:00 PM",
        "Last treatment | 8:00 PM",
        "In-suite | By arrangement",
      ].join("\n"),
    }),
    gallery: section({
      eyebrow: "Gallery",
      heading: "Atmosphere, awaiting your photography",
      description: "Image slots remain empty until you upload from Orbit.",
    }),
    cta: section({
      eyebrow: "Reserve Quiet",
      heading: "Speak with the spa desk",
      description:
        "Our therapists will compose a ritual around your stay — without published rates, only considered care.",
      buttonText: "Contact Spa Concierge",
      buttonLink: "/contact?subject=Spa booking",
    }),
    faq: section({
      eyebrow: "FAQ",
      heading: "Before you arrive",
      faq: [
        "Do you publish package prices? | No. Investment is shared privately when you enquire, so each ritual can be composed to you.",
        "Can non-residents book? | Yes, subject to availability. Hotel guests receive priority.",
        "How early should I arrive? | Fifteen minutes before your appointment allows time in the relaxation lounge.",
        "Are couples treatments available? | Yes — the couples pavilion can be reserved for shared journeys.",
      ].join("\n"),
    }),
    booking: section({
      eyebrow: "Book Your Stay",
      heading: "Begin with a room, then a ritual",
      description:
        "Spa appointments are finest when paired with a night at Marlo. Explore rooms and continue to booking.",
      buttonText: "Explore Rooms",
      buttonLink: "/rooms",
    }),
    seo: section({
      heading: "SEO",
      seoTitle: "Spa & Wellness | Marlo Hotels Kathmandu",
      seoDescription:
        "Luxury spa and wellness at Marlo Hotels — signature treatments, thermal circuit and private relaxation. Enquire for appointments.",
    }),
  },
  dining: {
    hero: section({
      eyebrow: "Dining",
      heading: "Tables worth travelling for",
      description:
        "Contemporary Himalayan cuisine, morning breakfast rituals and evenings that linger.",
      buttonText: "Reserve a Table",
      buttonLink: "/contact?subject=Dining reservation",
    }),
    intro: section({
      eyebrow: "The Restaurant",
      heading: "One kitchen, many moods",
      description:
        "From first light breakfast to late tasting menus, our culinary team works the Himalayan larder with quiet precision. Seasonality leads. Technique follows.",
    }),
    breakfast: section({
      eyebrow: "Breakfast",
      heading: "Mornings, unhurried",
      description:
        "A considered breakfast — regional breads, orchard fruit, eggs cooked to order and coffee roasted for altitude. Served until late morning for guests who prefer the soft start.",
      hours: "Breakfast | 7:00 AM – 10:30 AM\nLate breakfast | Until 11:00 AM for in-house guests",
    }),
    experience: section({
      eyebrow: "Restaurant Experience",
      heading: "Light, linen and long courses",
      description:
        "Candlelight, attentive pacing and a room that never rushes the table. Whether a quiet lunch or a celebration dinner, service remains soft-spoken and exact.",
    }),
    cuisine: section({
      eyebrow: "Cuisine",
      heading: "What we cook",
      features: [
        "Contemporary Himalayan tasting menus",
        "Seasonal market produce",
        "Vegetarian & plant-forward compositions",
        "Rare pours and considered wine list",
        "Private dining on request",
      ].join("\n"),
    }),
    chef: section({
      eyebrow: "Chef Story",
      heading: "Craft over spectacle",
      description:
        "Our kitchen is led by chefs who favour restraint — fewer gestures, deeper flavour. Guests are welcome to request a kitchen greeting or a tailored tasting path.",
    }),
    gallery: section({
      eyebrow: "Gallery",
      heading: "The room, awaiting images",
      description: "Upload dining photography from Orbit when ready.",
    }),
    hours: section({
      eyebrow: "Opening Hours",
      heading: "When the kitchen is open",
      hours: [
        "Breakfast | 7:00 AM – 10:30 AM",
        "Lunch | 12:00 PM – 3:00 PM",
        "Dinner | 6:30 PM – 10:30 PM",
        "Bar | Until midnight",
      ].join("\n"),
    }),
    cta: section({
      eyebrow: "Reservations",
      heading: "Hold a table",
      description:
        "Speak with reservations for preferred seating, dietary notes or a private dining room.",
      buttonText: "Request a Reservation",
      buttonLink: "/contact?subject=Dining reservation",
    }),
    seo: section({
      heading: "SEO",
      seoTitle: "Dining | Marlo Hotels Kathmandu",
      seoDescription:
        "Fine dining and breakfast at Marlo Hotels — contemporary Himalayan cuisine, considered wine and private dining.",
    }),
  },
  experiences: {
    hero: section({
      eyebrow: "Experiences",
      heading: "The valley, opened for you",
      description:
        "Culture, adventure and quiet access — composed by the Marlo concierge.",
      buttonText: "Enquire",
      buttonLink: "/contact?subject=Experience enquiry",
    }),
    intro: section({
      eyebrow: "Concierge",
      heading: "Impossible to book elsewhere",
      description:
        "Every experience is arranged privately. Timings, guides and access change with the season — we compose around your stay, never a fixed brochure.",
    }),
    listing: section({
      eyebrow: "Signature Experiences",
      heading: "Journeys we arrange often",
      description: "Share what you seek — we will refine the day.",
      items: [
        "Sunrise Himalaya Flight | Clear-morning flights past the high peaks, timed with weather windows",
        "Heritage Walk with Historian | Durbar squares and courtyard temples with a private scholar",
        "Monastery Morning | Quiet attendance at dawn prayers, followed by butter tea",
        "Private Culinary Atelier | Market visit and kitchen session with our chefs",
        "Valley Sunset Drive | Soft light over terraces and ridgelines, returned before dinner",
        "Artisan Studio Visit | Family workshops for filigree, textile or ceramics",
      ].join("\n"),
    }),
    features: section({
      eyebrow: "Highlights",
      heading: "How we arrange",
      features: [
        "Private guides only",
        "Hotel-guest priority",
        "Flexible timing",
        "Vehicle & transfers included when relevant",
        "Quiet luxury pacing",
      ].join("\n"),
    }),
    gallery: section({
      eyebrow: "Gallery",
      heading: "Moments, awaiting photography",
      description: "Empty placeholders until you upload from Orbit.",
    }),
    cta: section({
      eyebrow: "Plan With Us",
      heading: "Tell the concierge what you seek",
      description:
        "We reply with a composed itinerary — never a generic package list.",
      buttonText: "Message Concierge",
      buttonLink: "/contact?subject=Experience enquiry",
    }),
    seo: section({
      heading: "SEO",
      seoTitle: "Experiences | Marlo Hotels Kathmandu",
      seoDescription:
        "Private luxury experiences in Kathmandu — heritage walks, mountain flights and artisan studios, arranged by Marlo Hotels.",
    }),
  },
  offers: {
    hero: section({
      eyebrow: "Offers & Packages",
      heading: "Considered ways to stay",
      description:
        "Seasonal privileges and composed packages for guests who book direct.",
      buttonText: "View Rooms",
      buttonLink: "/rooms",
    }),
    intro: section({
      eyebrow: "Direct Privileges",
      heading: "Offers without noise",
      description:
        "Each offer below can be created, scheduled, hidden or retired from Orbit inventory. Imagery stays empty until you upload.",
    }),
    listing: section({
      eyebrow: "Featured Offers",
      heading: "This season",
      description:
        "Use Orbit inventory to create live offer cards with scheduling. Studio items below are editorial highlights when inventory is empty.",
      items: [
        "Advance Purchase | Preferential rates when reserved ahead — enquire for current terms",
        "Honeymoon Stay | Quiet luxuries composed for two",
        "Wellness Escape | Room and spa rituals, arranged privately",
      ].join("\n"),
    }),
    gallery: section({
      eyebrow: "Gallery",
      heading: "Offer photography",
      description: "Upload campaign imagery when ready.",
    }),
    cta: section({
      eyebrow: "Book Direct",
      heading: "Continue to rooms",
      description:
        "Select a room, complete booking and apply your offer code at checkout when provided.",
      buttonText: "Explore Rooms & Book",
      buttonLink: "/rooms",
    }),
    seo: section({
      heading: "SEO",
      seoTitle: "Offers & Packages | Marlo Hotels",
      seoDescription:
        "Seasonal offers and packages at Marlo Hotels Kathmandu. Book direct for considered privileges.",
    }),
  },
};

export function getStudioDefaults(moduleSlug: string) {
  const sections = PAGE_STUDIO_SECTIONS[moduleSlug] || [];
  const seeded = PAGE_STUDIO_DEFAULTS[moduleSlug] || {};
  const doc: Record<string, StudioSectionData> = {};
  for (const def of sections) {
    doc[def.key] = seeded[def.key]
      ? { ...emptyStudioSection(def.label), ...seeded[def.key] }
      : emptyStudioSection(def.label);
  }
  return doc;
}
