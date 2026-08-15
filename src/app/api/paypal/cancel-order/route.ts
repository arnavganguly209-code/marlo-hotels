import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";

const cancelSchema = z.object({
  orderId: z.string().min(5).optional(),
  bookingId: z.string().min(5).optional(),
});

/**
 * Release a PayPal-pending booking when the guest cancels checkout.
 * Does not confirm or capture payment.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cancelSchema.safeParse(body);
  if (!parsed.success || (!parsed.data.orderId && !parsed.data.bookingId)) {
    return NextResponse.json({ error: "Invalid cancel request" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const booking = await db.booking.findFirst({
    where: {
      paymentMethod: "PAYPAL",
      OR: [
        ...(parsed.data.orderId ? [{ paypalOrderId: parsed.data.orderId }] : []),
        ...(parsed.data.bookingId ? [{ id: parsed.data.bookingId }] : []),
      ],
    },
  });

  if (!booking) {
    return NextResponse.json({ ok: true, cancelled: false });
  }

  if (booking.paymentStatus === "PAID" || booking.status === "CONFIRMED") {
    return NextResponse.json(
      { error: "Paid bookings cannot be cancelled here" },
      { status: 409 }
    );
  }

  await db.booking.update({
    where: { id: booking.id },
    data: {
      status: "CANCELLED",
      paymentStatus: "FAILED",
      notes: [booking.notes || "", "PayPal checkout cancelled by guest"]
        .filter(Boolean)
        .join("\n"),
    },
  });

  return NextResponse.json({
    ok: true,
    cancelled: true,
    reference: booking.reference,
  });
}
