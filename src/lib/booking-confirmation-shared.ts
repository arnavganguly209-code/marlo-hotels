/** Shared booking confirmation types/helpers — safe for client and server. */

export type BookingConfirmationPdfPayload = {
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
  totalAmount?: number | null;
  roomRate?: number | null;
  taxes?: number | null;
  additionalCharges?: number | null;
  paymentMethod?: string | null;
  physicalRoomNumber?: string | null;
  notes?: string | null;
  specialRequest?: string | null;
  airportPickup?: boolean;
  pickupVehicles?: number | null;
  pickupVehiclesLabel?: string | null;
  pickupAmount?: number | null;
  flightNumber?: string | null;
  pickupDate?: string | null;
  pickupTime?: string | null;
  pickupNotes?: string | null;
  room: { name: string };
};

export function nightsBetween(checkIn: Date | string, checkOut: Date | string) {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}
