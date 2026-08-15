import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import { assertSameOrigin } from "@/lib/orbit/auth";

const authorized = async (request: Request, mutate = false) =>
  Boolean(await getAdminSession()) && (!mutate || (await assertSameOrigin(request)));

function serialize<
  T extends {
    checkIn: Date;
    checkOut: Date;
    createdAt: Date;
    updatedAt: Date;
    totalAmount: unknown;
    pickupAmount?: unknown;
    confirmationEmailSentAt?: Date | null;
    paidAt?: Date | null;
  },
>(booking: T) {
  return {
    ...booking,
    totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount),
    pickupAmount:
      booking.pickupAmount === null || booking.pickupAmount === undefined
        ? null
        : Number(booking.pickupAmount),
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    paidAt: booking.paidAt ? booking.paidAt.toISOString() : null,
    confirmationEmailSentAt: booking.confirmationEmailSentAt
      ? booking.confirmationEmailSentAt.toISOString()
      : null,
  };
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ bookings: [] });
  const bookings = await db.booking.findMany({
    where: { source: { not: "OFFLINE" } },
    include: { room: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bookings: bookings.map(serialize) });
}

/** Supports a small bulk operation for the reservations console. */
export async function PATCH(request: Request) {
  if (!(await authorized(request, true))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { ids?: unknown; status?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];
  const allowed = ["PENDING", "CONFIRMED", "ON_HOLD", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW", "REFUNDED"];
  if (!ids.length || typeof body?.status !== "string" || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Booking ids and a valid status are required." }, { status: 400 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const result = await db.booking.updateMany({
    where: { id: { in: ids }, source: { not: "OFFLINE" } },
    data: { status: body.status as never },
  });
  return NextResponse.json({ updated: result.count });
}
