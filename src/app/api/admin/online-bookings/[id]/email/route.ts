import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { generateBookingConfirmationPdf } from "@/lib/booking-confirmation-pdf";
import { sendBookingConfirmationReady } from "@/lib/booking-mail";
import { getDb } from "@/lib/db";
import { assertSameOrigin } from "@/lib/orbit/auth";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  if (!(await getAdminSession()) || !(await assertSameOrigin(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const booking = await db.booking.findUnique({ where: { id: (await params).id }, include: { room: { select: { name: true } } } });
  if (!booking || booking.source === "OFFLINE") return NextResponse.json({ error: "Online booking not found" }, { status: 404 });
  const pdf = await generateBookingConfirmationPdf({ ...booking, totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount) });
  const result = await sendBookingConfirmationReady({
    booking: { ...booking, totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount), roomName: booking.room.name },
    pdf: { filename: `marlo-confirmation-${booking.reference}.pdf`, content: pdf, contentType: "application/pdf" },
  });
  return NextResponse.json(result);
}
