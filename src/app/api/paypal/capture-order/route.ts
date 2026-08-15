import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableCapacity } from "@/lib/admin/availability";
import { sendConfirmedBookingEmails } from "@/lib/booking-mail";
import { getDb } from "@/lib/db";
import {
  amountsMatch,
  capturePayPalOrder,
  extractCapture,
  getPayPalOrder,
  paypalConfigured,
} from "@/lib/paypal";

const captureSchema = z.object({
  orderId: z.string().min(5),
  bookingId: z.string().optional(),
});

export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid capture request" },
      { status: 400 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }

  const orderId = parsed.data.orderId.trim();
  const existing = await db.booking.findFirst({
    where: {
      OR: [
        { paypalOrderId: orderId },
        ...(parsed.data.bookingId ? [{ id: parsed.data.bookingId }] : []),
      ],
    },
    include: { room: { select: { name: true, slug: true } } },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Booking not found for this PayPal order" },
      { status: 404 }
    );
  }

  // Idempotent success if already captured/paid for this order.
  if (
    existing.paymentStatus === "PAID" &&
    existing.paypalOrderId === orderId &&
    existing.paypalCaptureId
  ) {
    return NextResponse.json({
      ok: true,
      alreadyProcessed: true,
      reference: existing.reference,
      bookingId: existing.id,
      paypalOrderId: existing.paypalOrderId,
      paypalCaptureId: existing.paypalCaptureId,
      amount:
        existing.totalAmount === null ? null : Number(existing.totalAmount),
      currency: existing.paymentCurrency || "USD",
      paymentMethod: "PAYPAL",
      paymentStatus: existing.paymentStatus,
      status: existing.status,
    });
  }

  if (existing.paypalOrderId && existing.paypalOrderId !== orderId) {
    return NextResponse.json(
      { error: "PayPal order does not match this booking" },
      { status: 409 }
    );
  }

  const expectedAmount =
    existing.totalAmount === null ? NaN : Number(existing.totalAmount);
  if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
    return NextResponse.json(
      { error: "Booking total is invalid" },
      { status: 400 }
    );
  }

  // Re-check availability before capturing funds.
  const availability = await getAvailableCapacity(
    existing.room.slug,
    existing.checkIn,
    existing.checkOut,
    existing.id
  );
  if (existing.rooms > availability.available) {
    await db.booking.update({
      where: { id: existing.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
        notes: [
          existing.notes || "",
          "Cancelled: room no longer available before PayPal capture",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });
    return NextResponse.json(
      {
        error: "ROOM_UNAVAILABLE",
        message:
          "Unfortunately, this room is no longer available for the selected dates. Your payment has not been captured.",
      },
      { status: 409 }
    );
  }

  let captured;
  try {
    // Prefer fresh order state; capture only when still APPROVED/CREATED.
    const current = await getPayPalOrder(orderId);
    if (current.status === "COMPLETED") {
      captured = current;
    } else {
      captured = await capturePayPalOrder(orderId);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PayPal capture failed";
    await db.booking.update({
      where: { id: existing.id },
      data: { paymentStatus: "FAILED" },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const details = extractCapture(captured);
  if (details.bookingId && details.bookingId !== existing.id) {
    return NextResponse.json(
      { error: "PayPal order ownership mismatch" },
      { status: 409 }
    );
  }

  const captureOk =
    (details.captureStatus === "COMPLETED" ||
      details.orderStatus === "COMPLETED") &&
    details.captureId &&
    amountsMatch(expectedAmount, details.amount) &&
    details.currency === "USD";

  if (!captureOk) {
    await db.booking.update({
      where: { id: existing.id },
      data: { paymentStatus: "FAILED" },
    });
    return NextResponse.json(
      {
        error: "PAYMENT_VERIFICATION_FAILED",
        message:
          "PayPal payment could not be verified. Your reservation has not been confirmed.",
      },
      { status: 402 }
    );
  }

  const booking = await db.booking.update({
    where: { id: existing.id },
    data: {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paymentMethod: "PAYPAL",
      paymentCurrency: "USD",
      paypalOrderId: orderId,
      paypalCaptureId: details.captureId,
      paidAt: details.paidAt,
      notes: [
        existing.notes || "",
        `PayPal Order: ${orderId}`,
        `PayPal Capture: ${details.captureId}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    include: { room: { select: { name: true, slug: true } } },
  });

  const email = await sendConfirmedBookingEmails({
    ...booking,
    totalAmount:
      booking.totalAmount === null ? null : Number(booking.totalAmount),
    pickupAmount:
      booking.pickupAmount === null ? null : Number(booking.pickupAmount),
  });

  return NextResponse.json({
    ok: true,
    reference: booking.reference,
    bookingId: booking.id,
    paypalOrderId: booking.paypalOrderId,
    paypalCaptureId: booking.paypalCaptureId,
    amount: booking.totalAmount === null ? null : Number(booking.totalAmount),
    currency: booking.paymentCurrency || "USD",
    paymentMethod: "PAYPAL",
    paymentStatus: booking.paymentStatus,
    status: booking.status,
    email,
  });
}
