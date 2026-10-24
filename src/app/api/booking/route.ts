import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/content/rooms";
import { generateMarloBookingId } from "@/lib/booking-id";
import { verifyBookingIntent } from "@/lib/booking-intent";
import { sendBookingEmails } from "@/lib/booking-mail";
import {
  buildBookingNotes,
  computeServerBookingQuote,
} from "@/lib/booking-total-server";
import { getDb } from "@/lib/db";
import { PAYMENT_METHOD_PAY_AT_HOTEL } from "@/lib/payment-method";
import {
  clientIpFromRequest,
  consumeRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { bookingRequestSchema } from "@/lib/validators";

const IDEMPOTENCY_WINDOW_MS = 15 * 60 * 1000;

/**
 * Pay at Hotel reservations. PayPal stays on /api/paypal/create-order → capture.
 * Totals and availability are computed server-side; client amounts are ignored.
 */
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const ipLimit = consumeRateLimit(`booking:${ip}`, 5, 15 * 60 * 1000);
  if (!ipLimit.ok) return rateLimitResponse(ipLimit.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (data.paymentMethod !== PAYMENT_METHOD_PAY_AT_HOTEL) {
    return NextResponse.json(
      {
        error: "UNSUPPORTED_PAYMENT_METHOD",
        message:
          "This endpoint creates Pay at Hotel reservations only. Use PayPal Checkout to pay now.",
      },
      { status: 400 }
    );
  }

  const emailLimit = consumeRateLimit(
    `booking-email:${data.guestEmail.trim().toLowerCase()}`,
    3,
    15 * 60 * 1000
  );
  if (!emailLimit.ok) return rateLimitResponse(emailLimit.retryAfterSeconds);

  if (!data.intentToken) {
    return NextResponse.json(
      { error: "Booking intent is required. Refresh the payment page and try again." },
      { status: 400 }
    );
  }

  const intent = verifyBookingIntent(data.intentToken, {
    roomSlug: data.roomSlug,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
  });
  if (!intent.ok) {
    return NextResponse.json({ error: intent.error }, { status: 400 });
  }

  const quoteResult = await computeServerBookingQuote({
    roomSlug: data.roomSlug,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    adults: data.adults,
    children: data.children,
    rooms: data.rooms,
    breakfast: Boolean(data.breakfast),
    airportPickup: Boolean(data.airportPickup),
    pickupVehicles: data.pickupVehicles,
  });

  if (!quoteResult.ok) {
    return NextResponse.json(
      { error: quoteResult.error || "Unable to price this stay" },
      { status: quoteResult.status || 400 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 503 }
    );
  }

  const room = await getRoomBySlug(data.roomSlug);
  if (!room) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }

  const wantsPickup = Boolean(data.airportPickup);
  const pickupTime =
    (data.pickupTime || data.flightArrivalTime || "").trim() || null;
  const pickupDate =
    (data.pickupDate || "").trim() ||
    (wantsPickup ? data.checkIn : "") ||
    null;

  const roomRecord = await db.room.upsert({
    where: { slug: room.slug },
    create: {
      slug: room.slug,
      name: room.name,
      category: room.category === "suite" ? "SUITE" : "ROOM",
      tagline: room.tagline,
      description: room.description.join("\n\n"),
      priceFrom: room.priceFrom,
      size: room.size,
      occupancy: room.occupancy,
      bed: room.bed,
      view: room.view,
      featured: room.featured,
      amenities: [...room.amenities],
      features: [...room.features],
    },
    update: {
      name: room.name,
      priceFrom: room.priceFrom,
      featured: room.featured,
      amenities: [...room.amenities],
      features: [...room.features],
    },
  });

  const intentMarker = `Intent:${intent.hash}`;
  const recent = await db.booking.findFirst({
    where: {
      paymentMethod: PAYMENT_METHOD_PAY_AT_HOTEL,
      notes: { contains: intentMarker },
      status: { in: ["PENDING", "CONFIRMED", "ON_HOLD"] },
      createdAt: { gte: new Date(Date.now() - IDEMPOTENCY_WINDOW_MS) },
    },
    include: { room: true },
  });

  if (recent) {
    return NextResponse.json({
      ok: true,
      bookingId: recent.id,
      reference: recent.reference,
      amount: Number(recent.totalAmount),
      currency: recent.paymentCurrency || "USD",
      paymentMethod: PAYMENT_METHOD_PAY_AT_HOTEL,
      paymentStatus: recent.paymentStatus,
      status: recent.status,
      reused: true,
    });
  }

  const freshQuote = await computeServerBookingQuote({
    roomSlug: data.roomSlug,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    adults: data.adults,
    children: data.children,
    rooms: data.rooms,
    breakfast: Boolean(data.breakfast),
    airportPickup: Boolean(data.airportPickup),
    pickupVehicles: data.pickupVehicles,
  });
  if (!freshQuote.ok) {
    return NextResponse.json(
      { error: freshQuote.error || "No Rooms Available" },
      { status: freshQuote.status || 409 }
    );
  }

  const reference = await generateMarloBookingId();
  const notesPayload = [
    buildBookingNotes({
      notes: data.notes,
      whatsapp: data.whatsapp,
      country: data.country,
      arrivalTime: data.arrivalTime,
      breakfast: Boolean(data.breakfast),
      airportPickup: wantsPickup,
      pickupVehicles: freshQuote.quote.pickupVehicles,
      pickupAmount: freshQuote.quote.pickupFee,
      flightNumber: data.flightNumber,
      pickupDate: pickupDate || undefined,
      pickupTime: pickupTime || undefined,
      pickupNotes: data.pickupNotes,
      paymentLabel: "PAY_AT_HOTEL",
    }),
    intentMarker,
  ].join("\n");

  const booking = await db.booking.create({
    data: {
      reference,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      adults: data.adults,
      children: data.children,
      rooms: data.rooms,
      promoCode: data.promoCode,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      country: data.country,
      breakfast: Boolean(data.breakfast),
      airportPickup: wantsPickup,
      pickupVehicles: wantsPickup ? freshQuote.quote.pickupVehicles : null,
      pickupAmount: wantsPickup ? freshQuote.quote.pickupFee : null,
      flightNumber: wantsPickup
        ? (data.flightNumber || "").trim() || null
        : null,
      pickupDate: wantsPickup ? pickupDate : null,
      pickupTime: wantsPickup ? pickupTime : null,
      pickupNotes: wantsPickup
        ? (data.pickupNotes || "").trim() || null
        : null,
      notes: notesPayload,
      totalAmount: freshQuote.quote.grandTotal,
      paymentStatus: "UNPAID",
      status: "PENDING",
      source: "ONLINE",
      paymentMethod: PAYMENT_METHOD_PAY_AT_HOTEL,
      paymentCurrency: "USD",
      roomId: roomRecord.id,
    },
  });

  void sendBookingEmails({
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
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
    totalAmount: freshQuote.quote.grandTotal,
    notes: booking.notes,
    airportPickup: booking.airportPickup,
    pickupVehicles: booking.pickupVehicles,
    pickupAmount: freshQuote.quote.pickupFee,
    flightNumber: booking.flightNumber,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    pickupNotes: booking.pickupNotes,
    createdAt: booking.createdAt,
    roomName: room.name,
    room: { name: room.name },
  }).catch(() => {
    /* Email failure must not create a second booking. */
  });

  return NextResponse.json({
    ok: true,
    bookingId: booking.id,
    reference: booking.reference,
    amount: freshQuote.quote.grandTotal,
    currency: "USD",
    paymentMethod: PAYMENT_METHOD_PAY_AT_HOTEL,
    paymentStatus: "UNPAID",
    status: "PENDING",
  });
}
