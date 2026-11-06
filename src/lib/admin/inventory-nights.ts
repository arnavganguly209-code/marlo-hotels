import "server-only";

import { getDb } from "@/lib/db";
import { getRoomBySlug, getRooms } from "@/content/rooms";
import {
  ALL_ROOMS_BLOCK_SLUG,
  isHotelWideDateBlock,
} from "@/lib/admin/pms-public";
import type {
  InventoryManageCategory,
  InventoryManageDay,
  InventoryManageGrid,
} from "@/lib/admin/inventory-nights-public";
import {
  INVENTORY_VIEW_MAX_DAYS,
  inventoryDateKey as dateKey,
  inventoryUtcDate as toUtcDate,
} from "@/lib/admin/inventory-nights-public";

const ACTIVE_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export { dateKey, toUtcDate };

export function enumerateNights(
  checkIn: string | Date,
  checkOut: string | Date
) {
  const start = toUtcDate(checkIn).getTime();
  const end = toUtcDate(checkOut).getTime();
  const keys: string[] = [];
  for (let time = start; time < end; time += 86_400_000) {
    keys.push(new Date(time).toISOString().slice(0, 10));
  }
  return keys;
}

export function enumerateCalendarDays(from: string | Date, count: number) {
  const start = toUtcDate(from).getTime();
  const days = Math.min(
    INVENTORY_VIEW_MAX_DAYS,
    Math.max(1, Math.floor(count) || 1)
  );
  const keys: string[] = [];
  for (let i = 0; i < days; i += 1) {
    keys.push(new Date(start + i * 86_400_000).toISOString().slice(0, 10));
  }
  return keys;
}

export function defaultAdultRates(room: {
  priceFrom: number;
  extraAdultPrice: number;
}) {
  const base = Math.max(0, Number(room.priceFrom) || 0);
  const extra = Math.max(0, Number(room.extraAdultPrice) || 0);
  return {
    rate1Adult: base,
    rate2Adult: base,
    rate3Adult: Number((base + extra).toFixed(2)),
  };
}

export function adultOccupancyRate(
  adults: number,
  rates: { rate1Adult: number; rate2Adult: number; rate3Adult: number },
  extraAdult: number
) {
  const count = Math.max(1, adults);
  if (count <= 1) return rates.rate1Adult;
  if (count === 2) return rates.rate2Adult;
  return Number(
    (rates.rate3Adult + Math.max(0, count - 3) * extraAdult).toFixed(2)
  );
}

export async function getNightlyAllotments(
  slug: string,
  nights: string[]
): Promise<Map<string, { inventory: number; rate1Adult: number | null; rate2Adult: number | null; rate3Adult: number | null }>> {
  const map = new Map<
    string,
    {
      inventory: number;
      rate1Adult: number | null;
      rate2Adult: number | null;
      rate3Adult: number | null;
    }
  >();
  const db = getDb();
  if (!db || !nights.length) return map;
  try {
    const rows = await db.roomInventoryNight.findMany({
      where: {
        roomCategorySlug: slug,
        date: {
          gte: toUtcDate(nights[0]),
          lte: toUtcDate(nights[nights.length - 1]),
        },
      },
    });
    for (const row of rows) {
      map.set(dateKey(row.date), {
        inventory: row.inventory,
        rate1Adult: row.rate1Adult === null ? null : Number(row.rate1Adult),
        rate2Adult: row.rate2Adult === null ? null : Number(row.rate2Adult),
        rate3Adult: row.rate3Adult === null ? null : Number(row.rate3Adult),
      });
    }
  } catch {
    return map;
  }
  return map;
}

