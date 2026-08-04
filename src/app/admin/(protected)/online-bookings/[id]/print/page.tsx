import { notFound } from "next/navigation";
import { BookingPrintTrigger } from "@/components/admin/booking-print-trigger";
import { BookingConfirmationDocument } from "@/components/booking/booking-confirmation-document";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookingPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const booking = db ? await db.booking.findUnique({ where: { id: (await params).id }, include: { room: { select: { name: true } } } }) : null;
  if (!booking || booking.source === "OFFLINE") notFound();
  return (
    <>
      <BookingPrintTrigger />
      <BookingConfirmationDocument {...booking} totalAmount={booking.totalAmount == null ? null : Number(booking.totalAmount)} />
    </>
  );
}
