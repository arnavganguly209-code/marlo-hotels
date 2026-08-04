import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { generateBookingConfirmationPdf } from "@/lib/booking-confirmation-pdf";
import { getDb } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const booking = await db.booking.findUnique({ where: { id: (await params).id }, include: { room: { select: { name: true } } } });
  if (!booking || booking.source === "OFFLINE") return NextResponse.json({ error: "Online booking not found" }, { status: 404 });
  const pdf = await generateBookingConfirmationPdf({ ...booking, totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount) });
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${
        new URL(_request.url).searchParams.get("mode") === "inline"
          ? "inline"
          : "attachment"
      }; filename="marlo-confirmation-${booking.reference}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
