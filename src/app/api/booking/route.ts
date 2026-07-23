import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/content/rooms";
import { getDb } from "@/lib/db";
import { bookingRequestSchema } from "@/lib/validators";

function generateReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `MRL-${code}`;
}

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

  const reference = generateReference();
  const db = getDb();
  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);
  const roomsRequested = Math.max(1, parsed.data.rooms);

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

    // Active bookings overlapping the requested stay consume inventory.
    const overlapping = await db.booking.findMany({
      where: {
        roomId: roomRecord.id,
        status: { in: ["PENDING", "CONFIRMED"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { rooms: true },
    });
    const bookedUnits = overlapping.reduce(
      (sum, item) => sum + Math.max(1, item.rooms),
      0
    );
    if (bookedUnits + roomsRequested > room.inventory) {
      return NextResponse.json(
        {
          error: "Sold Out",
          message: "No Rooms Available",
          inventory: room.inventory,
          booked: bookedUnits,
        },
        { status: 409 }
      );
    }

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
        notes: parsed.data.notes,
        roomId: roomRecord.id,
      },
    });
  }

  return NextResponse.json({ ok: true, reference });
}
