import { notFound } from "next/navigation";
import { BookingPrintTrigger } from "@/components/admin/booking-print-trigger";
import { getDb } from "@/lib/db";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const date = (value: Date) => new Intl.DateTimeFormat("en", { day: "2-digit", month: "long", year: "numeric" }).format(value);

export default async function BookingPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const db = getDb();
  const booking = db ? await db.booking.findUnique({ where: { id: (await params).id }, include: { room: { select: { name: true } } } }) : null;
  if (!booking || booking.source === "OFFLINE") notFound();
  const nights = Math.max(0, Math.round((+booking.checkOut - +booking.checkIn) / 86_400_000));
  const field = (label: string, value: string) => <div><dt>{label}</dt><dd>{value || "—"}</dd></div>;
  return (
    <main className="print-sheet">
      <BookingPrintTrigger />
      <style>{`@page { size: A4 portrait; margin: 15mm; } @media print { body { background:white!important; } .print-sheet { box-shadow:none!important;margin:0!important; } }`}</style>
      <header><div><p>MARLO HOTELS</p><small>STAY BEYOND EXTRAORDINARY</small></div><address>{siteConfig.contact.address}<br />{siteConfig.contact.reservationsEmail}</address></header>
      <section className="title"><div><h1>Booking Confirmation</h1><span>BOOKING ID · {booking.reference}</span></div><strong>{booking.status.replaceAll("_", " ")}</strong></section>
      <section><h2>Guest details</h2><dl>{field("Guest name", booking.guestName)}{field("Email", booking.guestEmail)}{field("Telephone", booking.guestPhone)}{field("Country", booking.country || "")}</dl></section>
      <section><h2>Stay at Marlo</h2><dl>{field("Check-in", `${date(booking.checkIn)} · ${siteConfig.hours.checkIn}`)}{field("Check-out", `${date(booking.checkOut)} · ${siteConfig.hours.checkOut}`)}{field("Accommodation", booking.room.name)}{field("Room / guests", `${booking.physicalRoomNumber || "To be assigned"} · ${nights} night${nights === 1 ? "" : "s"} · ${booking.adults} adults${booking.children ? `, ${booking.children} children` : ""}`)}</dl></section>
      <section className="payment"><div><h2>Payment summary</h2><p>Breakfast: {booking.breakfast ? "Included" : "Not included"} · {booking.rooms} room{booking.rooms === 1 ? "" : "s"}<br />Payment: {booking.paymentStatus === "UNPAID" ? "Pending" : booking.paymentStatus}</p></div><div><small>GRAND TOTAL</small><strong>{booking.totalAmount === null ? "Confirmed on request" : new Intl.NumberFormat("en-US", { style: "currency", currency: siteConfig.currency }).format(Number(booking.totalAmount))}</strong></div></section>
      <section><h2>Arrival & policies</h2><p>Check-in from {siteConfig.hours.checkIn}; check-out by {siteConfig.hours.checkOut}. Please present valid identification on arrival. Cancellations and amendments are subject to your booking terms.</p></section>
      <section className="signature"><div className="qr">QR</div><div>Present this confirmation at reception.<br /><span>Guest signature</span><i /></div></section>
      <footer>Thank you for choosing Marlo Hotels.<br /><small>MARLO HOTELS · KATHMANDU · marlohotels.com</small></footer>
      <style>{`.print-sheet{max-width:794px;min-height:1123px;margin:32px auto;padding:56px;background:#fffdf8;color:#0c1a18;font-family:Georgia,serif;box-shadow:0 10px 30px #0002}.print-sheet header{display:flex;justify-content:space-between;border-top:4px solid #c9963f;padding-top:22px}.print-sheet header p{margin:0;color:#c9963f;font:bold 15px Arial;letter-spacing:3px}.print-sheet small,.print-sheet dt{font:700 10px Arial;color:#c9963f;letter-spacing:1.5px}.print-sheet address{font:11px Arial;color:#657069;font-style:normal;line-height:1.6}.title{display:flex;justify-content:space-between;align-items:end;margin:35px 0 20px;border-bottom:1px solid #ded5c6;padding-bottom:18px}.title h1{margin:0 0 10px;font-size:31px;font-weight:400}.title span{font:700 10px Arial;color:#c9963f;letter-spacing:1px}.title strong{font:700 11px Arial}.print-sheet section{margin:24px 0}.print-sheet h2{font:700 14px Arial;margin:0 0 14px}.print-sheet dl{display:grid;grid-template-columns:1fr 1fr;gap:16px 35px;margin:0}.print-sheet dt{margin-bottom:6px}.print-sheet dd{margin:0;border-bottom:1px solid #ded5c6;padding-bottom:7px;font:13px Arial}.payment{display:flex;justify-content:space-between;background:#f7f2e8;padding:20px}.payment p,.print-sheet section>p{font:12px Arial;color:#657069;line-height:1.7}.payment strong{display:block;font:700 17px Arial;margin-top:8px}.signature{display:flex;gap:18px;align-items:center}.qr{width:56px;height:56px;border:1px solid #c9963f;display:grid;place-items:center;color:#c9963f;font:bold 11px Arial}.signature div:last-child{font:12px Arial;color:#657069;flex:1}.signature span{font:bold 9px Arial;color:#c9963f;display:inline-block;margin-top:14px}.signature i{display:inline-block;width:230px;border-bottom:1px solid #aaa;margin-left:12px}footer{margin-top:42px;font-size:14px}footer small{display:inline-block;margin-top:8px}`}</style>
    </main>
  );
}