export async function getBookedByNight(
  slug: string,
  nights: string[],
  excludeBookingId?: string
) {
  const booked = new Map<string, number>();
  for (const night of nights) booked.set(night, 0);
  const db = getDb();
  if (!db || nights.length < 1) return booked;
  const start = toUtcDate(nights[0]);
  const endExclusive = new Date(
    toUtcDate(nights[nights.length - 1]).getTime() + 86_400_000
  );
  try {
    const roomRecord = await db.room.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!roomRecord) return booked;
    const overlapping = await db.booking.findMany({
      where: {
        roomId: roomRecord.id,
        status: { in: [...ACTIVE_BOOKING_STATUSES] },
        checkIn: { lt: endExclusive },
        checkOut: { gt: start },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
      select: { checkIn: true, checkOut: true, rooms: true },
    });
    for (const booking of overlapping) {
      const units = Math.max(1, booking.rooms);
      for (const night of enumerateNights(booking.checkIn, booking.checkOut)) {
        if (booked.has(night)) {
          booked.set(night, (booked.get(night) || 0) + units);
        }
      }
    }
  } catch {
    return booked;
  }
  return booked;
}

export async function closedNightsForCategory(
  slug: string,
  nights: string[]
) {
  const closed = new Set<string>();
  const db = getDb();
  if (!db || !nights.length) return closed;
  const start = toUtcDate(nights[0]);
  const endInclusive = toUtcDate(nights[nights.length - 1]);
  try {
    const blocks = await db.dateBlock.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { roomCategorySlug: slug },
          { roomCategorySlug: ALL_ROOMS_BLOCK_SLUG },
        ],
        startDate: { lte: endInclusive },
        endDate: { gte: start },
      },
      select: {
        startDate: true,
        endDate: true,
        physicalRoomNumber: true,
        roomCategorySlug: true,
      },
    });
    for (const block of blocks) {
      if (
        block.physicalRoomNumber &&
        !isHotelWideDateBlock(block.roomCategorySlug)
      ) {
        continue;
      }
      const from = dateKey(block.startDate);
      const to = dateKey(block.endDate);
      for (const night of nights) {
        if (night >= from && night <= to) closed.add(night);
      }
    }
  } catch {
    return closed;
  }
  return closed;
}

export async function getInventoryManageGrid(
  from: string,
  dayCount: number
): Promise<InventoryManageGrid> {
  const dates = enumerateCalendarDays(from, dayCount);
  const rooms = (await getRooms()).filter((room) => room.published !== false);
  const categories: InventoryManageCategory[] = [];

  for (const room of rooms.sort(
    (a, b) => (a.sortOrder || 100) - (b.sortOrder || 100)
  )) {
    const defaults = defaultAdultRates(room);
    const [allotments, booked, closed] = await Promise.all([
      getNightlyAllotments(room.slug, dates),
      getBookedByNight(room.slug, dates),
      closedNightsForCategory(room.slug, dates),
    ]);
    const days: InventoryManageDay[] = dates.map((date) => {
      const override = allotments.get(date);
      const blocked = closed.has(date);
      const inventory = blocked
        ? 0
        : override
          ? Math.max(0, override.inventory)
          : Math.max(0, room.inventory);
      const bookedCount = booked.get(date) || 0;
      const available = Math.max(0, inventory - bookedCount);
      const weekday = WEEKDAYS[toUtcDate(date).getUTCDay()];
      return {
        date,
        weekday,
        day: Number(date.slice(8, 10)),
        inventory,
        booked: bookedCount,
        available,
        blocked,
        rate1Adult: override?.rate1Adult ?? defaults.rate1Adult,
        rate2Adult: override?.rate2Adult ?? defaults.rate2Adult,
        rate3Adult: override?.rate3Adult ?? defaults.rate3Adult,
        inventoryOverridden: Boolean(override) || blocked,
        rateOverridden: Boolean(
          override &&
            (override.rate1Adult !== null ||
              override.rate2Adult !== null ||
              override.rate3Adult !== null)
        ),
      };
    });
    categories.push({
      slug: room.slug,
      name: room.name,
      roomType: room.category === "suite" ? "Suite" : "Room",
      baseInventory: Math.max(0, room.inventory),
      days,
    });
  }

  return {
    from: dates[0] || dateKey(from),
    days: dates.length,
    dates: dates.map((date) => ({
      date,
      weekday: WEEKDAYS[toUtcDate(date).getUTCDay()],
      day: Number(date.slice(8, 10)),
    })),
    categories,
  };
}

