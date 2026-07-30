import type { Room } from "@/types/content";

/**
 * Lightweight occupancy snapshot from the Rooms module.
 * Used by homepage + /rooms + /booking so every surface shares one engine.
 */
export type RoomCapacity = {
  slug: string;
  name?: string;
  maxAdults: number;
  maxChildren: number;
  maxGuests: number;
  includedAdults: number;
  includedChildren: number;
  inventory: number;
  extraChildPrice: number;
};

export type PartySearchInput = {
  adults: number;
  children: number;
  /** Guest-requested room count (may be increased automatically). */
  rooms: number;
};

export type PartySearchResult<T extends RoomCapacity = RoomCapacity> = {
  adults: number;
  children: number;
  rooms: number;
  requestedRooms: number;
  autoAdjusted: boolean;
  message?: string;
  matches: T[];
};

export function toRoomCapacity(room: Room): RoomCapacity {
  const maxAdults = Math.max(1, room.maxAdults || room.includedAdults || 1);
  const maxChildren = Math.max(
    0,
    room.maxChildren ??
      Math.max(room.includedChildren, (room.maxGuests || 0) - maxAdults)
  );
  const maxGuests = Math.max(
    room.maxGuests || 0,
    maxAdults + maxChildren,
    room.includedAdults + room.includedChildren
  );
  return {
    slug: room.slug,
    name: room.name,
    maxAdults,
    maxChildren,
    maxGuests,
    includedAdults: Math.max(0, room.includedAdults),
    includedChildren: Math.max(0, room.includedChildren),
    inventory: Math.max(0, room.inventory),
    extraChildPrice: room.extraChildPrice,
  };
}

export function occupancyIndexFromRooms(rooms: Room[]): RoomCapacity[] {
  return rooms
    .filter((room) => room.published !== false && room.inventory > 0)
    .map(toRoomCapacity);
}

/**
 * Adult capacity match — exact for a single room; for multi-room, match the
 * per-room adult share from the Rooms module (e.g. 4 adults → 2×2-adult rooms).
 */
export function adultCapacityMatches(
  room: RoomCapacity,
  adults: number,
  roomCount: number
): boolean {
  const a = Math.max(1, adults);
  const n = Math.max(1, roomCount);

  if (n === 1) {
    // 2 adults → only maxAdults === 2; never show 3/4-adult rooms
    return room.maxAdults === a;
  }

  if (room.maxAdults * n < a) return false;

  const evenShare = a / n;
  if (Number.isInteger(evenShare)) {
    // 4 adults / 2 rooms → only rooms with maxAdults === 2
    return room.maxAdults === evenShare;
  }

  // Uneven (e.g. 5 adults / 2 rooms) → need at least ceil per room
  return room.maxAdults >= Math.ceil(a / n);
}

/** True when `roomCount` units of this type can sleep the party. */
export function roomCanHoldParty(
  room: RoomCapacity,
  adults: number,
  children: number,
  roomCount: number
): boolean {
  const a = Math.max(1, adults);
  const c = Math.max(0, children);
  const n = Math.max(1, roomCount);
  if (room.inventory > 0 && room.inventory < n) return false;
  if (!adultCapacityMatches(room, a, n)) return false;
  if (n * room.maxChildren < c) return false;
  if (n * room.maxGuests < a + c) return false;
  return true;
}

/**
 * Minimum rooms required given live inventory capacities.
 * Prefers 1 room when an exact adult-capacity match exists.
 */
export function minRoomsForParty(
  adults: number,
  children: number,
  inventory: RoomCapacity[],
  maxRooms = 5
): number {
  const available = inventory.filter((room) => room.inventory > 0);
  if (!available.length) {
    return Math.max(1, adults);
  }

  for (let n = 1; n <= maxRooms; n += 1) {
    if (available.some((room) => roomCanHoldParty(room, adults, children, n))) {
      return n;
    }
  }

  // Fallback: pack by the largest adult capacity in the catalog.
  const largestAdults = Math.max(1, ...available.map((room) => room.maxAdults));
  const largestChildren = Math.max(
    1,
    ...available.map((room) => Math.max(1, room.maxChildren))
  );
  return Math.min(
    maxRooms,
    Math.max(
      1,
      Math.ceil(Math.max(1, adults) / largestAdults),
      Math.ceil(Math.max(0, children) / largestChildren)
    )
  );
}

/**
 * Core hotel search resolver — identical results for homepage, /rooms, /booking.
 *
 * Rules (from Rooms-module maxAdults):
 * - 2 adults → only rooms with maxAdults === 2
 * - 3 adults → only rooms with maxAdults === 3
 * - 4 adults → maxAdults === 4 if any; else 2 rooms of maxAdults === 2
 */
export function resolvePartySearch<T extends RoomCapacity>(
  inventory: T[],
  input: PartySearchInput,
  maxRooms = 5
): PartySearchResult<T> {
  const adults = Math.max(1, input.adults);
  const children = Math.max(0, input.children);
  const requestedRooms = Math.max(1, Math.min(maxRooms, input.rooms || 1));
  const available = inventory.filter((room) => room.inventory > 0);

  const matchesFor = (roomCount: number) =>
    available.filter((room) =>
      roomCanHoldParty(room, adults, children, roomCount)
    );

  let rooms = requestedRooms;
  let matches = matchesFor(rooms);
  let autoAdjusted = false;

  if (!matches.length) {
    const needed = minRoomsForParty(adults, children, available, maxRooms);
    if (needed !== rooms) {
      rooms = needed;
      autoAdjusted = true;
    }
    matches = matchesFor(rooms);

    // If even-split exact match failed for uneven leftovers, widen slightly
    // to any room type that can hold the party across N units.
    if (!matches.length && rooms > 1) {
      matches = available.filter((room) => {
        if (room.inventory > 0 && room.inventory < rooms) return false;
        if (room.maxAdults * rooms < adults) return false;
        if (rooms * room.maxChildren < children) return false;
        if (rooms * room.maxGuests < adults + children) return false;
        return room.maxAdults >= Math.ceil(adults / rooms);
      });
    }
  }

  const message =
    autoAdjusted && rooms > 1
      ? `We've selected ${rooms} rooms for your party.`
      : undefined;

  return {
    adults,
    children,
    rooms,
    requestedRooms,
    autoAdjusted,
    message,
    matches,
  };
}

/** Max children the UI should allow based on live inventory × selected rooms. */
export function maxChildrenAllowed(
  inventory: RoomCapacity[],
  roomCount: number
): number {
  const n = Math.max(1, roomCount);
  if (!inventory.length) return n * 2;
  const perRoom = Math.max(0, ...inventory.map((room) => room.maxChildren));
  return Math.max(0, perRoom * n);
}
