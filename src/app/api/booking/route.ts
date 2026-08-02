import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/content/rooms";
import { generateMarloBookingId } from "@/lib/booking-id";
import { sendBookingEmails } from "@/lib/booking-mail";
import { getDb } from "@/lib/db";
import { getAvailableCapacity } from "@/lib/admin/availability";
import { bookingRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking request", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const room = await getRoomBySlug(parsed.data.roomSlug);
  if (!room) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }

  if (room.inventory <= 0) {
    return NextResponse.json(
      { error: "Sold Out", message: "No Rooms Available" },
      { status: 409 }
    );
  }

  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);
  const roomsRequested = Math.max(1, parsed.data.rooms);
  const availability = await getAvailableCapacity(room.slug, checkIn, checkOut);
  if (roomsRequested > availability.available) {
    return NextResponse.json(
      { error: "Sold Out", message: "No Rooms Available" },
      { status: 409 }
    );
  }
  const reference = await generateMarloBookingId();
  const db = getDb();
  const notesText = (parsed.data.notes || "").trim() || "None";

  const notesPayload = [
    notesText,
    `WhatsApp: ${parsed.data.whatsapp}`,
    `Country: ${parsed.data.country}`,
    `Arrival: ${parsed.data.arrivalTime}`,
    `Breakfast: ${parsed.data.breakfast ? "Yes" : "No"}`,
    parsed.data.airportPickup
      ? `Airport pickup: Yes · ${parsed.data.pickupVehicles || 1} vehicle(s) · Flight ${parsed.data.flightNumber || "—"} · Kathmandu arrival ${parsed.data.flightArrivalTime || "—"}`
      : "Airport pickup: No",
    parsed.data.billingName
      ? `Billing: ${parsed.data.billingName}, ${parsed.data.billingCountry}, ${parsed.data.billingCity || ""} ${parsed.data.billingPostalCode || ""}, ${parsed.data.billingAddress}`
      : null,
    parsed.data.paymentIntent
      ? `Payment: ${parsed.data.paymentIntent}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (db) {
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

    await db.booking.create({
      data: {
        reference,
        checkIn,
        checkOut,
        adults: parsed.data.adults,
        children: parsed.data.children,
        rooms: roomsRequested,
        promoCode: parsed.data.promoCode,
        guestName: parsed.data.guestName,
        guestEmail: parsed.data.guestEmail,
        guestPhone: parsed.data.guestPhone,
        notes: notesPayload,
        totalAmount: parsed.data.totalAmount ?? null,
        paymentStatus: "UNPAID",
        status: "PENDING",
        source: "ONLINE",
        roomId: roomRecord.id,
      },
    });
  }

  await sendBookingEmails({
    reference,
    guestName: parsed.data.guestName,
    guestEmail: parsed.data.guestEmail,
    guestPhone: parsed.data.guestPhone,
    whatsapp: parsed.data.whatsapp,
    country: parsed.data.country,
    arrivalTime: parsed.data.arrivalTime,
    notes: notesText,
    roomName: room.name,
    checkIn: parsed.data.checkIn,
    checkOut: parsed.data.checkOut,
    adults: parsed.data.adults,
    children: parsed.data.children,
    rooms: roomsRequested,
    breakfast: Boolean(parsed.data.breakfast),
    totalAmount: parsed.data.totalAmount,
  });

  return NextResponse.json({ ok: true, reference });
}
