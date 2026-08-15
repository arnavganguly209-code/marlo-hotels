import "server-only";

import {
  type BookingConfirmationPdfPayload,
} from "@/lib/booking-confirmation-pdf";
import { airportPickupVehiclesLabel } from "@/lib/booking-pricing";
import { extractGuestSpecialRequest } from "@/lib/booking-total-server";

export type BookingPdfSource = {
  reference: string;
  status: string;
  confirmationStatus?: string | null;
  createdAt?: Date | string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  country?: string | null;
  checkIn: Date | string;
  checkOut: Date | string;
  adults: number;
  children: number;
  rooms: number;
  breakfast: boolean;
  paymentStatus: string;
  paymentMethod?: string | null;
  totalAmount?: number | null | { toString(): string };
  physicalRoomNumber?: string | null;
  notes?: string | null;
  airportPickup?: boolean | null;
  pickupVehicles?: number | null;
  pickupAmount?: number | null | { toString(): string };
  flightNumber?: string | null;
  pickupDate?: string | null;
  pickupTime?: string | null;
  pickupNotes?: string | null;
  room: { name: string };
};

function moneyNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function toBookingConfirmationPdfPayload(
  booking: BookingPdfSource
): BookingConfirmationPdfPayload {
  const total = moneyNumber(booking.totalAmount);
  const pickupAmount = booking.airportPickup
    ? moneyNumber(booking.pickupAmount) || 0
    : 0;
  const roomStay =
    total == null ? null : Number(Math.max(0, total - pickupAmount).toFixed(2));
  const methodLabel =
    booking.paymentMethod === "PAYPAL"
      ? "PayPal"
      : booking.paymentMethod || null;

  return {
    reference: booking.reference,
    status: booking.status,
    confirmationStatus: booking.confirmationStatus,
    createdAt: booking.createdAt || new Date(),
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    country: booking.country,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    rooms: booking.rooms,
    breakfast: booking.breakfast,
    paymentStatus: booking.paymentStatus,
    paymentMethod: methodLabel,
    totalAmount: total,
    roomRate: roomStay,
    taxes: 0,
    additionalCharges: pickupAmount > 0 ? pickupAmount : 0,
    airportPickup: Boolean(booking.airportPickup),
    pickupVehicles: booking.airportPickup
      ? booking.pickupVehicles || 0
      : 0,
    pickupVehiclesLabel: booking.airportPickup
      ? airportPickupVehiclesLabel(booking.pickupVehicles || 0)
      : "—",
    pickupAmount: pickupAmount > 0 ? pickupAmount : null,
    flightNumber: booking.flightNumber || null,
    pickupDate: booking.pickupDate || null,
    pickupTime: booking.pickupTime || null,
    pickupNotes: booking.pickupNotes || null,
    physicalRoomNumber: booking.physicalRoomNumber,
    notes: extractGuestSpecialRequest(booking.notes) || booking.notes,
    specialRequest: extractGuestSpecialRequest(booking.notes),
    room: { name: booking.room.name },
  };
}
