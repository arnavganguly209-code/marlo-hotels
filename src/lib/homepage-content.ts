import "server-only";

import { getPosts } from "@/content/blog";
import { getRestaurants } from "@/content/dining";
import { getExperiences } from "@/content/experiences";
import {
  awards,
  attractions,
  galleryImages,
  instagramFeed,
  testimonials,
} from "@/content/gallery";
import { getRooms } from "@/content/rooms";
import { treatments } from "@/content/spa";
import { getDb } from "@/lib/db";
import { footerNav, siteConfig } from "@/lib/site";
import type {
  Attraction,
  Award,
  Experience,
  GalleryImage,
  Post,
  Restaurant,
  Room,
  SpaTreatment,
  Testimonial,
} from "@/types/content";

export type EditableImage = {
  assetId?: string | null;
  src: string;
  alt: string;
  title?: string;
  focalX?: number;
  focalY?: number;
};

export type SectionCopy = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  highlightedText?: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
};

export type HeroEditorContent = SectionCopy & {
  subheading: string;
  scrollLabel: string;
  image: EditableImage;
  logo: EditableImage;
  logoDesktopWidth: number;
  logoTabletWidth: number;
  logoMobileWidth: number;
  logoLeftMargin: number;
  logoTopMargin: number;
  logoOpacity: number;
  overlay: "Light" | "Balanced" | "Dark";
  overlayOpacity: number;
  contentAlignment: "Left" | "Center" | "Right";
  desktopHeight: "Viewport" | "Tall" | "Medium";
  mobileHeight: "Viewport" | "Tall" | "Medium";
  animation: "KenBurns" | "Subtle" | "None";
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  bookingWidget: boolean;
  mediaType: "IMAGE" | "VIDEO";
  videoUrl?: string;
  videoAssetId?: string | null;
  mobileVideoUrl?: string;
  mobileVideoAssetId?: string | null;
  poster?: EditableImage;
  videoAutoplay: boolean;
  videoLoop: boolean;
  videoMuted: boolean;
  videoPlaysInline: boolean;
  videoDurationMs?: number | null;
  videoSizeBytes?: number | null;
  videoWidth?: number | null;
  videoHeight?: number | null;
  booking: {
    checkInLabel: string;
    checkOutLabel: string;
    guestsLabel: string;
    adultsLabel: string;
    childrenLabel: string;
    roomsLabel: string;
    promoLabel: string;
    promoPlaceholder: string;
    submitLabel: string;
  };
};

export type AboutEditorContent = SectionCopy & {
  badgeValue: string;
  badgeLabel: string;
  paragraphs: string[];
  stats: { value: string; label: string }[];
  images: EditableImage[];
};

export type CollectionSection<T> = SectionCopy & {
  items: T[];
  labels?: Record<string, string>;
};

export type WellnessEditorContent = SectionCopy & {
  images: EditableImage[];
  treatments: SpaTreatment[];
};

export type PoolEditorContent = SectionCopy & {
  image: EditableImage;
  overlay: "Light" | "Balanced" | "Dark";
};

export type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

export type FeatureGridSection = SectionCopy & {
  items: FeatureItem[];
};

export type BreakfastEditorContent = SectionCopy & {
  images: EditableImage[];
  timings: { label: string; hours: string }[];
};

export type LocationEditorContent = SectionCopy & {
  address: string;
  phone: string;
  mapEmbedUrl: string;
};

export type OfferPreviewItem = {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  image: EditableImage;
};

export type OffersEditorContent = SectionCopy & {
  items: OfferPreviewItem[];
};

export type EventEditorItem = {
  eyebrow: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: EditableImage;
};

export type InstagramEditorContent = {
  enabled: boolean;
  handle: string;
  link: string;
  images: EditableImage[];
};

export type FooterCtaEditorContent = SectionCopy;

