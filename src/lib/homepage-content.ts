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
  dining: CollectionSection<Restaurant>;
  wellness: WellnessEditorContent;
  pool: PoolEditorContent;
  events: CollectionSection<EventEditorItem>;
  gallery: CollectionSection<GalleryImage>;
  experiences: CollectionSection<Experience>;
  attractions: CollectionSection<Attraction>;
  testimonials: CollectionSection<Testimonial> & { autoplayMs: number };
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
      enabled: true,
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
        "Three venues, one philosophy — the Himalayan larder treated with the world's finest technique, from tasting menus to midnight cocktails.",
      buttonText: "Discover All Venues",
      buttonLink: "/dining",
      items: restaurants,
    },
    wellness: {
      enabled: true,
      eyebrow: "Spa & Wellness",
      heading: "Stillness, drawn from the mountains",
      highlightedText: "mountains",
      description:
        "Five treatment suites, a couples' pavilion and a thermal circuit fed by mountain spring water. Our therapies weave singing bowls, warmed river stone and valley-pressed oils into rituals you will carry home.",
      buttonText: "Enter Marlo Spa",
      buttonLink: "/spa",
      images: [
        image(
          "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop",
          "A Marlo Spa ritual with flowers and warm stone"
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
    pool: {
      enabled: true,
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
      enabled: true,
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
        "Light on water, brass at dusk, the valley from a suite window — a preview of life at Marlo Hotels.",
      buttonText: "View Full Gallery",
      buttonLink: "/gallery",
      items: galleryImages.slice(0, 6),
    },
    experiences: {
      enabled: true,
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
    awards: {
      enabled: true,
      eyebrow: "Awards",
      heading: "Recognition",
      description: "Independent recognition for Marlo hospitality.",
      items: awards,
    },
    instagram: {
      enabled: true,
      handle: "@marlohotels",
      link: siteConfig.social.instagram,
      images: instagramFeed.map((item) => image(item.src, item.alt)),
    },
    journal: {
      enabled: true,
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
    rooms: {
      ...content.rooms,
      items: rooms,
    },
    featuredSuites: {
      ...content.featuredSuites,
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
