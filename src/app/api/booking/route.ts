import { NextResponse } from "next/server";

/**
 * Online room reservations are created only through PayPal Checkout
 * (`/api/paypal/create-order` → capture). Direct POST booking create
 * (former Card reservation-request path) is disabled.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "PAYPAL_REQUIRED",
      message:
        "Online reservations require PayPal Checkout. Card reservation requests are no longer accepted.",
    },
    { status: 405 }
  );
}
