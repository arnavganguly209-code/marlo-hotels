import "server-only";

import { getRoomBySlug } from "@/content/rooms";
import { getAvailableCapacity } from "@/lib/admin/availability";
import {
  airportPickupCharge,
  airportPickupVehiclesForGuests,
  quoteFromDates,
} from "@/lib/booking-pricing";

export type BookingQuoteRequest = {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  breakfast: boolean;
  airportPickup?: boolean;
  pickupVehicles?: number;
};

export type ServerBookingQuote = {
  roomName: string;
  roomSlug: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  breakfast: boolean;
  stayTotal: number;
  pickupVehicles: number;
  pickupFee: number;
  grandTotal: number;
  currency: "USD";
  available: number;
};

export async function computeServerBookingQuote(
  input: BookingQuoteRequest
): Promise<
  | { ok: true; quote: ServerBookingQuote }
  | { ok: false; error: string; status: number }
> {
  const room = await getRoomBySlug(input.roomSlug);
  if (!room || room.published === false) {
    return { ok: false, error: "Unknown room", status: 400 };
  }
  if (room.inventory <= 0) {
    return {
      ok: false,
      error: "Sold Out",
      status: 409,
    };
  }

  const checkIn = input.checkIn;
  const checkOut = input.checkOut;
  if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
    return {
      ok: false,
      error: "Invalid stay dates",
      status: 400,
    };
  }

  const rooms = Math.max(1, input.rooms || 1);
  const adults = Math.max(1, input.adults || 1);
  const children = Math.max(0, input.children || 0);
  const breakfast = Boolean(input.breakfast);

  const stay = quoteFromDates({
    basePricePerNight: room.priceFrom,
    checkIn,
    checkOut,
    adults,
    children,
    rooms,
    breakfast,
    includedAdults: room.includedAdults,
    includedChildren: room.includedChildren,
    maxChildren: room.maxChildren,
    extraAdultPerNight: room.extraAdultPrice,
    extraChildPerNight: room.extraChildPrice,
  });

  const guestCount = adults + children;
  const pickupVehicles = input.airportPickup
    ? Math.max(
        1,
        Number(input.pickupVehicles) ||
          airportPickupVehiclesForGuests(guestCount)
      )
    : 0;
  const pickupFee = input.airportPickup
    ? airportPickupCharge(pickupVehicles)
    : 0;
  const grandTotal = Number((stay.total + pickupFee).toFixed(2));

  const availability = await getAvailableCapacity(room.slug, checkIn, checkOut);
  if (rooms > availability.available) {
    return {
      ok: false,
      error: "No Rooms Available",
      status: 409,
    };
  }

  return {
    ok: true,
    quote: {
      roomName: room.name,
      roomSlug: room.slug,
      nights: stay.nights,
      rooms,
      adults,
      children,
      breakfast,
      stayTotal: Number(stay.total.toFixed(2)),
      pickupVehicles,
      pickupFee: Number(pickupFee.toFixed(2)),
      grandTotal,
      currency: "USD",
      available: availability.available,
    },
  };
}

export function buildBookingNotes(input: {
  notes?: string;
  whatsapp: string;
  country: string;
  arrivalTime: string;
  breakfast: boolean;
  airportPickup?: boolean;
  pickupVehicles?: number;
  flightNumber?: string;
  flightArrivalTime?: string;
  paymentLabel?: string;
}) {
  const notesText = (input.notes || "").trim() || "None";
  return [
    notesText,
    `WhatsApp: ${input.whatsapp}`,
    `Country: ${input.country}`,
    `Arrival: ${input.arrivalTime}`,
    `Breakfast: ${input.breakfast ? "Yes" : "No"}`,
    input.airportPickup
      ? `Airport pickup: Yes · ${input.pickupVehicles || 1} vehicle(s) · Flight ${input.flightNumber || "—"} · Kathmandu arrival ${input.flightArrivalTime || "—"}`
      : "Airport pickup: No",
    input.paymentLabel ? `Payment: ${input.paymentLabel}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
