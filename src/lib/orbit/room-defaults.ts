import type { Room } from "@/types/content";

export type RoomCatalogData = {
  roomType: "Room" | "Suite";
  subheading: string;
  shortDescription: string;
  description: string;
  price: number;
  currency: string;
  breakfastPrice: number;
  inventory: number;
  includedAdults: number;
  includedChildren: number;
  extraAdultPrice: number;
  extraChildPrice: number;
  available: boolean;
  featured: boolean;
  sortOrder: number;
  maxGuests: number;
  beds: string;
  floorSize: string;
  floor: string;
  view: string;
  amenities: string;
  facilities: string;
  policies: string;
  cancellationPolicy: string;
  checkIn: string;
  checkOut: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  imageAlt: string;
  mediaAssetId: string | null;
  gallery: { src: string; alt: string; assetId?: string | null }[];
  metaTitle: string;
  metaDescription: string;
};

export type RoomCatalogSeed = {
  key: string;
  title: string;
  slug: string;
  status: "PUBLISHED";
  data: RoomCatalogData;
};

/** Canonical Marlo room categories — source of truth for bootstrap + Orbit seed. */
export const ROOM_CATALOG: RoomCatalogSeed[] = [
  {
    key: "standard-double-room",
    title: "Standard Double Room",
    slug: "standard-double-room",
    status: "PUBLISHED",
    data: {
      roomType: "Room",
      subheading: "Comfortable double accommodation",
      shortDescription:
        "A well-appointed double room with essential comforts for a restful stay.",
      description:
        "Our Standard Double Room offers a comfortable king or queen bed, en-suite bathroom, and thoughtful amenities for leisure and business travellers.",
      price: 22,
      currency: "USD",
      breakfastPrice: 5,
      inventory: 6,
      includedAdults: 2,
      includedChildren: 1,
      extraAdultPrice: 5,
      extraChildPrice: 5,
      available: true,
      featured: false,
      sortOrder: 10,
      maxGuests: 3,
      beds: "Double",
      floorSize: "22 m²",
      floor: "Main",
      view: "Hotel",
      amenities: "Double bed\nEn-suite bathroom\nWi-Fi\nDaily housekeeping",
      facilities: "Air conditioning\nWork desk",
      policies: "Non-smoking\nQuiet hours after 10 PM",
      cancellationPolicy:
        "Flexible rates may be cancelled up to 24 hours before arrival.",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      buttonText: "Book Now",
      buttonLink: "/rooms/standard-double-room",
      imageUrl: "",
      imageAlt: "Standard Double Room",
      mediaAssetId: null,
      gallery: [],
      metaTitle: "Standard Double Room | Marlo Hotels",
      metaDescription:
        "Book the Standard Double Room at Marlo Hotels — 22 USD without breakfast, includes 2 adults and 1 child.",
    },
  },
  {
    key: "standard-twin-room",
    title: "Standard Twin Room",
    slug: "standard-twin-room",
    status: "PUBLISHED",
    data: {
      roomType: "Room",
      subheading: "Twin beds for flexible stays",
      shortDescription:
        "Twin bedding with the same reliable comfort as our double rooms.",
      description:
        "The Standard Twin Room features two single beds, an en-suite bathroom, and all essential amenities for a comfortable stay.",
      price: 22,
      currency: "USD",
      breakfastPrice: 5,
      inventory: 6,
      includedAdults: 2,
      includedChildren: 1,
      extraAdultPrice: 5,
      extraChildPrice: 5,
      available: true,
      featured: false,
      sortOrder: 20,
      maxGuests: 3,
      beds: "Twin",
      floorSize: "22 m²",
      floor: "Main",
      view: "Hotel",
      amenities: "Twin beds\nEn-suite bathroom\nWi-Fi\nDaily housekeeping",
      facilities: "Air conditioning\nWork desk",
      policies: "Non-smoking\nQuiet hours after 10 PM",
      cancellationPolicy:
        "Flexible rates may be cancelled up to 24 hours before arrival.",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      buttonText: "Book Now",
      buttonLink: "/rooms/standard-twin-room",
      imageUrl: "",
      imageAlt: "Standard Twin Room",
      mediaAssetId: null,
      gallery: [],
      metaTitle: "Standard Twin Room | Marlo Hotels",
      metaDescription:
        "Book the Standard Twin Room at Marlo Hotels — 22 USD without breakfast, includes 2 adults and 1 child.",
    },
  },
  {
    key: "standard-triple-room",
    title: "Standard Triple Room",
    slug: "standard-triple-room",
    status: "PUBLISHED",
    data: {
      roomType: "Room",
      subheading: "Space for three guests",
      shortDescription:
        "Extra space and bedding for three adults travelling together.",
      description:
        "The Standard Triple Room accommodates three guests with flexible bedding and a private bathroom.",
      price: 27,
      currency: "USD",
      breakfastPrice: 5,
      inventory: 3,
      includedAdults: 3,
      includedChildren: 1,
      extraAdultPrice: 5,
      extraChildPrice: 5,
      available: true,
      featured: false,
      sortOrder: 30,
      maxGuests: 4,
      beds: "Triple",
      floorSize: "28 m²",
      floor: "Main",
      view: "Hotel",
      amenities: "Triple bedding\nEn-suite bathroom\nWi-Fi\nDaily housekeeping",
      facilities: "Air conditioning",
      policies: "Non-smoking\nQuiet hours after 10 PM",
      cancellationPolicy:
        "Flexible rates may be cancelled up to 24 hours before arrival.",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      buttonText: "Book Now",
      buttonLink: "/rooms/standard-triple-room",
      imageUrl: "",
      imageAlt: "Standard Triple Room",
      mediaAssetId: null,
      gallery: [],
      metaTitle: "Standard Triple Room | Marlo Hotels",
      metaDescription:
        "Book the Standard Triple Room at Marlo Hotels — 27 USD without breakfast, includes 3 adults and 1 child.",
    },
  },
  {
    key: "standard-family-room",
    title: "Standard Family Room",
    slug: "standard-family-room",
    status: "PUBLISHED",
    data: {
      roomType: "Room",
      subheading: "Family-ready comfort",
      shortDescription:
        "A family room designed for parents and children travelling together.",
      description:
        "The Standard Family Room offers space for a family stay with practical amenities and a private bathroom.",
      price: 27,
      currency: "USD",
      breakfastPrice: 5,
      inventory: 3,
      includedAdults: 3,
      includedChildren: 2,
      extraAdultPrice: 5,
      extraChildPrice: 5,
      available: true,
      featured: false,
      sortOrder: 40,
      maxGuests: 5,
      beds: "Family",
      floorSize: "30 m²",
      floor: "Main",
      view: "Hotel",
      amenities: "Family bedding\nEn-suite bathroom\nWi-Fi\nDaily housekeeping",
      facilities: "Air conditioning",
      policies: "Non-smoking\nQuiet hours after 10 PM",
      cancellationPolicy:
        "Flexible rates may be cancelled up to 24 hours before arrival.",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      buttonText: "Book Now",
      buttonLink: "/rooms/standard-family-room",
      imageUrl: "",
      imageAlt: "Standard Family Room",
      mediaAssetId: null,
      gallery: [],
      metaTitle: "Standard Family Room | Marlo Hotels",
      metaDescription:
        "Book the Standard Family Room at Marlo Hotels — 27 USD without breakfast, includes 3 adults and 2 children.",
    },
  },
  {
    key: "premier-room",
    title: "Premier Room",
    slug: "premier-room",
    status: "PUBLISHED",
    data: {
      roomType: "Room",
      subheading: "Elevated comfort",
      shortDescription:
        "A larger premier room with upgraded finishes and more space to unwind.",
      description:
        "The Premier Room offers more space, upgraded amenities, and a refined stay experience.",
      price: 35,
      currency: "USD",
      breakfastPrice: 5,
      inventory: 6,
      includedAdults: 2,
      includedChildren: 2,
      extraAdultPrice: 5,
      extraChildPrice: 5,
      available: true,
      featured: true,
      sortOrder: 50,
      maxGuests: 4,
      beds: "King or Twin",
      floorSize: "32 m²",
      floor: "Upper",
      view: "Hotel",
      amenities: "King or twin beds\nEn-suite bathroom\nWi-Fi\nMinibar",
      facilities: "Air conditioning\nSitting area",
      policies: "Non-smoking\nQuiet hours after 10 PM",
      cancellationPolicy:
        "Flexible rates may be cancelled up to 24 hours before arrival.",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      buttonText: "Book Now",
      buttonLink: "/rooms/premier-room",
      imageUrl: "",
      imageAlt: "Premier Room",
      mediaAssetId: null,
      gallery: [],
      metaTitle: "Premier Room | Marlo Hotels",
      metaDescription:
        "Book the Premier Room at Marlo Hotels — 35 USD without breakfast, includes 2 adults and 2 children.",
    },
  },
  {
    key: "premier-family-room",
    title: "Premier Family Room",
    slug: "premier-family-room",
    status: "PUBLISHED",
    data: {
      roomType: "Room",
      subheading: "Premier space for families",
      shortDescription: "Premier-level comfort sized for family stays.",
      description:
        "The Premier Family Room combines upgraded amenities with space for the whole family.",
      price: 35,
      currency: "USD",
      breakfastPrice: 5,
      inventory: 6,
      includedAdults: 2,
      includedChildren: 2,
      extraAdultPrice: 5,
      extraChildPrice: 5,
      available: true,
      featured: true,
      sortOrder: 60,
      maxGuests: 4,
      beds: "Family",
      floorSize: "36 m²",
      floor: "Upper",
      view: "Hotel",
      amenities: "Family bedding\nEn-suite bathroom\nWi-Fi\nMinibar",
      facilities: "Air conditioning\nSitting area",
      policies: "Non-smoking\nQuiet hours after 10 PM",
      cancellationPolicy:
        "Flexible rates may be cancelled up to 24 hours before arrival.",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      buttonText: "Book Now",
      buttonLink: "/rooms/premier-family-room",
      imageUrl: "",
      imageAlt: "Premier Family Room",
      mediaAssetId: null,
      gallery: [],
      metaTitle: "Premier Family Room | Marlo Hotels",
      metaDescription:
        "Book the Premier Family Room at Marlo Hotels — 35 USD without breakfast, includes 2 adults and 2 children.",
    },
  },
  {
    key: "suite-apartment",
    title: "Suite Apartment",
    slug: "suite-apartment",
    status: "PUBLISHED",
    data: {
      roomType: "Suite",
      subheading: "Residential suite living",
      shortDescription:
        "A suite apartment with living space and elevated comfort for longer stays.",
      description:
        "The Suite Apartment offers separate living space, premium amenities, and the comfort of a private residence.",
      price: 55,
      currency: "USD",
      breakfastPrice: 5,
      inventory: 6,
      includedAdults: 3,
      includedChildren: 2,
      extraAdultPrice: 5,
      extraChildPrice: 5,
      available: true,
      featured: true,
      sortOrder: 70,
      maxGuests: 5,
      beds: "King",
      floorSize: "55 m²",
      floor: "Upper",
      view: "Hotel",
      amenities:
        "King bed\nLiving area\nEn-suite bathroom\nWi-Fi\nKitchenette",
      facilities: "Air conditioning\nSeparate living room",
      policies: "Non-smoking\nQuiet hours after 10 PM",
      cancellationPolicy:
        "Flexible rates may be cancelled up to 24 hours before arrival.",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      buttonText: "Book Now",
      buttonLink: "/rooms/suite-apartment",
      imageUrl: "",
      imageAlt: "Suite Apartment",
      mediaAssetId: null,
      gallery: [],
      metaTitle: "Suite Apartment | Marlo Hotels",
      metaDescription:
        "Book the Suite Apartment at Marlo Hotels — 55 USD without breakfast, includes 3 adults and 2 children.",
    },
  },
];