/** Remove nightly row so inventory and rates fall back to room catalogue defaults. */
export async function deleteInventoryNight(slug: string, date: string) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");
  const room = await getRoomBySlug(slug);
  if (!room || room.published === false) {
    throw new Error("Unknown Marlo room category.");
  }
  const d = toUtcDate(date);
  await db.roomInventoryNight.deleteMany({
    where: { roomCategorySlug: slug, date: d },
  });
}

export async function upsertInventoryNight(input: {
  slug: string;
  date: string;
  inventory?: number;
  rate1Adult?: number | null;
  rate2Adult?: number | null;
  rate3Adult?: number | null;
}) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");
  const room = await getRoomBySlug(input.slug);
  if (!room || room.published === false) {
    throw new Error("Unknown Marlo room category.");
  }
  const date = toUtcDate(input.date);
  const existing = await db.roomInventoryNight.findUnique({
    where: {
      roomCategorySlug_date: {
        roomCategorySlug: input.slug,
        date,
      },
    },
  });
  const inventory =
    typeof input.inventory === "number"
      ? Math.max(0, Math.floor(input.inventory))
      : existing?.inventory ?? Math.max(0, room.inventory);
  const data = {
    inventory,
    rate1Adult:
      input.rate1Adult === undefined
        ? existing?.rate1Adult ?? null
        : input.rate1Adult,
    rate2Adult:
      input.rate2Adult === undefined
        ? existing?.rate2Adult ?? null
        : input.rate2Adult,
    rate3Adult:
      input.rate3Adult === undefined
        ? existing?.rate3Adult ?? null
        : input.rate3Adult,
  };
  return db.roomInventoryNight.upsert({
    where: {
      roomCategorySlug_date: { roomCategorySlug: input.slug, date },
    },
    create: {
      roomCategorySlug: input.slug,
      date,
      ...data,
    },
    update: data,
  });
}

export async function applyInventoryRange(input: {
  slug: string;
  startDate: string;
  endDate: string;
  inventory: number;
}) {
  const startMs = toUtcDate(input.startDate).getTime();
  const endMs = toUtcDate(input.endDate).getTime();
  if (endMs < startMs) {
    throw new Error("End date must be on or after start date.");
  }
  const nightCount =
    Math.round((endMs - startMs) / 86_400_000) + 1;
  const nights = enumerateCalendarDays(input.startDate, nightCount);
  for (const date of nights) {
    await upsertInventoryNight({
      slug: input.slug,
      date,
      inventory: input.inventory,
    });
  }
  return nights.length;
}

/** Delete nightly overrides in range so each night uses catalogue defaults. */
export async function clearInventoryRange(input: {
  slug: string;
  startDate: string;
  endDate: string;
}) {
  const startMs = toUtcDate(input.startDate).getTime();
  const endMs = toUtcDate(input.endDate).getTime();
  if (endMs < startMs) {
    throw new Error("End date must be on or after start date.");
  }
  const nightCount =
    Math.round((endMs - startMs) / 86_400_000) + 1;
  const nights = enumerateCalendarDays(input.startDate, nightCount);
  for (const date of nights) {
    await deleteInventoryNight(input.slug, date);
  }
  return nights.length;
}

export async function getStayNightRates(
  slug: string,
  checkIn: string | Date,
  checkOut: string | Date
) {
  const room = await getRoomBySlug(slug);
  if (!room) return null;
  const nights = enumerateNights(checkIn, checkOut);
  const defaults = defaultAdultRates(room);
  const allotments = await getNightlyAllotments(slug, nights);
  return nights.map((night) => {
    const override = allotments.get(night);
    return {
      date: night,
      rate1Adult: override?.rate1Adult ?? defaults.rate1Adult,
      rate2Adult: override?.rate2Adult ?? defaults.rate2Adult,
      rate3Adult: override?.rate3Adult ?? defaults.rate3Adult,
    };
  });
}

export { resolveInventoryViewRange } from "@/lib/admin/inventory-nights-public";

