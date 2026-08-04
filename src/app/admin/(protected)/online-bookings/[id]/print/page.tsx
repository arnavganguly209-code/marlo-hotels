import { notFound } from "next/navigation";
import { BookingPdfPrint } from "@/components/booking/booking-pdf-print";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookingPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const db = getDb();
  const booking = db
    ? await db.booking.findUnique({
        where: { id },
        select: { id: true, source: true },
      })
    : null;
  if (!booking || booking.source === "OFFLINE") notFound();

  return (
    <BookingPdfPrint
      pdfUrl={`/api/admin/online-bookings/${encodeURIComponent(id)}/pdf?mode=inline`}
    />
  );
}
