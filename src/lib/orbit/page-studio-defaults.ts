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
      assetId: partial.image?.assetId ?? null,
      src: partial.image?.src || "",
      alt: partial.image?.alt || partial.heading || "",
    },
    gallery: Array.isArray(partial.gallery) ? partial.gallery : [],
    videoUrl: partial.videoUrl || "",
    videoAssetId: partial.videoAssetId ?? null,
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
      buttonText: "Book Spa",
      buttonLink: "/contact?subject=Spa booking",
    }),
    intro: section({
      eyebrow: "Marlo Spa",
      heading: "Wellness Inspired by the Himalayas",
      description:
        "Here, wellness is composed like hospitality — unhurried, precise and deeply personal. Drawing on Himalayan healing traditions and contemporary therapy, Marlo Spa invites you into balance: warm oils, quiet suites and rituals that restore body, mind and spirit after travel through the valley.",
    }),
    sanctuary: section({
      eyebrow: "Atmosphere",
      heading: "A Sanctuary of Calm",
      description:
        "Step from the lobby into a softer register of light and sound. Warm timber, amber glow and carefully considered quiet prepare you for what follows — not a schedule of treatments, but a passage into stillness.\n\nWhether you come after a day among the valley's temples or before an evening at the restaurant, the sanctuary meets you without hurry — herbal tea, soft seating and the assurance that every ritual begins in calm.",
      image: {
        src: "/images/spa/reception-lounge.png",
        alt: "Warm spa reception lounge at Marlo Hotels",
      },
    }),
    experience: section({
      eyebrow: "The Experience",
      heading: "Luxury Spa Experience",
      description:
        "Private rooms, considered materials and therapists who listen first — a spa experience composed to the standard of the world's great houses of hospitality.",
      image: {
        src: "/images/spa/treatment-rooms.png",
        alt: "Private spa treatment rooms with champagne-gold arches",
      },
      items: [
        "Private Treatment Rooms | Suites finished in cream, champagne gold and soft textile — composed for privacy and deep rest.",
        "Peaceful Atmosphere | Warm cove lighting, quiet corridors and a pace that never hurries the guest.",
        "Premium Wellness Experience | From thermal rituals to signature massage, every detail is tuned to five-star calm.",
        "Professional Therapists | Skilled practitioners who listen first — then compose the treatment your body asks for.",
      ].join("\n"),
    }),
    treatments: section({
      eyebrow: "Treatments",
      heading: "Our Signature Wellness Services",
      description:
        "Rituals composed without published rates — enquire with the spa desk for availability and a journey written around your stay.",
      items: [
        "Himalayan Massage | Long, rhythmic strokes guided by mountain breathwork — a ritual that softens travel and restores quiet presence.",
        "Hot Stone Therapy | Warm basalt stones placed along the spine, releasing deep muscular tension with unhurried, grounding pressure.",
        "Shirodhara Therapy | A continuous stream of warm herbal oil across the forehead — classic Ayurvedic calm for mind and nervous system.",
        "Sauna & Steam | Heat and botanical steam to open the body, ease circulation and prepare for deeper therapeutic work.",
        "Jacuzzi Experience | A private soak in illuminated waters — stillness after treatment, or a gentle prelude to massage.",
        "Ayurvedic Massage | Dosha-aware oils and traditional technique, composed to balance energy after days of travel and altitude.",
        "Deep Tissue Massage | Focused pressure for stubborn tension in shoulders, back and legs — precise, considered and restorative.",
        "Aromatherapy Massage | Essential oils chosen for the day — citrus for clarity, sandalwood for calm, florals for soft restoration.",
        "Facial Treatments | Results-driven skincare with high-altitude botanicals, composed for skin that has known sun, wind and city air.",
        "Couple Spa Experience | Side-by-side therapies in a private suite — shared silence, dual tables and a quieter kind of togetherness.",
      ].join("\n"),
    }),
    facilities: section({
      eyebrow: "Amenities",
      heading: "Spa Facilities",
      description:
        "Every space is arranged for ease — from the privacy of treatment suites to the glow of the jacuzzi and the quiet of the relaxation lounge.",
      image: {
        src: "/images/spa/jacuzzi.png",
        alt: "Private jacuzzi glowing with blue underwater light",
      },
      features: [
        "Private Treatment Rooms",
        "Jacuzzi",
        "Steam Room",
        "Sauna",
        "Couples Therapy Rooms",
        "Herbal Oils",
        "Relaxation Lounge",
        "Luxury Changing Rooms",
        "Fresh Towels",
        "Complimentary Herbal Tea",
      ].join("\n"),
    }),
    why: section({
      eyebrow: "Why Marlo Spa",
      heading: "Why Choose Our Spa",
      description:
        "Not an amenity checklist — a considered house of wellness within Marlo Hotels, where Himalayan tradition meets international five-star care.",
      image: {
        src: "/images/spa/treatment-suite.png",
        alt: "Couples spa suite with Himalayan singing bowls",
      },
      items: [
        "Professional Therapists | Seasoned hands and quiet attentiveness — every treatment paced to your body, never to a clock alone.",
        "Himalayan Wellness | Singing bowls, warm oils and mountain rituals woven into contemporary spa practice.",
        "Natural Oils | Botanical blends selected for purity and fragrance — soft on skin, lasting in memory.",
        "Private Environment | Suites composed for discretion. Screens stay outside. Silence is welcome.",
        "Premium Hospitality | From arrival tea to the final farewell, every gesture is considered and unhurried.",
        "Personalized Treatments | Pressure, duration and oils chosen in consultation — rituals written for you, not a menu.",
        "Luxury Relaxation | Spaces between treatments matter: lounge light, herbal infusions and time to simply arrive.",
      ].join("\n"),
    }),
    journey: section({
      eyebrow: "Your Path",
      heading: "Wellness Journey",
      description:
        "A simple, elegant passage from arrival to refreshment — every step held with care.",
      items: [
        "Arrival | Settle into the lounge with herbal tea and soft light.",
        "Consultation | A quiet conversation about pressure, focus and intention.",
        "Treatment | Private suites, considered technique, uninterrupted calm.",
        "Relaxation | Time to integrate — no rush back into the day.",
        "Refreshment | A final infusion before you return restored.",
      ].join("\n"),
    }),
    cta: section({
      eyebrow: "Reserve Quiet",
      heading: "Restore Your Mind, Body & Spirit",
      description:
        "Speak with our spa desk to compose a ritual around your stay — private suites, signature therapies and Himalayan calm, arranged with Marlo hospitality.",
      buttonText: "Book Spa",
      buttonLink: "/contact?subject=Spa booking",
      image: {
        src: "/images/spa/reception-desk.png",
        alt: "Spa reception desk prepared to welcome guests",
      },
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
      eyebrow: "Dining",
      heading: "An Elegant Dining Experience",
      description:
        "At Marlo Hotels, the table is composed with the same care as the suites — freshly prepared cuisine, a peaceful dining atmosphere, comfortable seating and warm hospitality. International quality service meets Himalayan generosity, so every meal feels unhurried, considered and quietly memorable.",
    }),
    memorable: section({
      eyebrow: "The Restaurant",
      heading: "Where Every Meal Becomes a Memorable Experience",
      description:
        "Light falls softly across timber and cream. Tables are spaced for conversation. The kitchen works without spectacle — seasonal produce, careful technique and a service rhythm that never hurries the guest.\n\nFrom Nepal's own flavours to familiar international plates, every dish is prepared to be shared, savoured and remembered — hospitality that feels personal, never performative.",
      image: {
        src: "/images/dining/seating-palm.png",
        alt: "Wooden dining tables and lattice chairs beside a palm in the Marlo restaurant",
      },
    }),
    highlights: section({
      eyebrow: "Highlights",
      heading: "Dining Highlights",
      description:
        "The essentials of a five-star table — freshness, comfort and hospitality held in balance from morning until late evening.",
      items: [
        "Fresh Daily Breakfast | A considered morning table — eggs to order, regional breads, orchard fruit and coffee roasted for altitude.",
        "International Cuisine | Familiar favourites and contemporary plates, composed with quiet precision for travellers and locals alike.",
        "Local Nepali Specialties | Himalayan flavours treated with care — spice, grain and seasonal market produce in generous hospitality.",
        "Fresh Coffee & Tea | Properly pulled espresso, leaf teas and afternoon refreshment for unhurried pauses between the day's plans.",
        "Comfortable Indoor Seating | Warm timber, soft light and tables spaced for conversation — a dining room that never feels crowded.",
        "Premium Hospitality | Attentive service without interruption — dietary notes remembered, pacing soft-spoken and exact.",
      ].join("\n"),
    }),
    timeline: section({
      eyebrow: "The Day at Table",
      heading: "Meal Experience Timeline",
      description:
        "A calm passage through the day — timings drawn from Marlo's live restaurant hours.",
      hours: [
        "Breakfast | 7:00 AM – 10:30 AM",
        "Lunch | 12:00 PM – 3:00 PM",
        "Evening Tea | 3:30 PM – 5:30 PM",
        "Dinner | 6:30 PM – 10:30 PM",
      ].join("\n"),
      items: [
        "Breakfast | An unhurried start — eggs to order, regional breads and coffee for the valley morning.",
        "Lunch | A calm midday table — light plates, Nepali favourites and international comforts.",
        "Evening Tea | A soft pause between afternoon and dinner — fresh tea, coffee and quiet seating.",
        "Dinner | Evening service with considered pacing — fresh ingredients and warm hospitality.",
      ].join("\n"),
    }),
    experience: section({
      eyebrow: "The Room",
      heading: "Restaurant Experience",
      description:
        "A bright, composed dining space — comfortable seating, fresh ingredients and personalized service in a relaxed atmosphere.",
      image: {
        src: "/images/dining/dining-hall.png",
        alt: "Bright hotel dining hall with service counter and Himalayan artwork",
      },
      items: [
        "Comfortable Seating | Solid wood tables and cushioned chairs arranged for ease — long lunches and quiet dinners equally welcome.",
        "Bright Dining Space | Cream walls, polished floors and warm recessed light keep the room open, calm and inviting all day.",
        "Fresh Ingredients | Produce chosen for the day, prepared in-house — flavour first, spectacle never required.",
        "Personalized Service | From first coffee to last course, the team listens and adjusts — allergies, preferences and pace included.",
        "Relaxed Atmosphere | No rush at the table. Soft conversation, considered plating and a room that holds stillness well.",
      ].join("\n"),
    }),
    why: section({
      eyebrow: "Why Marlo",
      heading: "Why Guests Love Dining With Us",
      features: [
        "Fresh Ingredients",
        "Daily Prepared Meals",
        "Comfortable Dining Area",
        "Professional Service",
        "Premium Coffee",
        "Family Friendly",
        "Peaceful Atmosphere",
        "Quality Hospitality",
      ].join("\n"),
    }),
    gallery: section({
      eyebrow: "Gallery",
      heading: "The Dining Room, Framed",
      description:
        "Tables, buffet light and the quiet architecture of hospitality — shown in full, never cropped for effect.",
      gallery: [
        {
          src: "/images/dining/seating-palm.png",
          alt: "Peaceful indoor seating with warm timber and cream walls",
        },
        {
          src: "/images/dining/breakfast-buffet.png",
          alt: "Breakfast buffet with chafing dishes and stacked white china",
        },
        {
          src: "/images/dining/dining-hall.png",
          alt: "Restaurant floor with wooden tables and pendant lighting",
        },
        {
          src: "/images/dining/bar-lounge.png",
          alt: "Bar counter with wooden slats and beverage service",
        },
      ],
    }),
    hours: section({
      eyebrow: "Opening Hours",
      heading: "When the kitchen is open",
      hours: [
        "Breakfast | 7:00 AM – 10:30 AM",
        "Lunch | 12:00 PM – 3:00 PM",
        "Evening Tea | 3:30 PM – 5:30 PM",
        "Dinner | 6:30 PM – 10:30 PM",
      ].join("\n"),
    }),
    cta: section({
      eyebrow: "Reservations",
      heading: "Enjoy Every Meal at Marlo Hotels",
      description:
        "Begin with a room, then a table — breakfast through dinner, composed with Marlo hospitality for guests who prefer the unhurried meal.",
      buttonText: "Reserve Your Stay",
      buttonLink: "/rooms",
      image: {
        src: "/images/dining/bar-lounge.png",
        alt: "Bar lounge at Marlo Hotels",
      },
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
      heading: "Experiences Composed for You",
      description:
        "Culture, quiet adventure and culinary access — arranged privately by the Marlo concierge. Timings, guides and entry change with the season. We compose around your stay, never a fixed brochure.",
    }),
    editorial: section({
      eyebrow: "The Valley",
      heading: "The Valley, Opened Privately",
      description:
        "From palace courtyards to ridge-top sunsets, every journey begins with a quiet conversation at the desk. We listen for what you want to feel — wonder, stillness, craft — then arrange the day with the same precision that shapes your room and table.\n\nVehicles, permissions and pacing are handled before you leave the lobby, so the experience itself remains unhurried and entirely yours.",
      image: {
        src: "/images/dining/seating-palm.png",
        alt: "Marlo Hotels hospitality",
      },
    }),
    listing: section({
      eyebrow: "Signature",
      heading: "Journeys We Arrange Often",
      description:
        "Share what you seek — we will refine the day. Each journey is reserved for hotel guests and private appointment.",
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
      eyebrow: "How We Work",
      heading: "Arranged With Quiet Precision",
      items: [
        "Private Guides Only | Historians, chefs and drivers arranged solely for your party.",
        "Flexible Timing | Sunrise flights and sunset drives paced around your stay.",
        "Transfers Included | Chauffeured vehicles when the journey asks for them.",
        "Quiet Luxury Pacing | Never rushed — every stop composed with Marlo hospitality.",
        "Hotel-Guest Priority | First access to weather windows and scarce appointments.",
        "Bespoke Composition | No fixed brochure — we refine each day to what you seek.",
      ].join("\n"),
    }),
    accent: section({
      eyebrow: "Hospitality Beyond the Lobby",
      heading: "From First Light to Last Lantern",
      description:
        "Whether a historian-led walk through living temples, a private kitchen session, or a ridge-top sunset, every detail is held before you arrive — so the hours themselves feel effortless.",
      buttonText: "Speak with the concierge",
      buttonLink: "/contact?subject=Experience enquiry",
      image: {
        src: "/images/spa/reception-lounge.png",
        alt: "Quiet hospitality at Marlo Hotels",
      },
    }),
    cta: section({
      eyebrow: "Enquire",
      heading: "Begin with a Conversation",
      description:
        "Tell us what you wish to see and feel. Our concierge will compose a private journey around your stay at Marlo Hotels.",
      buttonText: "Enquire Now",
      buttonLink: "/contact?subject=Experience enquiry",
      image: {
        src: "/images/spa/jacuzzi.png",
        alt: "",
      },
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
      heading: "Offers Without Noise",
      description:
        "Seasonal privileges and composed packages for guests who book direct. Each offer is considered — never crowded with promotions — and refined quietly for your stay in the valley.",
    }),
    editorial: section({
      eyebrow: "Stay With Intention",
      heading: "Considered Ways to Arrive",
      description:
        "From advance purchase to wellness escapes, every privilege is shaped for guests who prefer clarity over clutter. Terms remain private; hospitality remains unhurried.\n\nSelect a package that suits your journey, or enquire and we will compose something quieter still — rooms, rituals and table, held together.",
      image: {
        src: "/images/dining/seating-palm.png",
        alt: "Marlo Hotels guest stay",
      },
    }),
    listing: section({
      eyebrow: "This Season",
      heading: "Featured Privileges",
      description:
        "Book direct to secure current terms. Where a code is shown, apply it at checkout.",
      items: [
        "Advance Purchase | Preferential rates when reserved ahead — enquire for current terms",
        "Honeymoon Stay | Quiet luxuries composed for two",
        "Wellness Escape | Room and spa rituals, arranged privately",
      ].join("\n"),
    }),
    privileges: section({
      eyebrow: "Why Direct",
      heading: "Privileges Held Quietly",
      items: [
        "Book Direct | Preferential terms and clearer confirmation when you reserve with us.",
        "Flexible Timing | Seasonal windows composed around your travel dates — not a rigid catalogue.",
        "Quiet Luxuries | Spa rituals, dining moments and room upgrades arranged with discretion.",
        "Private Codes | Apply your offer at checkout when a code is provided — simply and privately.",
      ].join("\n"),
    }),
    accent: section({
      eyebrow: "Composed for Two — or the Family",
      heading: "Packages Shaped Around Your Stay",
      description:
        "Honeymoon quiet, wellness mornings, or an advance-purchase rate that simply makes room for longer — each package is held with the same care as your suite and table.",
      buttonText: "Speak with reservations",
      buttonLink: "/contact?subject=Offer enquiry",
      image: {
        src: "/images/spa/treatment-suite.png",
        alt: "Quiet luxury at Marlo Hotels",
      },
    }),
    pair: section({
      eyebrow: "Extra Photo",
      heading: "Optional framed photograph",
      description: "Upload a third clear photograph for the offers page (optional).",
      image: {
        src: "/images/dining/dining-hall.png",
        alt: "Dining hospitality at Marlo Hotels",
      },
    }),
    cta: section({
      eyebrow: "Book Direct",
      heading: "Continue to Rooms",
      description:
        "Select a room, complete your booking, and apply your offer code at checkout when one is provided. Our team remains available for private arrangements.",
      buttonText: "Explore Rooms & Book",
      buttonLink: "/rooms",
      image: {
        src: "/images/spa/reception-desk.png",
        alt: "",
      },
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
