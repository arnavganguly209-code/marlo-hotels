import { nightsBetween } from "@/lib/utils";

export const EXTRA_GUEST_PER_NIGHT = 5;
export const BREAKFAST_PER_PERSON_PER_NIGHT = 5;
/** Every room includes 1 child free; 2nd child per room is +$5 / night. */
export const FREE_CHILDREN_PER_ROOM = 1;
export const MAX_CHILDREN_PER_ROOM = 2;
export const AIRPORT_PICKUP_PER_VEHICLE = 10;
export const AIRPORT_PICKUP_MAX_PER_VEHICLE = 4;

export type StayQuoteInput = {
  basePricePerNight: number;
  nights: number;
  adults: number;
  children?: number;
  rooms?: number;
  breakfast: boolean;
  /** Adults included in the base room rate (also treated as adult capacity). */
  includedAdults?: number;
  includedChildren?: number;
  breakfastPerPersonPerNight?: number;
  extraAdultPerNight?: number;
  extraChildPerNight?: number;
};

export type StayQuote = {
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  roomSubtotal: number;
  includedAdults: number;
  includedChildren: number;
  extraAdults: number;
  extraChildren: number;
  extraAdultCharge: number;
  extraChildCharge: number;
  breakfastGuests: number;
  breakfastCharge: number;
  total: number;
};

export type RoomOccupancy = {
  includedAdults: number;
  includedChildren?: number;
};

/** Minimum rooms needed for a party in a given room type. */
export function roomsNeededForParty(
  adults: number,
  children: number,
  room: RoomOccupancy
): number {
  const maxAdults = Math.max(1, room.includedAdults);
  const byAdults = Math.ceil(Math.max(1, adults) / maxAdults);
  const byChildren = Math.ceil(Math.max(0, children) / MAX_CHILDREN_PER_ROOM);
  return Math.max(1, byAdults, byChildren);
}

/**
 * Suggested rooms from the search box when room type is unknown.
 * Assumes a standard 2-adult room as the baseline.
 */
export function suggestedRoomsForSearch(adults: number, children: number) {
  return roomsNeededForParty(adults, children, { includedAdults: 2 });
}

/**
 * A room matches the party when:
 * - it is not oversized for the adult count (e.g. hide 3-adult rooms for 2 adults)
 * - the selected room count can hold everyone
 */
export function roomMatchesParty(
  room: RoomOccupancy,
  adults: number,
  children: number,
  rooms: number
): boolean {
  const partyAdults = Math.max(1, adults);
  const partyChildren = Math.max(0, children);
  const roomCount = Math.max(1, rooms);

  // Do not suggest larger adult-capacity rooms than the party needs.
  if (room.includedAdults > partyAdults) return false;

  const needed = roomsNeededForParty(partyAdults, partyChildren, room);
  return needed <= roomCount;
}

export function filterRoomsForParty<T extends RoomOccupancy>(
  rooms: T[],
  adults: number,
  children: number,
  roomCount: number
): T[] {
  return rooms.filter((room) =>
    roomMatchesParty(room, adults, children, roomCount)
  );
}

export function airportPickupVehiclesForGuests(guestCount: number) {
  const guests = Math.max(0, guestCount);
  if (guests <= 0) return 1;
  return Math.max(1, Math.ceil(guests / AIRPORT_PICKUP_MAX_PER_VEHICLE));
}

export function airportPickupCharge(vehicles: number) {
  return Math.max(0, vehicles) * AIRPORT_PICKUP_PER_VEHICLE;
}

/**
 * Base price includes the room's included adult occupancy.
 * Children: 1 complimentary per room; each additional child (max 2/room) +$5 / night.
 * Extra adults beyond included capacity are charged per night (legacy path);
 * search flow prefers enough rooms so adults fit without extras.
 */
export function calculateStayQuote(input: StayQuoteInput): StayQuote {
  const nights = Math.max(1, input.nights);
  const rooms = Math.max(1, input.rooms ?? 1);
  const adults = Math.max(1, input.adults);
  const children = Math.min(
    Math.max(0, input.children ?? 0),
    rooms * MAX_CHILDREN_PER_ROOM
  );
  const includedAdults = Math.max(0, input.includedAdults ?? 1);
  const includedChildren = FREE_CHILDREN_PER_ROOM * rooms;
  const extraAdultRate = input.extraAdultPerNight ?? EXTRA_GUEST_PER_NIGHT;
  const extraChildRate = input.extraChildPerNight ?? EXTRA_GUEST_PER_NIGHT;
  const breakfastRate =
    input.breakfastPerPersonPerNight ?? BREAKFAST_PER_PERSON_PER_NIGHT;

  const roomSubtotal = input.basePricePerNight * nights * rooms;
  // Adults across all rooms: capacity = includedAdults * rooms
  const extraAdults = Math.max(0, adults - includedAdults * rooms);
  // 1 child free per room; 2nd child per room is chargeable
  const extraChildren = Math.max(0, children - includedChildren);
  const extraAdultCharge = extraAdults * extraAdultRate * nights;
  const extraChildCharge = extraChildren * extraChildRate * nights;
  const breakfastGuests = adults + children;
  const breakfastCharge = input.breakfast
    ? breakfastGuests * breakfastRate * nights
    : 0;

  return {
    nights,
    rooms,
    adults,
    children,
    roomSubtotal,
    includedAdults: includedAdults * rooms,
    includedChildren,
    extraAdults,
    extraChildren,
    extraAdultCharge,
    extraChildCharge,
    breakfastGuests,
    breakfastCharge,
    total:
      roomSubtotal + extraAdultCharge + extraChildCharge + breakfastCharge,
  };
}

export function quoteFromDates(
  input: Omit<StayQuoteInput, "nights"> & {
    checkIn: string;
    checkOut: string;
  }
): StayQuote {
  const nights = Math.max(1, nightsBetween(input.checkIn, input.checkOut));
  return calculateStayQuote({ ...input, nights });
}

export function buildRoomsSearchParams(input: {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  promo?: string;
  breakfast?: boolean;
}): string {
  const rooms = Math.max(
    input.rooms,
    suggestedRoomsForSearch(input.adults, input.children)
  );
  const children = Math.min(
    Math.max(0, input.children),
    rooms * MAX_CHILDREN_PER_ROOM
  );
  const params = new URLSearchParams({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: String(input.adults),
    children: String(children),
    rooms: String(rooms),
  });
  if (input.promo?.trim()) params.set("promo", input.promo.trim().toUpperCase());
  if (input.breakfast) params.set("breakfast", "1");
  return params.toString();
}

export function formatOccupancyLabel(adults: number, children: number) {
  const adultLabel = `${adults} Adult${adults === 1 ? "" : "s"}`;
  if (children <= 0) return adultLabel;
  return `${adultLabel} · ${children} Child${children === 1 ? "" : "ren"}`;
}
