import { NextResponse } from "next/server";
import { generateBookingConfirmationPdf } from "@/lib/booking-confirmation-pdf";
import { getDb } from "@/lib/db";

type Context = { params: Promise<{ reference: string }> };

export async function GET(request: Request, { params }: Context) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const reference = (await params).reference;
  const booking = await db.booking.findUnique({ where: { reference }, include: { room: { select: { name: true } } } });
  if (!booking || booking.source === "OFFLINE") return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const pdf = await generateBookingConfirmationPdf({ ...booking, totalAmount: booking.totalAmount == null ? null : Number(booking.totalAmount) });
  const mode = new URL(request.url).searchParams.get("mode");
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${mode === "download" ? "attachment" : "inline"}; filename="marlo-confirmation-${booking.reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