export function catalogToRoom(seed: RoomCatalogSeed): Room {
  const { data } = seed;
  const gallery = (data.gallery || [])
    .map((item) => ({
      src: String(item.src || "").trim(),
      alt: String(item.alt || seed.title),
    }))
    .filter((item) => item.src);
  const cover = data.imageUrl?.trim()
    ? [{ src: data.imageUrl.trim(), alt: data.imageAlt || seed.title }]
    : [];
  return {
    slug: seed.slug,
    name: seed.title,
    category: data.roomType === "Suite" ? "suite" : "room",
    tagline: data.subheading,
    shortDescription: data.shortDescription,
    description: data.description ? [data.description] : [seed.title],
    priceFrom: data.price,
    currency: data.currency || "USD",
    breakfastPrice: data.breakfastPrice,
    inventory: Math.max(0, data.inventory),
    includedAdults: data.includedAdults,
    includedChildren: data.includedChildren,
    extraAdultPrice: data.extraAdultPrice,
    extraChildPrice: data.extraChildPrice,
    published: data.available !== false,
    sortOrder: data.sortOrder,
    size: data.floorSize,
    floor: data.floor,
    occupancy: `${data.includedAdults} adults${data.includedChildren ? `, ${data.includedChildren} children` : ""}`,
    bed: data.beds,
    view: data.view,
    featured: Boolean(data.featured),
    images: [...cover, ...gallery],
    amenities: data.amenities
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    features: data.facilities
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    policies: data.policies
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    cancellationPolicy: data.cancellationPolicy,
    checkInTime: data.checkIn,
    checkOutTime: data.checkOut,
    buttonText: data.buttonText,
    buttonLink: data.buttonLink,
  };
}