export type FooterEditorContent = {
  enabled: boolean;
  description: string;
  hotelHeading: string;
  discoverHeading: string;
  findUsHeading: string;
  address: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  logo: EditableImage;
  hotelLinks: { label: string; href: string }[];
  discoverLinks: { label: string; href: string }[];
  socialLinks: { label: string; href: string }[];
  copyrightText: string;
  developerLabel: string;
  developerName: string;
  developerUrl: string;
};

export type HomepageContent = {
  hero: HeroEditorContent;
  about: AboutEditorContent;
  rooms: CollectionSection<Room>;
  featuredSuites: CollectionSection<Room>;
  breakfast: BreakfastEditorContent;
  dining: CollectionSection<Restaurant>;
  wellness: WellnessEditorContent;
  facilities: FeatureGridSection;
  whyStay: FeatureGridSection;
  guestServices: FeatureGridSection;
  pool: PoolEditorContent;
  events: CollectionSection<EventEditorItem>;
  gallery: CollectionSection<GalleryImage>;
  experiences: CollectionSection<Experience>;
  attractions: CollectionSection<Attraction>;
  testimonials: CollectionSection<Testimonial> & { autoplayMs: number };
  offers: OffersEditorContent;
  location: LocationEditorContent;
  awards: CollectionSection<Award>;
  instagram: InstagramEditorContent;
  journal: CollectionSection<Post>;
  footerCta: FooterCtaEditorContent;
  footer: FooterEditorContent;
};

function image(src: string, alt: string, title?: string): EditableImage {
  return { src, alt, title, focalX: 50, focalY: 50 };
}

