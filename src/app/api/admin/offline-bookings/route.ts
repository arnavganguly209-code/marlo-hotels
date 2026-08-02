import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/content/rooms";
import { getAdminSession } from "@/lib/admin/auth";
import { getAvailableCapacity, getAvailablePhysicalRooms, markPhysicalRoomStatus } from "@/lib/admin/availability";
import { generateMarloBookingId } from "@/lib/booking-id";
import { getDb } from "@/lib/db";
import { syncCategoryInventory } from "@/lib/admin/physical-rooms";
import { OFFLINE_BOOKING_STATUSES, OFFLINE_PAYMENT_STATUSES } from "@/lib/admin/pms-public";
import { assertSameOrigin } from "@/lib/orbit/auth";

async function authorized(request: Request, mutate = false) { return Boolean(await getAdminSession()) && (!mutate || (await assertSameOrigin(request))); }
function serialize<T extends { checkIn: Date; checkOut: Date; createdAt: Date; updatedAt: Date; totalAmount: unknown }>(booking: T) {
  return { ...booking, totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount), checkIn: booking.checkIn.toISOString(), checkOut: booking.checkOut.toISOString(), createdAt: booking.createdAt.toISOString(), updatedAt: booking.updatedAt.toISOString() };
}
async function upsertRoom(slug: string) {
  const room = await getRoomBySlug(slug); if (!room) return null;
  const db = getDb(); if (!db) return null;
  return db.room.upsert({ where: { slug }, create: { slug, name: room.name, category: room.category === "suite" ? "SUITE" : "ROOM", tagline: room.tagline, description: room.description.join("\n\n"), priceFrom: room.priceFrom, size: room.size, occupancy: room.occupancy, bed: room.bed, view: room.view, featured: room.featured, amenities: [...room.amenities], features: [...room.features] }, update: { name: room.name, priceFrom: room.priceFrom, featured: room.featured, amenities: [...room.amenities], features: [...room.features] } });
}
export async function GET(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); if (!db) return NextResponse.json({ bookings: [] });
  const bookings = await db.booking.findMany({ where: { source: "OFFLINE" }, include: { room: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ bookings: bookings.map(serialize) });
}
export async function POST(request: Request) {
  if (!(await authorized(request, true))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const guestName = typeof body?.guestName === "string" ? body.guestName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const slug = typeof body?.roomCategorySlug === "string" ? body.roomCategorySlug.trim() : "";
  const checkIn = typeof body?.checkIn === "string" ? new Date(body.checkIn) : null;
  const checkOut = typeof body?.checkOut === "string" ? new Date(body.checkOut) : null;
  const rooms = Math.max(1, Number(body?.rooms) || 1);
  if (!guestName || !email || !phone || !slug || !checkIn || !checkOut || Number.isNaN(+checkIn) || Number.isNaN(+checkOut) || checkOut <= checkIn) return NextResponse.json({ error: "Guest, contact, category and valid stay dates are required." }, { status: 400 });
  const room = await upsertRoom(slug); if (!room) return NextResponse.json({ error: "Unknown Marlo room category." }, { status: 400 });
  const capacity = await getAvailableCapacity(slug, checkIn, checkOut);
  if (rooms > capacity.available) return NextResponse.json({ error: "No rooms available for the selected dates." }, { status: 409 });
  const number =
    typeof body?.physicalRoomNumber === "string" && body.physicalRoomNumber.trim()
      ? body.physicalRoomNumber.trim().toUpperCase()
      : "";
  if (!number) {
    return NextResponse.json(
      { error: "Physical room number is required." },
      { status: 400 }
    );
  }
  const availableRooms = await getAvailablePhysicalRooms(slug, checkIn, checkOut);
  if (!availableRooms.some((item) => item.number.toUpperCase() === number)) {
    return NextResponse.json(
      { error: "Selected physical room is unavailable." },
      { status: 409 }
    );
  }
  const status = OFFLINE_BOOKING_STATUSES.includes(body?.bookingStatus as never)
    ? (body?.bookingStatus as string)
    : "CONFIRMED";
  const paymentStatus = OFFLINE_PAYMENT_STATUSES.includes(
    body?.paymentStatus as never
  )
    ? (body?.paymentStatus as string)
    : "OFFLINE";
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  // Prevent duplicate active booking for the same physical room + overlapping stay.
  const duplicate = await db.booking.findFirst({
    where: {
      roomId: room.id,
      physicalRoomNumber: number,
      status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { id: true, reference: true },
  });
  if (duplicate) {
    return NextResponse.json(
      {
        error: `Room ${number} is already booked (${duplicate.reference}) for overlapping dates.`,
      },
      { status: 409 }
    );
  }

  const booking = await db.booking.create({
    data: {
      reference: await generateMarloBookingId(),
      source: "OFFLINE",
      status: status as never,
      paymentStatus: paymentStatus as never,
      checkIn,
      checkOut,
      adults: Math.max(1, Number(body?.adults) || 1),
      children: Math.max(0, Number(body?.children) || 0),
      rooms,
      guestName,
      guestEmail: email,
      guestPhone: phone,
      country: typeof body?.country === "string" ? body.country.trim() : null,
      breakfast: Boolean(body?.breakfast),
      physicalRoomNumber: number,
      totalAmount:
        typeof body?.totalAmount === "number"
          ? body.totalAmount
          : Number(body?.totalAmount) || null,
      notes: typeof body?.notes === "string" ? body.notes.trim() : null,
      internalRemarks:
        typeof body?.internalRemarks === "string"
          ? body.internalRemarks.trim()
          : null,
      createdBy: typeof body?.createdBy === "string" ? body.createdBy.trim() : null,
      roomId: room.id,
    },
    include: { room: { select: { name: true, slug: true } } },
  });
  if (status === "CONFIRMED" || status === "CHECKED_IN") {
    await markPhysicalRoomStatus(slug, number, "OCCUPIED");
  }
  await syncCategoryInventory(slug);
  revalidatePath("/admin/offline-bookings");
  revalidatePath("/admin/online-bookings");
  revalidatePath("/admin");
  revalidatePath("/rooms");
  return NextResponse.json({ booking: serialize(booking) }, { status: 201 });
}
