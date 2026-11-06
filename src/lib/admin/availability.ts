import "server-only";

import { getDb } from "@/lib/db";
import { getRoomBySlug } from "@/content/rooms";
import {
  isSellableStatus,
  listPhysicalRooms,
  syncCategoryInventory,
  type PhysicalRoomStatusValue,
} from "@/lib/admin/physical-rooms";
import {
  ALL_ROOMS_BLOCK_SLUG,
  isHotelWideDateBlock,
} from "@/lib/admin/pms-public";
import {
  closedNightsForCategory,
  enumerateNights,
  getBookedByNight,
  getNightlyAllotments,
} from "@/lib/admin/inventory-nights";

const ACTIVE_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
] as const;

function toDateOnly(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) {
  return startA < endB && endA > startB;
}

/** Admin end date is inclusive (last closed night / last closed check-in day). */
function inclusiveBlockEnd(end: Date) {
  const date = toDateOnly(end);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  );
}

function blockOverlapsStay(
  stayStart: Date,
  stayEnd: Date,
  blockStart: Date,
  blockEnd: Date
) {
  return rangesOverlap(
    stayStart,
    stayEnd,
    toDateOnly(blockStart),
    inclusiveBlockEnd(blockEnd)
  );
}

export async function getActiveDateBlocks(slug?: string) {
  const db = getDb();
  if (!db) return [];
  try {
    return await db.dateBlock.findMany({
      where: {
        status: "ACTIVE",
        ...(slug
          ? {
              OR: [
                { roomCategorySlug: slug },
                { roomCategorySlug: ALL_ROOMS_BLOCK_SLUG },
              ],
            }
          : {}),
      },
      orderBy: [{ startDate: "asc" }, { endDate: "asc" }],
    });
  } catch {
    return [];
  }
}

/** How many inventory units are blocked for this category in the stay window. */
export async function countBlockedUnits(
  slug: string,
  checkIn: string | Date,
  checkOut: string | Date
) {
  const start = toDateOnly(checkIn);
  const end = toDateOnly(checkOut);
  const blocks = await getActiveDateBlocks(slug);
  const overlapping = blocks.filter((block) =>
    blockOverlapsStay(start, end, block.startDate, block.endDate)
  );

  if (
    overlapping.some(
      (block) =>
        !block.physicalRoomNumber || isHotelWideDateBlock(block.roomCategorySlug)
    )
  ) {
    // Whole category or entire hotel blocked for these dates.
    const room = await getRoomBySlug(slug);
    return Math.max(room?.inventory ?? 0, 999);
  }

  const numbers = new Set(
    overlapping
      .map((block) => block.physicalRoomNumber?.trim().toUpperCase())
      .filter(Boolean) as string[]
  );
  return numbers.size;
}

export async function countBookedUnits(
  slug: string,
  checkIn: string | Date,
  checkOut: string | Date,
  excludeBookingId?: string
) {
  const db = getDb();
  if (!db) return 0;
  const start = toDateOnly(checkIn);
  const end = toDateOnly(checkOut);

  const roomRecord = await db.room.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!roomRecord) return 0;

  const overlapping = await db.booking.findMany({
    where: {
      roomId: roomRecord.id,
      status: { in: [...ACTIVE_BOOKING_STATUSES] },
      checkIn: { lt: end },
      checkOut: { gt: start },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { rooms: true },
  });

  return overlapping.reduce((sum, item) => sum + Math.max(1, item.rooms), 0);
}

