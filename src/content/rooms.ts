import type { Room } from "@/types/content";
import { getDb } from "@/lib/db";

const rooms: Room[] = [
  {
    slug: "standard-double-room",
    name: "Standard Double Room",
    category: "room",
    tagline: "Comfortable double accommodation",
    shortDescription:
      "A well-appointed double room with essential comforts for a restful stay.",
    description: [
      "Our Standard Double Room offers a comfortable king or queen bed, en-suite bathroom, and thoughtful amenities for leisure and business travellers.",
    ],
    priceFrom: 22,
    currency: "USD",
    breakfastPrice: 5,
    inventory: 6,
    size: "22 m²",
    occupancy: "2 adults",
    bed: "Double",
    view: "Hotel",
    featured: false,
    images: [],
    amenities: ["Double bed", "En-suite bathroom", "Wi-Fi", "Daily housekeeping"],
    features: ["Air conditioning", "Work desk"],
  },
  {
    slug: "standard-twin-room",
    name: "Standard Twin Room",
    category: "room",
    tagline: "Twin beds for flexible stays",
    shortDescription:
      "Twin bedding with the same reliable comfort as our double rooms.",
    description: [
      "The Standard Twin Room features two single beds, an en-suite bathroom, and all essential amenities for a comfortable stay.",
    ],
    priceFrom: 22,
    currency: "USD",
    breakfastPrice: 5,
    inventory: 6,
    size: "22 m²",
    occupancy: "2 adults",
    bed: "Twin",
    view: "Hotel",
    featured: false,
    images: [],
    amenities: ["Twin beds", "En-suite bathroom", "Wi-Fi", "Daily housekeeping"],
    features: ["Air conditioning", "Work desk"],
  },
  {
    slug: "standard-triple-room",
    name: "Standard Triple Room",
    category: "room",
    tagline: "Space for three guests",
    shortDescription:
      "Extra space and bedding for three adults travelling together.",
    description: [
      "The Standard Triple Room accommodates three guests with flexible bedding and a private bathroom.",
    ],
    priceFrom: 27,
    currency: "USD",
    breakfastPrice: 5,
    inventory: 3,
    size: "28 m²",
    occupancy: "3 adults",
    bed: "Triple",
    view: "Hotel",
    featured: false,
    images: [],
    amenities: ["Triple bedding", "En-suite bathroom", "Wi-Fi", "Daily housekeeping"],
    features: ["Air conditioning"],
  },
  {
    slug: "standard-family-room",
    name: "Standard Family Room",
    category: "room",
    tagline: "Family-ready comfort",
    shortDescription:
      "A family room designed for parents and children travelling together.",
    description: [
      "The Standard Family Room offers space for a family stay with practical amenities and a private bathroom.",
    ],
    priceFrom: 27,
    currency: "USD",
    breakfastPrice: 5,
    inventory: 3,
    size: "30 m²",
    occupancy: "2 adults, 2 children",
    bed: "Family",
    view: "Hotel",
    featured: false,
    images: [],
    amenities: ["Family bedding", "En-suite bathroom", "Wi-Fi", "Daily housekeeping"],
    features: ["Air conditioning"],
  },
  {
    slug: "premier-room",
    name: "Premier Room",
    category: "room",
    tagline: "Elevated comfort",
    shortDescription:
      "A larger premier room with upgraded finishes and more space to unwind.",
    description: [
      "The Premier Room offers more space, upgraded amenities, and a refined stay experience.",
    ],
    priceFrom: 35,
    currency: "USD",
    breakfastPrice: 5,
    inventory: 6,
    size: "32 m²",
    occupancy: "2 adults",
    bed: "King or Twin",
    view: "Hotel",
    featured: true,
    images: [],
    amenities: ["King or twin beds", "En-suite bathroom", "Wi-Fi", "Minibar"],
    features: ["Air conditioning", "Sitting area"],
  },
  {
    slug: "premier-family-room",
    name: "Premier Family Room",
    category: "room",
    tagline: "Premier space for families",
    shortDescription:
      "Premier-level comfort sized for family stays.",
    description: [
      "The Premier Family Room combines upgraded amenities with space for the whole family.",
    ],
    priceFrom: 35,
    currency: "USD",
    breakfastPrice: 5,
    inventory: 6,
    size: "36 m²",
    occupancy: "2 adults, 2 children",
    bed: "Family",
    view: "Hotel",
    featured: true,
    images: [],
    amenities: ["Family bedding", "En-suite bathroom", "Wi-Fi", "Minibar"],
    features: ["Air conditioning", "Sitting area"],
  },
  {
    slug: "suite-apartment",
    name: "Suite Apartment",
    category: "suite",
    tagline: "Residential suite living",
    shortDescription:
      "A suite apartment with living space and elevated comfort for longer stays.",
    description: [
      "The Suite Apartment offers separate living space, premium amenities, and the comfort of a private residence.",
    ],
    priceFrom: 55,
    currency: "USD",
    breakfastPrice: 5,
    inventory: 6,
    size: "55 m²",
    occupancy: "3 adults, or 2 adults & 2 children",
    bed: "King",
    view: "Hotel",
    featured: true,
    images: [],
    amenities: ["King bed", "Living area", "En-suite bathroom", "Wi-Fi", "Kitchenette"],
    features: ["Air conditioning", "Separate living room"],
  },
];

