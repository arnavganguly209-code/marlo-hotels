import { nightsBetween, type BookingConfirmationPdfPayload } from "@/lib/booking-confirmation-pdf";
import { siteConfig } from "@/lib/site";

export type BookingConfirmationDocumentProps = BookingConfirmationPdfPayload;

const date = (value: Date | string) =>
  new Intl.DateTimeFormat("en", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
const amount = (value?: number | null) =>
  value == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: siteConfig.currency }).format(value);
const status = (value: string) => value.replaceAll("_", " ");

export function BookingConfirmationDocument(booking: BookingConfirmationDocumentProps) {
  const item = (label: string, value: string) => <div><dt>{label}</dt><dd>{value || "—"}</dd></div>;
  const total = booking.totalAmount == null ? "Confirmed on request" : amount(booking.totalAmount);
  return (
    <main className="booking-confirmation-document">
      <header>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="logo-img" src="/images/brand/logo.png" alt="Marlo Hotels" />
        <h1>MARLO HOTELS</h1>
        <p>{siteConfig.tagline}</p>
        <small>
          {siteConfig.contact.address}<br />
          {siteConfig.contact.phone} · {siteConfig.contact.reservationsEmail}<br />
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </small>
      </header>
      <div className="document-title"><h2>Booking Confirmation</h2><span>BOOKING NUMBER · {booking.reference}</span></div>
      <DocumentSection title="Booking Information">{item("Booking Number", booking.reference)}{item("Booking Date", date(booking.createdAt || new Date()))}{item("Booking Status", status(booking.status))}{item("Confirmation Status", booking.confirmationStatus || (booking.status === "CONFIRMED" ? "Confirmed" : "Pending Confirmation"))}</DocumentSection>
      <DocumentSection title="Guest Information">{item("Name", booking.guestName)}{item("Email", booking.guestEmail)}{item("Phone", booking.guestPhone)}{item("Country", booking.country || "—")}</DocumentSection>
      <DocumentSection title="Stay Information">{item("Room Category", booking.room.name)}{item("Room Number", booking.physicalRoomNumber || "To be assigned")}{item("Guests", `${booking.adults} adult${booking.adults === 1 ? "" : "s"}`)}{item("Children", String(booking.children))}{item("Check-in", date(booking.checkIn))}{item("Check-out", date(booking.checkOut))}{item("Nights", `${nightsBetween(booking.checkIn, booking.checkOut)} night${nightsBetween(booking.checkIn, booking.checkOut) === 1 ? "" : "s"}`)}{item("Breakfast Included", booking.breakfast ? "Yes" : "No")}</DocumentSection>
      <DocumentSection title="Airport Pickup">{item("Airport Pickup", booking.airportPickup ? "Yes" : "No")}{item("Vehicles", booking.airportPickup ? (booking.pickupVehiclesLabel || String(booking.pickupVehicles || "—")) : "—")}{item("Pickup Charge", booking.airportPickup ? amount(booking.pickupAmount) : "—")}{item("Flight Number", booking.airportPickup ? (booking.flightNumber || "—") : "—")}{item("Pickup Date", booking.airportPickup ? (booking.pickupDate || "—") : "—")}{item("Pickup Time", booking.airportPickup ? (booking.pickupTime || "—") : "—")}{item("Pickup Notes", booking.airportPickup ? (booking.pickupNotes || "—") : "—")}{item("Special Request", booking.specialRequest || booking.notes || "—")}</DocumentSection>
      <DocumentSection title="Payment Information">{item("Room Stay", amount(booking.roomRate))}{item("Airport Pickup", amount(booking.pickupAmount ?? booking.additionalCharges ?? 0))}{item("Grand Total", total)}{item("Payment Status", status(booking.paymentStatus))}{item("Payment Method", booking.paymentMethod || "Website / Pay on arrival")}</DocumentSection>
      <DocumentSection title="Hotel Information">{item("Check-in Time", siteConfig.hours.checkIn)}{item("Check-out Time", siteConfig.hours.checkOut)}{item("Cancellation Policy", "Cancellations and amendments are subject to your booking terms.")}{item("Important Hotel Notes", "Please present valid identification on arrival. Our team is pleased to welcome you.")}</DocumentSection>
      <footer>Thank you for choosing Marlo Hotels.<small>{siteConfig.name} · {siteConfig.url.replace(/^https?:\/\//, "")} · {siteConfig.contact.reservationsEmail}<br />{siteConfig.contact.phone} · {siteConfig.contact.address}</small></footer>
      <style>{`
        .booking-confirmation-document{width:210mm;min-height:297mm;box-sizing:border-box;margin:24px auto;padding:14mm;background:#fffdf8;color:#0c1a18;font-family:Arial,sans-serif;box-shadow:0 10px 28px #0002}.booking-confirmation-document header{border-top:3px solid #c9963f;text-align:center;padding:14px 0 16px;border-bottom:1px solid #c9963f}.logo-img{display:block;width:132px;height:auto;margin:0 auto 10px}.booking-confirmation-document header h1{margin:0;font:24px Georgia,serif;letter-spacing:2px;color:#c9963f}.booking-confirmation-document header p{margin:5px 0;color:#657069;font-size:10px;text-transform:uppercase;letter-spacing:2px}.booking-confirmation-document header small{color:#657069;font-size:9px;line-height:1.6}.document-title{text-align:center;padding:18px 0 12px}.document-title h2{margin:0 0 8px;font:24px Georgia,serif}.document-title span,.booking-confirmation-document dt{color:#c9963f;font-size:8px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase}.confirmation-section{margin:10px 0;border:1px solid #ded5c6}.confirmation-section h3{margin:0;padding:6px 10px;background:#f7f2e8;color:#c9963f;font-size:8px;letter-spacing:1.4px;text-transform:uppercase}.confirmation-section dl{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin:0;padding:10px}.confirmation-section dl>div{border-bottom:1px solid #ded5c6;padding-bottom:5px}.confirmation-section dl>div:last-child:nth-child(odd){grid-column:span 2}.booking-confirmation-document dt{margin-bottom:4px}.booking-confirmation-document dd{margin:0;font-size:10px;line-height:1.35;word-break:break-word}.booking-confirmation-document footer{border-top:1px solid #c9963f;margin-top:16px;padding-top:10px;text-align:center;font:14px Georgia,serif}.booking-confirmation-document footer small{display:block;margin-top:7px;color:#657069;font:8px Arial;line-height:1.6}@page{size:A4 portrait;margin:0}@media print{body{background:#fff!important}.booking-confirmation-document{margin:0;box-shadow:none}}
      `}</style>
    </main>
  );
}

function DocumentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="confirmation-section"><h3>{title}</h3><dl>{children}</dl></section>;
}
