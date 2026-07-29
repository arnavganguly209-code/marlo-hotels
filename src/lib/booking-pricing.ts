import { nightsBetween } from "@/lib/utils";
import {
  maxChildrenAllowed,
  minRoomsForParty,
  type RoomCapacity,
} from "@/lib/booking-occupancy";

export const EXTRA_GUEST_PER_NIGHT = 5;
export const BREAKFAST_PER_PERSON_PER_NIGHT = 5;
export const AIRPORT_PICKUP_PER_VEHICLE = 10;
export const AIRPORT_PICKUP_MAX_PER_VEHICLE = 4;

export type StayQuoteInput = {
  basePricePerNight: number;
  nights: number;
  adults: number;
  children?: number;
  rooms?: number;
  breakfast: boolean;
  /** Adults included in the base room rate. */
  includedAdults?: number;
  /** Children included complimentary in the base rate (per room). */
  includedChildren?: number;
  /** Hard child cap per room from Rooms module. */
  maxChildren?: number;
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

export function airportPickupVehiclesForGuests(guestCount: number) {
  const guests = Math.max(0, guestCount);
  if (guests <= 0) return 1;
  return Math.max(1, Math.ceil(guests / AIRPORT_PICKUP_MAX_PER_VEHICLE));
}

export function airportPickupCharge(vehicles: number) {
  return Math.max(0, vehicles) * AIRPORT_PICKUP_PER_VEHICLE;
}

/**
 * Base rate covers included adults/children per room × room count.
 * Extra children beyond includedChildren (from Rooms module) = +$5 / night
 * (or room.extraChildPrice) — never rejects when within maxChildren.
 */
export function calculateStayQuote(input: StayQuoteInput): StayQuote {
  const nights = Math.max(1, input.nights);
  const rooms = Math.max(1, input.rooms ?? 1);
  const adults = Math.max(1, input.adults);
  const maxChildrenTotal =
    typeof input.maxChildren === "number"
      ? Math.max(0, input.maxChildren) * rooms
      : Number.POSITIVE_INFINITY;
  const children = Math.min(
    Math.max(0, input.children ?? 0),
    Number.isFinite(maxChildrenTotal) ? maxChildrenTotal : 99
  );
  const includedAdultsPerRoom = Math.max(0, input.includedAdults ?? 1);
  const includedChildrenPerRoom = Math.max(0, input.includedChildren ?? 0);
  const includedAdults = includedAdultsPerRoom * rooms;
  const includedChildren = includedChildrenPerRoom * rooms;
  const extraAdultRate = input.extraAdultPerNight ?? EXTRA_GUEST_PER_NIGHT;
  const extraChildRate = input.extraChildPerNight ?? EXTRA_GUEST_PER_NIGHT;
  const breakfastRate =
    input.breakfastPerPersonPerNight ?? BREAKFAST_PER_PERSON_PER_NIGHT;

  const roomSubtotal = input.basePricePerNight * nights * rooms;
  const extraAdults = Math.max(0, adults - includedAdults);
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
    includedAdults,
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

/**
 * Build search query string.
 * When an occupancy index is provided, room count is raised only if the
 * live inventory cannot fit the party at the requested count.
 */
export function buildRoomsSearchParams(
  input: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    promo?: string;
    breakfast?: boolean;
  },
  occupancy?: RoomCapacity[]
): string {
  let rooms = Math.max(1, input.rooms);
  let children = Math.max(0, input.children);

  if (occupancy?.length) {
    rooms = Math.max(rooms, minRoomsForParty(input.adults, children, occupancy));
    children = Math.min(children, maxChildrenAllowed(occupancy, rooms));
  }

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

/** @deprecated Use resolvePartySearch from booking-occupancy */
export {
  resolvePartySearch,
  roomCanHoldParty,
  minRoomsForParty,
  maxChildrenAllowed,
  occupancyIndexFromRooms,
  toRoomCapacity,
} from "@/lib/booking-occupancy";
