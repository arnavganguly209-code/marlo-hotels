import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { siteConfig } from "@/lib/site";

export type BookingConfirmationPdfPayload = {
  reference: string;
  status: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  country?: string | null;
  checkIn: Date | string;
  checkOut: Date | string;
  adults: number;
  children: number;
  rooms: number;
  breakfast: boolean;
  paymentStatus: string;
  totalAmount?: number | null;
  physicalRoomNumber?: string | null;
  notes?: string | null;
  room: { name: string };
};

const hex = (value: string) => rgb(
  parseInt(value.slice(1, 3), 16) / 255,
  parseInt(value.slice(3, 5), 16) / 255,
  parseInt(value.slice(5, 7), 16) / 255
);
const green = hex("#0c1a18");
const gold = hex("#c9963f");
const cream = hex("#f7f2e8");
const muted = hex("#657069");
const date = (value: Date | string) => new Intl.DateTimeFormat("en", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));

export async function generateBookingConfirmationPdf(
  booking: BookingConfirmationPdfPayload
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const { width, height } = page.getSize();
  const left = 48;
  const right = width - 48;
  let y = height - 52;
  const text = (value: string, x: number, at: number, size = 10, font = regular, color = green) =>
    page.drawText(value, { x, y: at, size, font, color });
  const rule = (at: number) => page.drawLine({ start: { x: left, y: at }, end: { x: right, y: at }, thickness: 0.7, color: hex("#ded5c6") });
  const field = (label: string, value: string, x: number, at: number, fieldWidth = 235) => {
    text(label.toUpperCase(), x, at, 6.5, bold, gold);
    text(value || "—", x, at - 14, 9, regular);
    page.drawLine({ start: { x, y: at - 20 }, end: { x: x + fieldWidth, y: at - 20 }, thickness: 0.5, color: hex("#ded5c6") });
  };

  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: gold });
  text("MARLO HOTELS", left, y, 12, bold, gold);
  text("STAY BEYOND EXTRAORDINARY", left, y - 15, 7, regular, muted);
  text(siteConfig.contact.address, right - 178, y, 7, regular, muted);
  text(siteConfig.contact.reservationsEmail, right - 178, y - 12, 7, regular, muted);
  y -= 63;
  text("Booking Confirmation", left, y, 25, serif);
  text(`BOOKING ID  ${booking.reference}`, left, y - 20, 8, bold, gold);
  text(booking.status.replaceAll("_", " "), right - 92, y - 18, 8, bold, green);
  y -= 44;
  rule(y);
  y -= 22;
  text("Guest details", left, y, 11, bold);
  y -= 18;
  field("Guest name", booking.guestName, left, y);
  field("Email", booking.guestEmail, 310, y);
  y -= 36;
  field("Telephone", booking.guestPhone, left, y);
  field("Country", booking.country || "—", 310, y);
  y -= 44;
  text("Stay at Marlo", left, y, 11, bold);
  y -= 18;
  field("Check-in", `${date(booking.checkIn)} · ${siteConfig.hours.checkIn || "2:00 PM"}`, left, y);
  field("Check-out", `${date(booking.checkOut)} · ${siteConfig.hours.checkOut || "11:00 AM"}`, 310, y);
  const nights = Math.max(0, Math.round((+new Date(booking.checkOut) - +new Date(booking.checkIn)) / 86_400_000));
  y -= 36;
  field("Accommodation", booking.room.name, left, y);
  field("Room / guests", `${booking.physicalRoomNumber || "To be assigned"} · ${nights} night${nights === 1 ? "" : "s"} · ${booking.adults} adult${booking.adults === 1 ? "" : "s"}${booking.children ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}` : ""}`, 310, y);
  y -= 44;
  page.drawRectangle({ x: left, y: y - 69, width: right - left, height: 69, color: cream });
  text("Payment summary", left + 14, y - 17, 10, bold);
  text(`Breakfast: ${booking.breakfast ? "Included" : "Not included"} · ${booking.rooms} room${booking.rooms === 1 ? "" : "s"}`, left + 14, y - 34, 8, regular, muted);
  text(`Payment: ${booking.paymentStatus === "UNPAID" ? "Pending" : booking.paymentStatus.replaceAll("_", " ")}`, left + 14, y - 50, 8, regular, muted);
  const total = booking.totalAmount == null ? "Confirmed on request" : new Intl.NumberFormat("en-US", { style: "currency", currency: siteConfig.currency }).format(booking.totalAmount);
  text("GRAND TOTAL", right - 150, y - 25, 7, bold, gold);
  text(total, right - 150, y - 46, 14, bold);
  y -= 94;
  text("Arrival & policies", left, y, 11, bold);
  y -= 15;
  const policy = `Check-in from ${siteConfig.hours.checkIn || "14:00"}; check-out by ${siteConfig.hours.checkOut || "11:00"}. Please present a valid ID on arrival. Cancellations and amendments remain subject to the booking terms.`;
  const policyLines = policy.match(/.{1,95}(?:\s|$)/g) || [policy];
  policyLines.forEach((line, index) => text(line.trim(), left, y - index * 11, 8, regular, muted));
  y -= 48;
  page.drawRectangle({ x: left, y: y - 56, width: 56, height: 56, borderColor: gold, borderWidth: 1 });
  text("QR", left + 19, y - 31, 9, bold, gold);
  text("Present this confirmation at reception. Our team is pleased to welcome you.", left + 72, y - 18, 8.5, regular, muted);
  text("Guest signature", left + 72, y - 43, 7, bold, gold);
  page.drawLine({ start: { x: left + 155, y: y - 45 }, end: { x: right, y: y - 45 }, thickness: 0.6, color: hex("#b9b1a4") });
  text("Thank you for choosing Marlo Hotels.", left, 62, 10, serif, green);
  text("MARLO HOTELS  ·  KATHMANDU  ·  marlohotels.com", left, 45, 6.5, bold, gold);
  return pdf.save();
}