export async function getHomepageDefaults(): Promise<HomepageContent> {
  const [rooms, restaurants, experiences, posts] = await Promise.all([
    getRooms(),
    getRestaurants(),
    getExperiences(),
    getPosts(),
  ]);

  return {
    hero: {
      enabled: true,
      eyebrow: "Experience Timeless Elegance",
      heading: "Stay Beyond Extraordinary",
      highlightedText: "Extraordinary",
      description: siteConfig.description,
      subheading: siteConfig.description,
      buttonText: "Discover More",
      buttonLink: "/rooms",
      scrollLabel: "Scroll",
      image: image(
        "/images/brand/hero-reception.png",
        "Marlo Hotels lobby and reception — Hotel Marlo",
        "Homepage Hero"
      ),
      logo: image("/images/brand/logo.png", "Marlo Hotels", "Primary Logo"),
      logoDesktopWidth: 156,
      logoTabletWidth: 145,
      logoMobileWidth: 133,
      logoLeftMargin: 0,
      logoTopMargin: 0,
      logoOpacity: 100,
      overlay: "Balanced",
      overlayOpacity: 70,
      contentAlignment: "Left",
      desktopHeight: "Viewport",
      mobileHeight: "Viewport",
      animation: "KenBurns",
      secondaryButtonText: "View Offers",
      secondaryButtonLink: "/offers",
      bookingWidget: true,
      mediaType: "VIDEO",
      videoUrl: "",
      videoAssetId: null,
      videoAutoplay: true,
      videoLoop: true,
      videoMuted: true,
      videoPlaysInline: true,
      booking: {
        checkInLabel: "Check In",
        checkOutLabel: "Check Out",
        guestsLabel: "Guests & Rooms",
        adultsLabel: "Adults",
        childrenLabel: "Children",
        roomsLabel: "Rooms",
        promoLabel: "Promo Code",
        promoPlaceholder: "Optional",
        submitLabel: "Check Availability",
      },
    },
    about: {
      enabled: true,
      eyebrow: "About Marlo Hotels",
      heading: "A sanctuary composed of mountain light and quiet luxury",
      highlightedText: "mountain light",
      description:
        "Marlo Hotels rises at the meeting point of Kathmandu's royal quarter and the valley's green rim — a house of deep forest tones, hand-carved timber and gold that catches the evening sun. Every space was composed with one intention: that you feel the mountains before you see them.",
      paragraphs: [
        "Marlo Hotels rises at the meeting point of Kathmandu's royal quarter and the valley's green rim — a house of deep forest tones, hand-carved timber and gold that catches the evening sun. Every space was composed with one intention: that you feel the mountains before you see them.",
        "From the tasting tables of Amaya to the stillness of the spa and the infinity pool that pours into the horizon, ours is a hospitality of unhurried detail — Himalayan at heart, world-class in execution.",
      ],
      buttonText: "Explore The Hotel",
      buttonLink: "/about",
      badgeValue: "Since 2024",
      badgeLabel: "A New Landmark",
      stats: [
        { value: "68", label: "Rooms & Suites" },
        { value: "3", label: "Dining Venues" },
        { value: "5★", label: "Service Standard" },
        { value: "24/7", label: "Concierge" },
      ],
      images: [
        image(
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1600&auto=format&fit=crop",
          "Marlo Hotels architecture rising above the gardens"
        ),
        image(
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop",
          "The infinity pool at first light"
        ),
      ],
    },
    rooms: {
      enabled: true,
      eyebrow: "Rooms & Suites",
      heading: "Quarters of quiet grandeur",
      description:
        "Sixty-eight rooms and suites layered in forest green, cream and hand-finished brass — each one an argument for staying in.",
      buttonText: "View All Rooms & Suites",
      buttonLink: "/rooms",
      labels: {
        room: "Room",
        suite: "Suite",
        from: "From",
        perNight: "/ night",
        size: "Size",
        occupancy: "Occupancy",
        view: "View",
        details: "View Details",
      },
      items: rooms,
    },
    featuredSuites: {
      enabled: false,
      eyebrow: "Featured Suites",
      heading: "The addresses guests return for",
      description:
        "Our signature suites pair residential scale with the craft of the valley — private terraces, carved timber and service that reads your mind.",
      labels: {
        from: "From",
        perNight: "/ night",
        explore: "Explore Suite",
      },
      items: rooms.filter((room) => room.category === "suite" && room.featured),
    },
    dining: {
      enabled: true,
      eyebrow: "Dining Experience",
      heading: "Tables worth travelling for",
      description:
        "Himalayan hospitality at the table — from breakfast to late-hour dining.",
      buttonText: "View Dining",
      buttonLink: "/dining",
      items: restaurants,
    },
    breakfast: {
      enabled: true,
      eyebrow: "Breakfast & Restaurant",
      heading: "A morning composed with care",
      description:
        "Begin the day in our breakfast area with fresh breads, seasonal fruit and hot dishes prepared to order. Our restaurant continues through the day with Nepali and continental favourites.",
      buttonText: "View Dining",
      buttonLink: "/dining",
      images: [
        image(
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600&auto=format&fit=crop",
          "Breakfast at Marlo Hotels"
        ),
      ],
      timings: [
        { label: "Breakfast", hours: "7:00 AM – 10:30 AM" },
        { label: "Lunch", hours: "12:00 PM – 3:00 PM" },
        { label: "Dinner", hours: "6:30 PM – 10:00 PM" },
      ],
    },
    wellness: {
      enabled: true,
      eyebrow: "Spa & Wellness",
      heading: "Stillness, drawn from quiet care",
      highlightedText: "quiet care",
      description:
        "Massage, wellness rituals and unhurried relaxation — a spa experience composed for recovery after travel and exploration.",
      buttonText: "Enter Marlo Spa",
      buttonLink: "/spa",
      images: [
        image(
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop",
          "A Marlo Spa ritual"
        ),
        image(
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
          "Treatment suite at Marlo Spa"
        ),
      ],
      treatments: treatments.filter(
        (treatment) => treatment.category === "Signature Journey"
      ),
    },
    facilities: {
      enabled: true,
      eyebrow: "Hotel Facilities",
      heading: "Everything arranged for an easy stay",
      description:
        "From arrival to departure, Marlo is equipped with the essentials of a modern luxury hotel.",
      items: [
        { icon: "bed", title: "Luxury Accommodation", description: "Thoughtfully appointed rooms and suites." },
        { icon: "utensils", title: "Restaurant", description: "All-day dining with Himalayan hospitality." },
        { icon: "coffee", title: "Breakfast Area", description: "Fresh morning service every day." },
        { icon: "spa", title: "Spa", description: "Massage and wellness in quiet suites." },
        { icon: "wifi", title: "Free WiFi", description: "High-speed internet throughout the hotel." },
        { icon: "plane", title: "Airport Transfer", description: "Private transfers on request." },
        { icon: "clock", title: "24 Hour Reception", description: "Front desk assistance around the clock." },
        { icon: "roomService", title: "Room Service", description: "In-room dining when you prefer privacy." },
        { icon: "laundry", title: "Laundry", description: "Same-day laundry and pressing." },
        { icon: "parking", title: "Parking", description: "Secure parking for guests." },
        { icon: "travel", title: "Travel Assistance", description: "Tickets, guides and itineraries." },
      ],
    },
    whyStay: {
      enabled: true,
      eyebrow: "Why Stay With Marlo",
      heading: "A hotel that feels considered",
      description:
        "Quiet luxury, attentive service and a location that places Kathmandu’s finest addresses within easy reach.",
      items: [
        { icon: "sparkles", title: "Thoughtful Design", description: "Warm materials, calm spaces and rooms made for rest." },
        { icon: "concierge", title: "Attentive Service", description: "A team that anticipates without interrupting." },
        { icon: "bed", title: "Genuine Comfort", description: "Premium bedding and practical luxury amenities." },
        { icon: "plane", title: "Effortless Arrival", description: "Transfers, guidance and a seamless check-in." },
      ],
    },
    guestServices: {
      enabled: true,
      eyebrow: "Guest Services",
      heading: "Support that stays out of the way",
      description:
        "Practical services arranged with the same quiet standard as the rooms themselves.",
      items: [
        { icon: "plane", title: "Airport Pickup", description: "Meet-and-greet transfers from Tribhuvan International." },
        { icon: "roomService", title: "Room Service", description: "Meals delivered to your room." },
        { icon: "wifi", title: "Free WiFi", description: "Reliable connection in every space." },
        { icon: "laundry", title: "Laundry", description: "Laundry and dry cleaning on request." },
        { icon: "sparkles", title: "Daily Housekeeping", description: "Fresh linens and a reset room each day." },
        { icon: "travel", title: "Travel Desk", description: "Tours, tickets and local recommendations." },
        { icon: "concierge", title: "Concierge", description: "Reservations, arrangements and local insight." },
      ],
    },
    pool: {
      enabled: false,
      eyebrow: "The Infinity Pool",
      heading: "Where the water ends and the valley begins",
      highlightedText: "valley begins",
      description:
        "Heated year-round and poured to the very edge of the terrace, the pool holds the valley in its surface — sunrise laps, golden-hour swims and service that arrives before you raise a hand.",
      buttonText: "See The Pool",
      buttonLink: "/gallery",
      image: image(
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2400&auto=format&fit=crop",
        "The infinity pool pouring into the valley horizon"
      ),
      overlay: "Balanced",
    },
    events: {
      enabled: false,
      eyebrow: "Weddings · Meetings · Events",
      heading: "Occasions, given a stage",
      description:
        "From intimate vows to gala dinners for three hundred — our events atelier composes celebrations with the valley as backdrop.",
      items: [
        {
          eyebrow: "Weddings & Celebrations",
          title: "Weddings Above the Valley",
          description:
            "Terrace vows for eighty as the sun sets behind the hills, or three-day celebrations choreographed by our events atelier — every wedding begins with a long conversation about the two of you.",
          buttonText: "Plan Your Wedding",
          buttonLink: "/contact",
          image: image(
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1920&auto=format&fit=crop",
            "Wedding reception beneath chandeliers at Marlo Hotels"
          ),
        },
        {
          eyebrow: "Meetings & Boardrooms",
          title: "Meetings With a View",
          description:
            "Daylit boardrooms, a garden ballroom for three hundred, and the kind of coffee breaks people write home about. Our team handles everything from staging to sunset cocktails.",
          buttonText: "Enquire For Events",
          buttonLink: "/contact",
          image: image(
            "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1920&auto=format&fit=crop",
            "Elegant conference space prepared for an event"
          ),
        },
      ],
    },
    gallery: {
      enabled: true,
      eyebrow: "Gallery",
      heading: "Marlo, framed",
      description:
        "Light on brass, quiet corridors and rooms composed for rest — a preview of life at Marlo Hotels.",
      buttonText: "View Full Gallery",
      buttonLink: "/gallery",
      items: galleryImages.slice(0, 6),
    },
    experiences: {
      enabled: false,
      eyebrow: "Luxury Experiences",
      heading: "The valley, opened for you",
      description:
        "Sunrise flights past Everest, historian-led walks and ateliers behind unmarked doors — experiences composed by our concierge, impossible to book anywhere else.",
      buttonText: "All Experiences",
      buttonLink: "/experiences",
      labels: { discover: "Discover" },
      items: experiences.slice(0, 3),
    },
    attractions: {
      enabled: true,
      eyebrow: "Nearby Attractions",
      heading: "Seven centuries at the doorstep",
      description:
        "Palace squares, hilltop stupas and cities of artisans — the valley's greatest treasures sit minutes from the lobby.",
      items: attractions,
    },
    testimonials: {
      enabled: true,
      eyebrow: "Guest Reviews",
      heading: "In our guests' words",
      description: "Five-star stays, remembered by the people who lived them.",
      autoplayMs: 7000,
      items: testimonials,
    },
    offers: {
      enabled: true,
      eyebrow: "Special Offers",
      heading: "Occasions to stay longer",
      description:
        "Seasonal rates and packages composed for couples, families and extended stays.",
      buttonText: "View All Offers",
      buttonLink: "/offers",
      items: [
        {
          title: "Extended Stay",
          description: "Preferential rates when you stay three nights or more.",
          buttonText: "Enquire",
          buttonLink: "/offers",
          image: image(
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1400&auto=format&fit=crop",
            "Suite at Marlo Hotels"
          ),
        },
        {
          title: "Breakfast Inclusive",
          description: "Add breakfast for every guest in your room.",
          buttonText: "Book Now",
          buttonLink: "/rooms",
          image: image(
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1400&auto=format&fit=crop",
            "Breakfast service"
          ),
        },
        {
          title: "Airport Transfer",
          description: "Arrive rested with private transfer from the airport.",
          buttonText: "Contact Us",
          buttonLink: "/contact",
          image: image(
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1400&auto=format&fit=crop",
            "Airport transfer"
          ),
        },
      ],
    },
    location: {
      enabled: true,
      eyebrow: "Location",
      heading: "In the heart of Kathmandu",
      description:
        "Marlo Hotels sits within easy reach of Durbar Marg, Thamel and the city’s ceremonial squares.",
      buttonText: "Get Directions",
      buttonLink: "https://maps.google.com/?q=Durbar+Marg+Kathmandu",
      address: "Durbar Marg, Kathmandu 44600, Nepal",
      phone: siteConfig.contact.phone,
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2!2d85.318!3d27.705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQyJzE4LjAiTiA4NcKwMTknMDQuOCJF!5e0!3m2!1sen!2snp!4v1",
    },
    awards: {
      enabled: false,
      eyebrow: "Awards",
      heading: "Recognition",
      description: "Independent recognition for Marlo hospitality.",
      items: awards,
    },
    instagram: {
      enabled: false,
      handle: "@marlohotels",
      link: siteConfig.social.instagram,
      images: instagramFeed.map((item) => image(item.src, item.alt)),
    },
    journal: {
      enabled: false,
      eyebrow: "The Journal",
      heading: "Latest from the valley",
      description:
        "Itineraries from our concierge desk, the craft behind the suites, and dispatches from Amaya's kitchen.",
      buttonText: "Read The Journal",
      buttonLink: "/blog",
      labels: { readArticle: "Read Article" },
      items: posts.slice(0, 3),
    },
    footerCta: {
      enabled: true,
      eyebrow: "The Marlo Letter",
      heading: "Stories & private offers, occasionally",
      description:
        "A considered letter from the valley — new seasons, quiet openings and offers reserved for subscribers.",
    },
    footer: {
      enabled: true,
      description:
        "A five-star sanctuary in the heart of Kathmandu — timeless elegance, celebrated dining and Himalayan hospitality.",
      hotelHeading: "The Hotel",
      discoverHeading: "Discover",
      findUsHeading: "Find Us",
      address: siteConfig.contact.address,
      phone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      checkIn: siteConfig.hours.checkIn,
      checkOut: siteConfig.hours.checkOut,
      logo: image("/images/brand/logo.png", "Marlo Hotels", "Footer Logo"),
      hotelLinks: footerNav.hotel.map((link) => ({ ...link })),
      discoverLinks: footerNav.discover.map((link) => ({ ...link })),
      socialLinks: [
        { label: "Instagram", href: siteConfig.social.instagram },
        { label: "Facebook", href: siteConfig.social.facebook },
        { label: "X (Twitter)", href: siteConfig.social.twitter },
        { label: "YouTube", href: siteConfig.social.youtube },
      ],
      copyrightText: `${siteConfig.legalName} All rights reserved.`,
      developerLabel: "Developed By",
      developerName: "The Global Orbit",
      developerUrl: "https://theglobalorbit.com/",
    },
  };
}

