import type { Room } from "@/types/content";
import { getDb } from "@/lib/db";
import {
  ROOM_CATALOG,
  catalogToRoom,
  type RoomCatalogData,
} from "@/lib/orbit/room-defaults";
import { formatOccupancyLabel } from "@/lib/booking-pricing";

const rooms: Room[] = ROOM_CATALOG.map(catalogToRoom);

function mapEntryToRoom(entry: {
  title: string;
  slug: string | null;
  key: string;
  status: string;
  data: unknown;
}): Room {
  const data = (entry.data || {}) as Partial<RoomCatalogData> &
    Record<string, unknown>;
  const text = (key: string, fallback = "") => {
    const value = data[key];
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  };
  const number = (key: string, fallback = 0) => {
    const value = data[key];
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  };
  const lines = (key: string) =>
    text(key)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const seed = ROOM_CATALOG.find(
    (item) => item.slug === (entry.slug || entry.key) || item.key === entry.key
  );
  const defaults = seed?.data;

  const includedAdults = number(
    "includedAdults",
    defaults?.includedAdults ?? 2
  );
  const includedChildren = number(
    "includedChildren",
    defaults?.includedChildren ?? 0
  );

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
  const shortDescription =
    text("shortDescription") ||
    text("description")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220) ||
    entry.title;
  const descriptionRaw = text("description")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    slug: entry.slug ?? entry.key,
    name: entry.title,
    category:
      text("roomType", defaults?.roomType || "Room").toLowerCase() === "suite"
        ? "suite"
        : "room",
    tagline: text("subheading", defaults?.subheading || entry.title),
    shortDescription,
    description: descriptionRaw
      ? [descriptionRaw]
      : [defaults?.description || entry.title],
    priceFrom: number("price", defaults?.price ?? 0),
    currency: text("currency", defaults?.currency || "USD") || "USD",
    breakfastPrice: number("breakfastPrice", defaults?.breakfastPrice ?? 5),
    inventory: Math.max(0, number("inventory", defaults?.inventory ?? 0)),
    includedAdults,
    includedChildren,
    extraAdultPrice: number(
      "extraAdultPrice",
      defaults?.extraAdultPrice ?? 5
    ),
    extraChildPrice: number(
      "extraChildPrice",
      defaults?.extraChildPrice ?? 5
    ),
    published: entry.status === "PUBLISHED" && data.available !== false,
    sortOrder: number("sortOrder", defaults?.sortOrder ?? 100),
    size: text("floorSize", defaults?.floorSize || "—"),
    floor: text("floor", defaults?.floor || ""),
    occupancy: formatOccupancyLabel(includedAdults, includedChildren),
    bed: text("beds", defaults?.beds || "—"),
    view: text("view", defaults?.view || "Hotel"),
    featured: data.featured === true,
    images: imageUrl
      ? [{ src: imageUrl, alt: text("imageAlt", entry.title) }, ...gallery]
      : gallery,
    amenities: lines("amenities").length
      ? lines("amenities")
      : (defaults?.amenities || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
    features: lines("facilities").length
      ? lines("facilities")
      : lines("policies").length
        ? lines("policies")
        : (defaults?.facilities || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
    policies: lines("policies"),
    cancellationPolicy: text(
      "cancellationPolicy",
      defaults?.cancellationPolicy || ""
    ),
    checkInTime: text("checkIn", defaults?.checkIn || "2:00 PM"),
    checkOutTime: text("checkOut", defaults?.checkOut || "12:00 PM"),
    buttonText: text("buttonText", defaults?.buttonText || "Book Now"),
    buttonLink: text(
      "buttonLink",
      defaults?.buttonLink || `/rooms/${entry.slug ?? entry.key}`
    ),
  };
}

export async function getRooms(): Promise<Room[]> {
  const db = getDb();
  if (db) {
    try {
      const entries = await db.contentEntry.findMany({
        where: { module: "rooms" },
        orderBy: { updatedAt: "desc" },
      });
      const inventory = entries.filter(
        (entry) => entry.key !== "page-studio" && entry.slug
      );
      if (inventory.length) {
        const mapped = inventory
          .map(mapEntryToRoom)
          .filter((room) => room.published !== false)
          .sort(
            (a, b) =>
              (a.sortOrder ?? 100) - (b.sortOrder ?? 100) ||
              a.name.localeCompare(b.name)
          );
        if (mapped.length) return mapped;
      }
    } catch {
      // Static content remains the safe bootstrap until the first CMS publish.
    }
  }
  return rooms;
}

/** All catalog rooms for Orbit (includes drafts). */
export async function getOrbitRoomEntries() {
  const db = getDb();
  if (!db) {
    return ROOM_CATALOG.map((seed) => ({
      id: seed.key,
      module: "rooms",
      key: seed.key,
      title: seed.title,
      slug: seed.slug,
      status: seed.status as "PUBLISHED",
      data: seed.data as Record<string, unknown>,
      seo: null,
      scheduledAt: null as string | null,
      updatedAt: new Date().toISOString(),
    }));
  }

  const entries = await db.contentEntry.findMany({
    where: { module: "rooms" },
    orderBy: { updatedAt: "asc" },
  });
  const inventory = entries.filter((entry) => entry.key !== "page-studio");

  // Seed any missing catalog rooms so Orbit always shows all 7.
  const existingKeys = new Set(inventory.map((entry) => entry.key));
  const existingSlugs = new Set(
    inventory.map((entry) => entry.slug).filter(Boolean)
  );
  for (const seed of ROOM_CATALOG) {
    if (existingKeys.has(seed.key) || existingSlugs.has(seed.slug)) continue;
    await db.contentEntry.upsert({
      where: { module_key: { module: "rooms", key: seed.key } },
      create: {
        module: "rooms",
        key: seed.key,
        title: seed.title,
        slug: seed.slug,
        status: "PUBLISHED",
        data: seed.data,
        publishedAt: new Date(),
      },
      update: {},
    });
  }

  const refreshed = await db.contentEntry.findMany({
    where: { module: "rooms" },
    orderBy: { updatedAt: "asc" },
  });

  return refreshed
    .filter((entry) => entry.key !== "page-studio" && entry.slug)
    .map((entry) => ({
      id: entry.id,
      module: entry.module,
      key: entry.key,
      title: entry.title,
      slug: entry.slug,
      status: entry.status,
      data: entry.data as Record<string, unknown>,
      seo: entry.seo as Record<string, unknown> | null,
      scheduledAt: entry.scheduledAt?.toISOString() ?? null,
      updatedAt: entry.updatedAt.toISOString(),
    }))
    .sort((a, b) => {
      const orderA = Number((a.data as { sortOrder?: number }).sortOrder ?? 100);
      const orderB = Number((b.data as { sortOrder?: number }).sortOrder ?? 100);
      return orderA - orderB || a.title.localeCompare(b.title);
    });
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
    body: "Children are welcome. Extra beds and cots can be arranged on request and may incur an additional charge beyond included occupancy.",
  },
];
