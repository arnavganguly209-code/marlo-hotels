import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getAvailablePhysicalRooms, markPhysicalRoomStatus } from "@/lib/admin/availability";
import { getDb } from "@/lib/db";
import { OFFLINE_BOOKING_STATUSES, OFFLINE_PAYMENT_STATUSES } from "@/lib/admin/pms-public";
import { assertSameOrigin } from "@/lib/orbit/auth";
type Context = { params: Promise<{ id: string }> };
const authorized = async (request: Request) => Boolean(await getAdminSession()) && (await assertSameOrigin(request));
function serialize<T extends { checkIn: Date; checkOut: Date; createdAt: Date; updatedAt: Date; totalAmount: unknown }>(b: T) {
  return { ...b, totalAmount: b.totalAmount === null ? null : Number(b.totalAmount), checkIn: b.checkIn.toISOString(), checkOut: b.checkOut.toISOString(), createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString() };
}
export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb(); if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const existing = await db.booking.findUnique({ where: { id }, include: { room: { select: { slug: true } } } });
  if (!existing || existing.source !== "OFFLINE") return NextResponse.json({ error: "Offline booking not found" }, { status: 404 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const status = OFFLINE_BOOKING_STATUSES.includes(body?.status as never) ? body?.status as string : existing.status;
  const paymentStatus = OFFLINE_PAYMENT_STATUSES.includes(body?.paymentStatus as never) ? body?.paymentStatus as string : existing.paymentStatus;
  const number = typeof body?.physicalRoomNumber === "string" ? body.physicalRoomNumber.trim().toUpperCase() || null : existing.physicalRoomNumber;
  if (number && number !== existing.physicalRoomNumber && !(await getAvailablePhysicalRooms(existing.room.slug, existing.checkIn, existing.checkOut, id)).some((room) => room.number.toUpperCase() === number)) return NextResponse.json({ error: "Selected physical room is unavailable." }, { status: 409 });
  const booking = await db.booking.update({
    where: { id },
    data: {
      status: status as never,
      paymentStatus: paymentStatus as never,
      physicalRoomNumber: number,
      notes: typeof body?.notes === "string" ? body.notes.trim() : existing.notes,
      internalRemarks:
        typeof body?.internalRemarks === "string"
          ? body.internalRemarks.trim()
          : existing.internalRemarks,
    },
    include: { room: { select: { name: true, slug: true } } },
  });
  if (
    existing.physicalRoomNumber &&
    (number !== existing.physicalRoomNumber ||
      status === "CANCELLED" ||
      status === "CHECKED_OUT")
  ) {
    await markPhysicalRoomStatus(
      existing.room.slug,
      existing.physicalRoomNumber,
      "AVAILABLE"
    );
  }
  if (number && (status === "CONFIRMED" || status === "CHECKED_IN")) {
    await markPhysicalRoomStatus(existing.room.slug, number, "OCCUPIED");
  }
  revalidatePath("/admin/offline-bookings");
  revalidatePath("/admin/online-bookings");
  revalidatePath("/admin");
  revalidatePath("/rooms");
  return NextResponse.json({ booking: serialize(booking) });
}
export async function DELETE(request: Request, context: Context) {
  return PATCH(new Request(request.url, { method: "PATCH", headers: request.headers, body: JSON.stringify({ status: "CANCELLED" }) }), context);
}
