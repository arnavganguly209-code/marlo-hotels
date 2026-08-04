import { notFound } from "next/navigation";
import { BookingConfirmationDocument } from "@/components/booking/booking-confirmation-document";
import { BookingPrintTrigger } from "@/components/admin/booking-print-trigger";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerBookingPrintPage({ params }: { params: Promise<{ reference: string }> }) {
  const db = getDb();
  const booking = db ? await db.booking.findUnique({ where: { reference: (await params).reference }, include: { room: { select: { name: true } } } }) : null;
  if (!booking || booking.source === "OFFLINE") notFound();
  return <><BookingPrintTrigger /><BookingConfirmationDocument {...booking} totalAmount={booking.totalAmount == null ? null : Number(booking.totalAmount)} /></>;
}
