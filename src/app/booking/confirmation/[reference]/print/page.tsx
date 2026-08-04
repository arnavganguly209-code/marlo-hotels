import { notFound } from "next/navigation";
import { BookingPdfPrint } from "@/components/booking/booking-pdf-print";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CustomerBookingPrintPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const reference = (await params).reference;
  const db = getDb();
  const booking = db
    ? await db.booking.findUnique({
        where: { reference },
        select: { id: true, source: true },
      })
    : null;
  if (!booking || booking.source === "OFFLINE") notFound();

  return (
    <BookingPdfPrint
      pdfUrl={`/api/booking/${encodeURIComponent(reference)}/pdf?mode=inline`}
    />
  );
}
