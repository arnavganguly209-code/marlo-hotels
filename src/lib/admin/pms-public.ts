export const DATE_BLOCK_REASONS = [
  "MAINTENANCE",
  "RENOVATION",
  "DEEP_CLEANING",
  "PRIVATE_BOOKING",
  "VIP_RESERVATION",
  "OWNER_USE",
  "BLOCKED",
  "OTHER",
] as const;

export type DateBlockReasonValue = (typeof DATE_BLOCK_REASONS)[number];

export const DATE_BLOCK_REASON_LABELS: Record<DateBlockReasonValue, string> = {
  MAINTENANCE: "Maintenance",
  RENOVATION: "Renovation",
  DEEP_CLEANING: "Deep Cleaning",
  PRIVATE_BOOKING: "Private Booking",
  VIP_RESERVATION: "VIP Reservation",
  OWNER_USE: "Owner Use",
  BLOCKED: "Blocked",
  OTHER: "Other",
};

export const OFFLINE_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
] as const;

export type OfflineBookingStatusValue =
  (typeof OFFLINE_BOOKING_STATUSES)[number];

export const OFFLINE_PAYMENT_STATUSES = [
  "PAID",
  "PARTIAL",
  "UNPAID",
  "OFFLINE",
] as const;

export type OfflinePaymentStatusValue =
  (typeof OFFLINE_PAYMENT_STATUSES)[number];
