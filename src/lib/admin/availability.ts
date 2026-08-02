import "server-only";

import { getDb } from "@/lib/db";
import { getRoomBySlug } from "@/content/rooms";
import {
  isSellableStatus,
  listPhysicalRooms,
  syncCategoryInventory,
  type PhysicalRoomStatusValue,
} from "@/lib/admin/physical-rooms";

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

export async function getActiveDateBlocks(slug?: string) {
  const db = getDb();
  if (!db) return [];
  try {
    return await db.dateBlock.findMany({
      where: {
        status: "ACTIVE",
        ...(slug ? { roomCategorySlug: slug } : {}),
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
    rangesOverlap(start, end, toDateOnly(block.startDate), toDateOnly(block.endDate))
  );

  if (overlapping.some((block) => !block.physicalRoomNumber)) {
    // Whole category blocked.
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

  const physical = await listPhysicalRooms(slug);
  const sellable = physical.length
    ? physical.filter((unit) =>
        isSellableStatus(unit.status as PhysicalRoomStatusValue)
      ).length
    : Math.max(0, room.inventory);

  const [booked, blocked] = await Promise.all([
    countBookedUnits(slug, checkIn, checkOut, excludeBookingId),
    countBlockedUnits(slug, checkIn, checkOut),
  ]);

  const available = Math.max(0, sellable - booked - blocked);
  return { capacity: sellable, booked, blocked, available };
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
      !block.physicalRoomNumber &&
      rangesOverlap(start, end, toDateOnly(block.startDate), toDateOnly(block.endDate))
  );
  if (categoryBlocked) return [];

  const blockedNumbers = new Set(
    blocks
      .filter(
        (block) =>
          block.physicalRoomNumber &&
          rangesOverlap(
            start,
            end,
            toDateOnly(block.startDate),
            toDateOnly(block.endDate)
          )
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
