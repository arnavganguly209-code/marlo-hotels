import { NextResponse } from "next/server";
import { generateBookingConfirmationPdf } from "@/lib/booking-confirmation-pdf";
import { toBookingConfirmationPdfPayload } from "@/lib/booking-pdf-payload";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference")?.trim();
  if (!reference) return NextResponse.json({ error: "Booking reference is required" }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const booking = await db.booking.findUnique({ where: { reference }, include: { room: { select: { name: true } } } });
  if (!booking || booking.source === "OFFLINE") return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const pdf = await generateBookingConfirmationPdf(toBookingConfirmationPdfPayload(booking));
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${searchParams.get("mode") === "download" ? "attachment" : "inline"}; filename="marlo-confirmation-${booking.reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
