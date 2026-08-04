export const BOOKING_OPS_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "ON_HOLD",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
  "NO_SHOW",
  "REFUNDED",
] as const;

export type BookingOpsStatus = (typeof BOOKING_OPS_STATUSES)[number];

export const BOOKING_OPS_STATUS_LABELS: Record<BookingOpsStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ON_HOLD: "On Hold",
  CHECKED_IN: "Checked In",
  CHECKED_OUT: "Checked Out",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
  REFUNDED: "Refunded",
};

export const PAYMENT_OPS_STATUSES = [
  "PENDING",
  "PAID",
  "PARTIAL",
  "REFUNDED",
  "OFFLINE",
] as const;

export type PaymentOpsStatus = (typeof PAYMENT_OPS_STATUSES)[number];

export const PAYMENT_OPS_STATUS_LABELS: Record<PaymentOpsStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PARTIAL: "Partial",
  REFUNDED: "Refunded",
  OFFLINE: "Offline",
};

export function paymentOpsLabel(status: string) {
  return status === "UNPAID"
    ? "Pending"
    : PAYMENT_OPS_STATUS_LABELS[status as PaymentOpsStatus] ?? status;
}