function mergeCurrent<T>(defaults: T, saved: unknown): T {
  if (Array.isArray(defaults)) {
    return (Array.isArray(saved) && saved.length ? saved : defaults) as T;
  }
  if (defaults && typeof defaults === "object") {
    const result: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
    const source =
      saved && typeof saved === "object"
        ? (saved as Record<string, unknown>)
        : {};
    for (const [key, defaultValue] of Object.entries(result)) {
      const savedValue = source[key];
      if (
        savedValue === undefined ||
        savedValue === null ||
        (typeof savedValue === "string" && savedValue.trim() === "")
      ) {
        continue;
      }
      result[key] = mergeCurrent(defaultValue, savedValue);
    }
    for (const [key, savedValue] of Object.entries(source)) {
      if (!(key in result)) result[key] = savedValue;
    }
    return result as T;
  }
  return (saved === undefined || saved === null ? defaults : saved) as T;
}

export function mergeHomepageContent(
  current: HomepageContent,
  saved: unknown
): HomepageContent {
  return mergeCurrent(current, saved);
}

export async function getHomepageContent(): Promise<HomepageContent> {
  let defaults = await getHomepageDefaults();
  const db = getDb();
  if (!db) return withLiveRooms(defaults);

  try {
    const placements = await db.mediaPlacement.findMany({
      where: {
        key: {
          in: [
            "home.hero",
            "home.about.primary",
            "home.about.secondary",
            "home.wellness.primary",
            "home.wellness.secondary",
            "home.pool",
            "home.events.primary",
            "home.events.secondary",
            "brand.logo",
            "brand.footerLogo",
          ],
        },
      },
      include: { asset: true },
    });
    const placedImage = (
      key: string,
      current: EditableImage
    ): EditableImage => {
      const placement = placements.find((item) => item.key === key);
      if (!placement?.asset) return current;
      return {
        assetId: placement.asset.id,
        src: placement.asset.url,
        alt: placement.alt || placement.asset.alt || current.alt,
        title: placement.title || placement.asset.title || current.title,
        focalX: placement.focalX,
        focalY: placement.focalY,
      };
    };
    const heroPlacement = placements.find((item) => item.key === "home.hero");
    defaults = {
      ...defaults,
      hero: {
        ...defaults.hero,
        image: placedImage("home.hero", defaults.hero.image),
        logo: placedImage("brand.logo", defaults.hero.logo),
        mediaType:
          heroPlacement?.mediaType === "VIDEO"
            ? "VIDEO"
            : defaults.hero.mediaType,
        videoUrl:
          heroPlacement?.mediaType === "VIDEO" && heroPlacement.asset
            ? heroPlacement.asset.url
            : defaults.hero.videoUrl,
        videoAssetId:
          heroPlacement?.mediaType === "VIDEO"
            ? heroPlacement.assetId
            : defaults.hero.videoAssetId,
        poster: heroPlacement?.posterUrl
          ? image(
              heroPlacement.posterUrl,
              heroPlacement.alt || defaults.hero.image.alt,
              "Hero Video Poster"
            )
          : defaults.hero.poster,
        videoAutoplay:
          heroPlacement?.videoAutoplay ?? defaults.hero.videoAutoplay,
        videoLoop: heroPlacement?.videoLoop ?? defaults.hero.videoLoop,
        videoMuted: heroPlacement?.videoMuted ?? defaults.hero.videoMuted,
      },
      about: {
        ...defaults.about,
        images: [
          placedImage("home.about.primary", defaults.about.images[0]),
          placedImage("home.about.secondary", defaults.about.images[1]),
        ],
      },
      wellness: {
        ...defaults.wellness,
        images: [
          placedImage("home.wellness.primary", defaults.wellness.images[0]),
          placedImage("home.wellness.secondary", defaults.wellness.images[1]),
        ],
      },
      pool: {
        ...defaults.pool,
        image: placedImage("home.pool", defaults.pool.image),
      },
      events: {
        ...defaults.events,
        items: defaults.events.items.map((item, index) => ({
          ...item,
          image: placedImage(
            index === 0 ? "home.events.primary" : "home.events.secondary",
            item.image
          ),
        })),
      },
      footer: {
        ...defaults.footer,
        logo: placedImage("brand.footerLogo", defaults.footer.logo),
      },
    };

    const entries = await db.contentEntry.findMany({
      where: { module: "homepage", status: "PUBLISHED" },
      orderBy: { updatedAt: "asc" },
      select: { key: true, data: true, updatedAt: true },
    });
    const document = entries.find((entry) => entry.key === "visual-editor");
    let merged = mergeCurrent(defaults, document?.data);

    // Legacy per-section homepage entries (e.g. key "hero") only seed the
    // visual editor when the dedicated document does not exist yet. Once
    // visual-editor is published it is the single source of truth.
    if (!document) {
      for (const entry of entries) {
        const data = entry.data as Record<string, unknown>;
        const legacyName =
          typeof data.section === "string"
            ? data.section.toLowerCase()
            : entry.key;
        const key =
          legacyName === "hero"
            ? "hero"
            : legacyName.includes("about")
              ? "about"
              : null;
        if (key) {
          merged = {
            ...merged,
            [key]: mergeCurrent(merged[key], data),
          };
        }
      }
    }
    if (
      heroPlacement?.asset &&
      (!document || heroPlacement.updatedAt > document.updatedAt)
    ) {
      merged = {
        ...merged,
        hero: {
          ...merged.hero,
          image: placedImage("home.hero", merged.hero.image),
          mediaType:
            heroPlacement.mediaType === "VIDEO"
              ? "VIDEO"
              : merged.hero.mediaType,
          videoUrl:
            heroPlacement.mediaType === "VIDEO"
              ? heroPlacement.asset.url
              : merged.hero.videoUrl,
          videoAssetId:
            heroPlacement.mediaType === "VIDEO"
              ? heroPlacement.assetId
              : merged.hero.videoAssetId,
          videoAutoplay:
            heroPlacement.videoAutoplay ?? merged.hero.videoAutoplay,
          videoLoop: heroPlacement.videoLoop ?? merged.hero.videoLoop,
          videoMuted: heroPlacement.videoMuted ?? merged.hero.videoMuted,
          poster: heroPlacement.posterUrl
            ? image(
                heroPlacement.posterUrl,
                heroPlacement.alt || merged.hero.image.alt,
                "Hero Video Poster"
              )
            : merged.hero.poster,
        },
      };
    }
    return withLiveRooms(
      await ensureOfficialHeroVideo(
        stripDemoHeroMedia(normalizeAboutLinks(merged))
      )
    );
  } catch {
    return withLiveRooms(
      await ensureOfficialHeroVideo(
        stripDemoHeroMedia(normalizeAboutLinks(defaults))
      )
    );
  }
}

