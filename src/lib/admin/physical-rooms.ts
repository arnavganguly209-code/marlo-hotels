import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { getOrbitRoomEntries } from "@/content/rooms";
import {
  normalizeRoomCatalogData,
  type RoomCatalogData,
} from "@/lib/orbit/room-defaults";
import {
  PHYSICAL_ROOM_STATUSES,
  type InventoryCategoryRow,
  type MarloRoomCategory,
  type PhysicalRoomRow,
  type PhysicalRoomStatusValue,
} from "@/lib/admin/physical-rooms-public";

export {
  PHYSICAL_ROOM_STATUSES,
  type InventoryCategoryRow,
  type MarloRoomCategory,
  type PhysicalRoomRow,
  type PhysicalRoomStatusValue,
};

/** Marlo catalogue categories only — from ContentEntry rooms (never hardcoded Thamel). */
export async function getMarloRoomCategories(): Promise<MarloRoomCategory[]> {
  const entries = await getOrbitRoomEntries();
  return entries
    .filter((entry) => Boolean(entry.slug))
    .map((entry) => {
      const data = normalizeRoomCatalogData(
        entry.data as Partial<RoomCatalogData>
      );
      return {
        id: entry.id,
        key: entry.key,
        title: entry.title,
        slug: entry.slug as string,
        roomType: data.roomType,
        inventory: data.inventory,
        sortOrder: data.sortOrder,
      };
    })
    .sort(
      (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)
    );
}

export function serializePhysicalRoom(room: {
  id: string;
  number: string;
  roomCategorySlug: string;
  roomCategoryName: string;
  status: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}): PhysicalRoomRow {
  return {
    id: room.id,
    number: room.number,
    roomCategorySlug: room.roomCategorySlug,
    roomCategoryName: room.roomCategoryName,
    status: room.status as PhysicalRoomStatusValue,
    notes: room.notes,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

/** Rooms that count toward booking capacity (exist as sellable stock). */
export function isSellableStatus(status: PhysicalRoomStatusValue) {
  return (
    status === "AVAILABLE" ||
    status === "OCCUPIED" ||
    status === "CLEANING"
  );
}

export async function listPhysicalRooms(slug?: string) {
  const db = getDb();
  if (!db) return [] as PhysicalRoomRow[];
  try {
    const rooms = await db.physicalRoom.findMany({
      where: slug ? { roomCategorySlug: slug } : undefined,
      orderBy: [{ roomCategorySlug: "asc" }, { number: "asc" }],
    });
    return rooms.map(serializePhysicalRoom);
  } catch {
    // Table may not exist until migrate deploy finishes.
    return [] as PhysicalRoomRow[];
  }
}

export async function buildInventoryRows(): Promise<InventoryCategoryRow[]> {
  const [categories, rooms] = await Promise.all([
    getMarloRoomCategories(),
    listPhysicalRooms(),
  ]);

  return categories.map((category) => {
    const units = rooms.filter((room) => room.roomCategorySlug === category.slug);
    const count = (status: PhysicalRoomStatusValue) =>
      units.filter((room) => room.status === status).length;

    const available = count("AVAILABLE");
    const occupied = count("OCCUPIED");
    const blocked = count("BLOCKED");
    const maintenance = count("MAINTENANCE");
    const cleaning = count("CLEANING");
    const outOfService = count("OUT_OF_SERVICE");
    const sellableInventory = units.filter((room) =>
      isSellableStatus(room.status)
    ).length;

    return {
      slug: category.slug,
      name: category.title,
      roomType: category.roomType,
      sortOrder: category.sortOrder,
      inventory: Math.max(0, category.inventory),
      total: units.length,
      occupied,
      available,
      blocked,
      maintenance,
      cleaning,
      outOfService,
      sellableInventory,
    };
  });
}

/**
 * Keep ContentEntry room.inventory aligned with physical sellable units
 * so public booking capacity stays in sync (booking logic unchanged).
 */
export async function syncCategoryInventory(slug: string) {
  const db = getDb();
  if (!db) return;

  const [entry, units] = await Promise.all([
    db.contentEntry.findFirst({
      where: { module: "rooms", slug },
    }),
    db.physicalRoom.findMany({
      where: { roomCategorySlug: slug },
      select: { status: true },
    }),
  ]);

  if (!entry) return;

  const sellable = units.filter((unit) =>
    isSellableStatus(unit.status as PhysicalRoomStatusValue)
  ).length;

  // If no physical rooms configured yet, leave catalogue inventory alone.
  if (units.length === 0) return;

  const data = normalizeRoomCatalogData(
    entry.data as Partial<RoomCatalogData>
  );
  const next = {
    ...data,
    inventory: sellable,
  };

  await db.contentEntry.update({
    where: { id: entry.id },
    data: {
      data: next as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function syncAllCategoryInventories() {
  const categories = await getMarloRoomCategories();
  for (const category of categories) {
    await syncCategoryInventory(category.slug);
  }
}

/**
 * Set bookable inventory for a room category (drives online booking capacity).
 */
export async function setCategoryInventory(slug: string, inventory: number) {
  const db = getDb();
  if (!db) throw new Error("Database unavailable");

  const entry = await db.contentEntry.findFirst({
    where: { module: "rooms", slug },
  });
  if (!entry) throw new Error("Room category not found");

  const data = normalizeRoomCatalogData(
    entry.data as Partial<RoomCatalogData>
  );
  const nextInventory = Math.max(0, Math.floor(inventory));
  const next = {
    ...data,
    inventory: nextInventory,
  };

  await db.contentEntry.update({
    where: { id: entry.id },
    data: {
      data: next as unknown as Prisma.InputJsonValue,
    },
  });

  return nextInventory;
}
