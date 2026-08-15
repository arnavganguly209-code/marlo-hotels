import { NextResponse } from "next/server";
import { z } from "zod";
import { getRoomBySlug } from "@/content/rooms";
import { generateMarloBookingId } from "@/lib/booking-id";
import {
  buildBookingNotes,
  computeServerBookingQuote,
} from "@/lib/booking-total-server";
import { getDb } from "@/lib/db";
import {
  createPayPalOrder,
  paypalConfigured,
} from "@/lib/paypal";

const createOrderSchema = z.object({
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.number().int().min(1).max(8),
  children: z.number().int().min(0).max(10),
  rooms: z.number().int().min(1).max(5),
  roomSlug: z.string().min(1),
  promoCode: z.string().optional(),
  guestName: z.string().min(2),
  guestEmail: z.email(),
  guestPhone: z.string().min(5),
  whatsapp: z.string().min(5),
  country: z.string().min(2),
  arrivalTime: z.string().min(1),
  notes: z.string().optional(),
  breakfast: z.boolean().optional(),
  airportPickup: z.boolean().optional(),
  pickupVehicles: z.number().int().min(1).max(3).optional(),
  flightNumber: z.string().optional(),
  flightArrivalTime: z.string().optional(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  pickupNotes: z.string().optional(),
});

export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid PayPal order request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
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
      { error: quoteResult.error, message: quoteResult.error },
      { status: quoteResult.status }
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

  const quote = quoteResult.quote;
  const reference = await generateMarloBookingId();
  const wantsPickup = Boolean(data.airportPickup);
  const pickupTime =
    (data.pickupTime || data.flightArrivalTime || "").trim() || null;
  const pickupDate =
    (data.pickupDate || "").trim() ||
    (wantsPickup ? data.checkIn : "") ||
    null;
  const notesPayload = buildBookingNotes({
    notes: data.notes,
    whatsapp: data.whatsapp,
    country: data.country,
    arrivalTime: data.arrivalTime,
    breakfast: Boolean(data.breakfast),
    airportPickup: wantsPickup,
    pickupVehicles: quote.pickupVehicles,
    pickupAmount: quote.pickupFee,
    flightNumber: data.flightNumber,
    pickupDate: pickupDate || undefined,
    pickupTime: pickupTime || undefined,
    pickupNotes: data.pickupNotes,
    paymentLabel: "PAYPAL_PENDING",
  });

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
      pickupVehicles: wantsPickup ? quote.pickupVehicles : null,
      pickupAmount: wantsPickup ? quote.pickupFee : null,
      flightNumber: wantsPickup
        ? (data.flightNumber || "").trim() || null
        : null,
      pickupDate: wantsPickup ? pickupDate : null,
      pickupTime: wantsPickup ? pickupTime : null,
      pickupNotes: wantsPickup
        ? (data.pickupNotes || "").trim() || null
        : null,
      notes: notesPayload,
      totalAmount: quote.grandTotal,
      paymentStatus: "PENDING",
      status: "PENDING",
      source: "ONLINE",
      paymentMethod: "PAYPAL",
      paymentCurrency: "USD",
      roomId: roomRecord.id,
    },
  });

  try {
    const order = await createPayPalOrder({
      amount: quote.grandTotal,
      currency: "USD",
      bookingId: booking.id,
      reference: booking.reference,
      description: `Marlo Hotels · ${quote.roomName} · ${booking.reference}`,
    });

    await db.booking.update({
      where: { id: booking.id },
      data: { paypalOrderId: order.id },
    });

    return NextResponse.json({
      orderId: order.id,
      bookingId: booking.id,
      reference: booking.reference,
      amount: quote.grandTotal,
      currency: "USD",
    });
  } catch (error) {
    await db.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
        notes: `${notesPayload}\nPayPal order creation failed`,
      },
    });
    const message =
      error instanceof Error ? error.message : "PayPal order creation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