export async function getRooms(): Promise<Room[]> {
  const db = getDb();
  if (db) {
    try {
      const entries = await db.contentEntry.findMany({
        where: { module: "rooms", status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
      });
      const inventory = entries.filter(
        (entry) => entry.key !== "page-studio" && entry.slug
      );
      if (inventory.length) {
        return inventory
          .map((entry) => {
            const data = (entry.data || {}) as Record<string, unknown>;
            const text = (key: string, fallback = "") => {
              const value = data[key];
              return typeof value === "string" && value.trim()
                ? value.trim()
                : fallback;
            };
            const number = (key: string, fallback = 0) => {
              const value = data[key];
              return typeof value === "number" && Number.isFinite(value)
                ? value
                : fallback;
            };
            const lines = (key: string) =>
              text(key)
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean);
            const description = text("description")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();
            const galleryFromArray = Array.isArray(data.gallery)
              ? (data.gallery as { src?: string; alt?: string; url?: string }[])
                  .map((item) => ({
                    src: String(item.src || item.url || "").trim(),
                    alt: String(item.alt || entry.title),
                  }))
                  .filter((item) => item.src)
              : [];
            const galleryFromUrls = lines("galleryUrls").map((src) => ({
              src,
              alt: entry.title,
            }));
            const gallery = [...galleryFromArray, ...galleryFromUrls];
            const imageUrl = text("imageUrl") || gallery[0]?.src || "";
            const published =
              entry.status === "PUBLISHED" && data.available !== false;
            return {
              slug: entry.slug ?? entry.key,
              name: entry.title,
              category:
                text("roomType", "Room").toLowerCase() === "suite"
                  ? ("suite" as const)
                  : ("room" as const),
              tagline: text("subheading", entry.title),
              shortDescription: description.slice(0, 220) || entry.title,
              description: description ? [description] : [entry.title],
              priceFrom: number("price", 0),
              currency: text("currency", "USD") || "USD",
              breakfastPrice: number("breakfastPrice", 5),
              inventory: Math.max(0, number("inventory", 0)),
              published,
              sortOrder: number("sortOrder", 100),
              size: text("floorSize", "—"),
              occupancy: `${number("maxGuests", 2)} guests`,
              bed: text("beds", "—"),
              view: text("view", "Hotel"),
              featured: data.featured === true,
              images: imageUrl
                ? [
                    { src: imageUrl, alt: text("imageAlt", entry.title) },
                    ...gallery,
                  ]
                : gallery,
              amenities: lines("amenities"),
              features: lines("policies"),
            };
          })
          .filter((room) => room.published)
          .sort(
            (a, b) =>
              (a.sortOrder ?? 100) - (b.sortOrder ?? 100) ||
              a.name.localeCompare(b.name)
          );
      }
    } catch {
      // Static content remains the safe bootstrap until the first CMS publish.
    }
  }
  return rooms;
}

export async function getRoomBySlug(slug: string): Promise<Room | undefined> {
  return (await getRooms()).find((room) => room.slug === slug);
}

export async function getFeaturedRooms(): Promise<Room[]> {
  return (await getRooms()).filter((room) => room.featured);
}

export async function getRelatedRooms(slug: string, limit = 3): Promise<Room[]> {
  return (await getRooms()).filter((room) => room.slug !== slug).slice(0, limit);
}

export const roomPolicies = [
  {
    title: "Check-in & Check-out",
    body: "Check-in from 2:00 PM. Check-out by 12:00 PM. Early check-in and late check-out are subject to availability.",
  },
  {
    title: "Cancellation",
    body: "Flexible rates may be cancelled up to 24 hours before arrival. Non-refundable rates follow the conditions shown at booking.",
  },
  {
    title: "Children & Extra Beds",
    body: "Children are welcome. Extra beds and cots can be arranged on request and may incur an additional charge.",
  },
];
