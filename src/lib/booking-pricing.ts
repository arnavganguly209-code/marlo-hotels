import { nightsBetween } from "@/lib/utils";

export const EXTRA_ADULT_PER_NIGHT = 5;
export const BREAKFAST_PER_PERSON_PER_NIGHT = 5;

export type StayQuoteInput = {
  basePricePerNight: number;
  nights: number;
  adults: number;
  children?: number;
  rooms?: number;
  breakfast: boolean;
  breakfastPerPersonPerNight?: number;
  extraAdultPerNight?: number;
};

export type StayQuote = {
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  roomSubtotal: number;
  extraAdults: number;
  extraAdultCharge: number;
  breakfastGuests: number;
  breakfastCharge: number;
  total: number;
};

/** 1 adult free; each additional adult = +$5 / night. */
export function calculateStayQuote(input: StayQuoteInput): StayQuote {
  const nights = Math.max(1, input.nights);
  const rooms = Math.max(1, input.rooms ?? 1);
  const adults = Math.max(1, input.adults);
  const children = Math.max(0, input.children ?? 0);
  const extraAdultRate = input.extraAdultPerNight ?? EXTRA_ADULT_PER_NIGHT;
  const breakfastRate =
    input.breakfastPerPersonPerNight ?? BREAKFAST_PER_PERSON_PER_NIGHT;

  const roomSubtotal = input.basePricePerNight * nights * rooms;
  const extraAdults = Math.max(0, adults - 1);
  const extraAdultCharge = extraAdults * extraAdultRate * nights * rooms;
  const breakfastGuests = adults + children;
  const breakfastCharge = input.breakfast
    ? breakfastGuests * breakfastRate * nights * rooms
    : 0;

  return {
    nights,
    rooms,
    adults,
    children,
    roomSubtotal,
    extraAdults,
    extraAdultCharge,
    breakfastGuests,
    breakfastCharge,
    total: roomSubtotal + extraAdultCharge + breakfastCharge,
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
  const params = new URLSearchParams({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: String(input.adults),
    children: String(input.children),
    rooms: String(input.rooms),
  });
  if (input.promo?.trim()) params.set("promo", input.promo.trim().toUpperCase());
  if (input.breakfast) params.set("breakfast", "1");
  return params.toString();
}