export async function getAvailableCapacity(
  slug: string,
  checkIn: string | Date,
  checkOut: string | Date,
  excludeBookingId?: string
) {
  const room = await getRoomBySlug(slug);
  if (!room || room.published === false) {
    return { capacity: 0, booked: 0, blocked: 0, available: 0 };
  }

  const nights = enumerateNights(checkIn, checkOut);
  if (!nights.length) {
    return { capacity: 0, booked: 0, blocked: 0, available: 0 };
  }

  const physical = await listPhysicalRooms(slug);
  const catalogueCap = Math.max(0, room.inventory);
  const physicalSellable = physical.length
    ? physical.filter((unit) =>
        isSellableStatus(unit.status as PhysicalRoomStatusValue)
      ).length
    : null;
  const defaultCap =
    physicalSellable == null
      ? catalogueCap
      : Math.min(catalogueCap, physicalSellable);

  const [allotments, bookedByNight, closed] = await Promise.all([
    getNightlyAllotments(slug, nights),
    getBookedByNight(slug, nights, excludeBookingId),
    closedNightsForCategory(slug, nights),
  ]);

  let available = Number.POSITIVE_INFINITY;
  let booked = 0;
  let blocked = 0;
  let capacity = defaultCap;

  for (const night of nights) {
    const override = allotments.get(night);
    let cap = override ? Math.max(0, override.inventory) : defaultCap;
    if (closed.has(night)) {
      cap = 0;
      blocked = Math.max(blocked, defaultCap);
    }
    const nightBooked = bookedByNight.get(night) || 0;
    const nightAvailable = Math.max(0, cap - nightBooked);
    if (nightAvailable < available) {
      available = nightAvailable;
      booked = nightBooked;
      capacity = cap;
    }
  }

  if (!Number.isFinite(available)) available = 0;
  return { capacity, booked, blocked, available };
}

/** Physical rooms selectable for offline booking on given dates. */
export async function getAvailablePhysicalRooms(
  slug: string,
  checkIn: string | Date,
  checkOut: string | Date,
  excludeBookingId?: string
) {
  const start = toDateOnly(checkIn);
  const end = toDateOnly(checkOut);
  const [physical, blocks, db] = await Promise.all([
    listPhysicalRooms(slug),
    getActiveDateBlocks(slug),
    Promise.resolve(getDb()),
  ]);

  const categoryBlocked = blocks.some(
    (block) =>
      (!block.physicalRoomNumber ||
        isHotelWideDateBlock(block.roomCategorySlug)) &&
      blockOverlapsStay(start, end, block.startDate, block.endDate)
  );
  if (categoryBlocked) return [];

  const blockedNumbers = new Set(
    blocks
      .filter(
        (block) =>
          block.physicalRoomNumber &&
          blockOverlapsStay(start, end, block.startDate, block.endDate)
      )
      .map((block) => block.physicalRoomNumber!.trim().toUpperCase())
  );

  let bookedNumbers = new Set<string>();
  if (db) {
    const roomRecord = await db.room.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (roomRecord) {
      const overlapping = await db.booking.findMany({
        where: {
          roomId: roomRecord.id,
          status: { in: [...ACTIVE_BOOKING_STATUSES] },
          checkIn: { lt: end },
          checkOut: { gt: start },
          ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
          physicalRoomNumber: { not: null },
        },
        select: { physicalRoomNumber: true },
      });
      bookedNumbers = new Set(
        overlapping
          .map((item) => item.physicalRoomNumber?.trim().toUpperCase())
          .filter(Boolean) as string[]
      );
    }
  }

  return physical.filter((room) => {
    const number = room.number.trim().toUpperCase();
    if (room.status !== "AVAILABLE") return false;
    if (blockedNumbers.has(number)) return false;
    if (bookedNumbers.has(number)) return false;
    return true;
  });
}

export async function markPhysicalRoomStatus(
  slug: string,
  number: string | null | undefined,
  status: PhysicalRoomStatusValue
) {
  if (!number) return;
  const db = getDb();
  if (!db) return;
  try {
    await db.physicalRoom.updateMany({
      where: {
        roomCategorySlug: slug,
        number: number.trim().toUpperCase(),
      },
      data: { status },
    });
    await syncCategoryInventory(slug);
  } catch {
    // ignore if room number does not exist
  }
}

/** Hide room types with no sellable stock for the stay (Booking.com-style). */
export async function filterRoomsOpenForStay<T extends { slug: string }>(
  rooms: T[],
  checkIn: string,
  checkOut: string,
  needed = 1
): Promise<T[]> {
  const open: T[] = [];
  for (const room of rooms) {
    const { available } = await getAvailableCapacity(
      room.slug,
      checkIn,
      checkOut
    );
    if (available >= needed) open.push(room);
  }
  return open;
}