/** Always show live Orbit room inventory on the homepage (all published rooms). */
async function withLiveRooms(
  content: HomepageContent
): Promise<HomepageContent> {
  const rooms = await getRooms();
  return {
    ...content,
    pool: { ...content.pool, enabled: false },
    events: { ...content.events, enabled: false },
    experiences: { ...content.experiences, enabled: false },
    awards: { ...content.awards, enabled: false },
    instagram: { ...content.instagram, enabled: false },
    journal: { ...content.journal, enabled: false },
    rooms: {
      ...content.rooms,
      items: rooms,
    },
    featuredSuites: {
      ...content.featuredSuites,
      enabled: false,
      items: rooms.filter((room) => room.category === "suite" && room.featured),
    },
  };
}

/** Explore The Hotel must open /about (never the gallery). */
function normalizeAboutLinks(content: HomepageContent): HomepageContent {
  const link = content.about?.buttonLink?.trim();
  if (!link || link === "/gallery" || link === "/gallery/") {
    return {
      ...content,
      about: {
        ...content.about,
        buttonLink: "/about",
      },
    };
  }
  return content;
}

/** Prefer the real large uploaded Hero MP4 when demo URLs are gone. */
async function ensureOfficialHeroVideo(
  content: HomepageContent
): Promise<HomepageContent> {
  if (content.hero.videoUrl?.trim()) return content;
  const db = getDb();
  if (!db) return content;
  try {
    const heroVideo = await db.mediaAsset.findFirst({
      where: {
        kind: "VIDEO",
        deletedAt: null,
        size: { gte: 80 * 1024 * 1024 },
      },
      orderBy: { size: "desc" },
    });
    if (!heroVideo) return content;
    return {
      ...content,
      hero: {
        ...content.hero,
        mediaType: "VIDEO",
        videoUrl: heroVideo.url,
        videoAssetId: heroVideo.id,
        videoAutoplay: true,
        videoLoop: true,
        videoMuted: true,
        videoPlaysInline: true,
        mobileVideoUrl: "",
        mobileVideoAssetId: null,
      },
    };
  } catch {
    return content;
  }
}

/** Never serve placeholder / demo hero videos on the public site. */
function stripDemoHeroMedia(content: HomepageContent): HomepageContent {
  const videoUrl = content.hero.videoUrl || "";
  const isDemo =
    /hero-demo|sample[-_]?video|placeholder|flowers[-_]?demo|demo\.mp4/i.test(
      videoUrl
    );
  if (!isDemo) return content;
  return {
    ...content,
    hero: {
      ...content.hero,
      videoUrl: "",
      videoAssetId: null,
      mobileVideoUrl: "",
      mobileVideoAssetId: null,
    },
  };
}
