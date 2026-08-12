import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { BOOKING_OPS_STATUSES, PAYMENT_OPS_STATUSES } from "@/lib/admin/booking-ops";
import { getAdminSession } from "@/lib/admin/auth";
import { generateBookingConfirmationPdf } from "@/lib/booking-confirmation-pdf";
import { sendConfirmedBookingEmails } from "@/lib/booking-mail";
import { getDb } from "@/lib/db";
import { assertSameOrigin } from "@/lib/orbit/auth";

type Context = { params: Promise<{ id: string }> };
const authorized = async (request: Request, mutate = false) =>
  Boolean(await getAdminSession()) && (!mutate || (await assertSameOrigin(request)));
const isOnline = (source: string) => source !== "OFFLINE";
function serialize<
  T extends {
    checkIn: Date;
    checkOut: Date;
    createdAt: Date;
    updatedAt: Date;
    totalAmount: unknown;
    confirmationEmailSentAt?: Date | null;
  },
>(b: T) {
  return {
    ...b,
    totalAmount: b.totalAmount === null ? null : Number(b.totalAmount),
    checkIn: b.checkIn.toISOString(),
    checkOut: b.checkOut.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    confirmationEmailSentAt: b.confirmationEmailSentAt
      ? b.confirmationEmailSentAt.toISOString()
      : null,
  };
}

export async function GET(request: Request, { params }: Context) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const booking = await db.booking.findUnique({ where: { id: (await params).id }, include: { room: { select: { name: true, slug: true } } } });
  if (!booking || !isOnline(booking.source)) return NextResponse.json({ error: "Online booking not found" }, { status: 404 });
  return NextResponse.json({ booking: serialize(booking) });
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request, true))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const id = (await params).id;
  const existing = await db.booking.findUnique({ where: { id }, include: { room: { select: { name: true, slug: true } } } });
  if (!existing || !isOnline(existing.source)) return NextResponse.json({ error: "Online booking not found" }, { status: 404 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const status = BOOKING_OPS_STATUSES.includes(body?.status as never)
    ? (body?.status as string)
    : existing.status;
  const requestedPayment =
    typeof body?.paymentStatus === "string" && body.paymentStatus === "UNPAID"
      ? "UNPAID"
      : body?.paymentStatus;
  const paymentStatus = PAYMENT_OPS_STATUSES.includes(requestedPayment as never)
    ? (requestedPayment as string)
    : existing.paymentStatus;
  const stringField = (key: string, fallback: string | null) =>
    typeof body?.[key] === "string" ? (body[key] as string).trim() || null : fallback;

  const becameConfirmed =
    status === "CONFIRMED" && existing.status !== "CONFIRMED";

  const booking = await db.booking.update({
    where: { id },
    data: {
      status: status as never,
      paymentStatus: paymentStatus as never,
      guestName: stringField("guestName", existing.guestName) || existing.guestName,
      guestEmail: stringField("guestEmail", existing.guestEmail) || existing.guestEmail,
      guestPhone: stringField("guestPhone", existing.guestPhone) || existing.guestPhone,
      country: stringField("country", existing.country),
      physicalRoomNumber: stringField("physicalRoomNumber", existing.physicalRoomNumber),
      notes: stringField("notes", existing.notes),
      internalRemarks: stringField("internalRemarks", existing.internalRemarks),
    },
    include: { room: { select: { name: true, slug: true } } },
  });
  revalidatePath("/admin/online-bookings");

  let email: { sent: boolean; reason?: string } | undefined;
  // Create-time mail already covers most bookings. On first admin confirm (or
  // explicit sendEmail), attempt again — dedupe skips if already delivered.
  const shouldSend = becameConfirmed || body?.sendEmail === true;

  if (shouldSend) {
    const pdf = await generateBookingConfirmationPdf({
      ...booking,
      totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount),
    });
    email = await sendConfirmedBookingEmails(
      {
        ...booking,
        totalAmount:
          booking.totalAmount === null ? null : Number(booking.totalAmount),
      },
      {
        force: body?.forceEmail === true,
        pdf: {
          filename: `Marlo-Hotels-Booking-${booking.reference}.pdf`,
          content: pdf,
          contentType: "application/pdf",
        },
      }
    );
  }

  const refreshed = await db.booking.findUnique({
    where: { id },
    include: { room: { select: { name: true, slug: true } } },
  });
  return NextResponse.json({
    booking: serialize(refreshed || booking),
    email,
  });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorized(request, true))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const id = (await params).id;
  const existing = await db.booking.findUnique({ where: { id } });
  if (!existing || !isOnline(existing.source)) return NextResponse.json({ error: "Online booking not found" }, { status: 404 });
  await db.booking.delete({ where: { id } });
  revalidatePath("/admin/online-bookings");
  return NextResponse.json({ ok: true });
}
