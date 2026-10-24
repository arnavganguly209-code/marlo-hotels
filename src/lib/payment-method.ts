export const PAYMENT_METHOD_PAYPAL = "PAYPAL";
export const PAYMENT_METHOD_PAY_AT_HOTEL = "PAY_AT_HOTEL";
export const PAYMENT_METHOD_CARD = "CARD";

export function paymentMethodLabel(value?: string | null): string {
  const method = (value || "").trim().toUpperCase();
  if (method === PAYMENT_METHOD_PAYPAL) return "PayPal";
  if (method === PAYMENT_METHOD_PAY_AT_HOTEL) return "Pay at Hotel";
  if (method === PAYMENT_METHOD_CARD) return "Card";
  return value?.trim() || "—";
}

export function isPayAtHotel(value?: string | null): boolean {
  return (value || "").trim().toUpperCase() === PAYMENT_METHOD_PAY_AT_HOTEL;
}

export function isPayPalMethod(value?: string | null): boolean {
  return (value || "").trim().toUpperCase() === PAYMENT_METHOD_PAYPAL;
}
