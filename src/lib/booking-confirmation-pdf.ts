import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { siteConfig } from "@/lib/site";

export type BookingConfirmationPdfPayload = {
  reference: string;
  status: string;
  confirmationStatus?: string | null;
  createdAt?: Date | string | null;
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
  roomRate?: number | null;
  taxes?: number | null;
  additionalCharges?: number | null;
  paymentMethod?: string | null;
  physicalRoomNumber?: string | null;
  notes?: string | null;
  room: { name: string };
};

const hex = (value: string) =>
  rgb(
    parseInt(value.slice(1, 3), 16) / 255,
    parseInt(value.slice(3, 5), 16) / 255,
    parseInt(value.slice(5, 7), 16) / 255
  );
const green = hex("#0c1a18");
const gold = hex("#c9963f");
const cream = hex("#f7f2e8");
const muted = hex("#657069");
const border = hex("#ded5c6");
const date = (value: Date | string) =>
  new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
const money = (value?: number | null) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: siteConfig.currency,
      }).format(value);
const displayStatus = (value: string) => value.replaceAll("_", " ");
const compact = (value?: string | null, limit = 52) => {
  const normalized = value?.replace(/\s+/g, " ").trim() || "";
  return normalized.length > limit
    ? `${normalized.slice(0, limit - 1).trimEnd()}…`
    : normalized || "—";
};

export function nightsBetween(checkIn: Date | string, checkOut: Date | string) {
  return Math.max(
    0,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
    )
  );
}

async function loadLogoBytes() {
  try {
    return await readFile(
      path.join(process.cwd(), "public", "images", "brand", "logo.png")
    );
  } catch {
    return null;
  }
}

export async function generateBookingConfirmationPdf(
  booking: BookingConfirmationPdfPayload
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const { width, height } = page.getSize();
  const left = 40;
  const right = width - 40;
  const contentWidth = right - left;
  let y = height - 42;
  const text = (
    value: string,
    x: number,
    at: number,
    size = 9,
    font = regular,
    color = green
  ) => page.drawText(value, { x, y: at, size, font, color });
  const centered = (
    value: string,
    at: number,
    size: number,
    font = regular,
    color = green
  ) =>
    text(
      value,
      (width - font.widthOfTextAtSize(value, size)) / 2,
      at,
      size,
      font,
      color
    );
  const rule = (at: number, color = border) =>
    page.drawLine({
      start: { x: left, y: at },
      end: { x: right, y: at },
      thickness: 0.7,
      color,
    });
  const section = (title: string) => {
    page.drawRectangle({
      x: left,
      y: y - 17,
      width: contentWidth,
      height: 17,
      color: cream,
      borderColor: border,
      borderWidth: 0.5,
    });
    text(title.toUpperCase(), left + 10, y - 11.5, 7, bold, gold);
    y -= 25;
  };
  const field = (
    label: string,
    value: string,
    x: number,
    at: number,
    fieldWidth: number
  ) => {
    text(label.toUpperCase(), x, at, 6, bold, gold);
    text(
      compact(value, fieldWidth > 230 ? 88 : 42),
      x,
      at - 11,
      8.2,
      regular
    );
    page.drawLine({
      start: { x, y: at - 16 },
      end: { x: x + fieldWidth, y: at - 16 },
      thickness: 0.45,
      color: border,
    });
  };

  page.drawRectangle({ x: 0, y: height - 4, width, height: 4, color: gold });

  const logoBytes = await loadLogoBytes();
  if (logoBytes) {
    const logo = await pdf.embedPng(logoBytes);
    const logoWidth = 118;
    const logoHeight = (logo.height / logo.width) * logoWidth;
    page.drawImage(logo, {
      x: (width - logoWidth) / 2,
      y: y - logoHeight + 8,
      width: logoWidth,
      height: logoHeight,
    });
    y -= logoHeight + 10;
  } else {
    const markSize = 28;
    const markX = (width - markSize) / 2;
    page.drawRectangle({
      x: markX,
      y: y - markSize + 4,
      width: markSize,
      height: markSize,
      borderColor: gold,
      borderWidth: 1.1,
    });
    text("MH", markX + 5.2, y - 14, 11, bold, gold);
    y -= 38;
  }

  centered(siteConfig.name.toUpperCase(), y, 16, serif, gold);
  centered(siteConfig.tagline.toUpperCase(), y - 14, 6.5, bold, muted);
  centered(siteConfig.contact.address, y - 26, 6.5, regular, muted);
  centered(
    `${siteConfig.contact.phone}  ·  ${siteConfig.contact.reservationsEmail}`,
    y - 37,
    6.5,
    regular,
    muted
  );
  centered(
    siteConfig.url.replace(/^https?:\/\//, ""),
    y - 48,
    6.5,
    regular,
    muted
  );
  y -= 64;
  rule(y, gold);
  centered("BOOKING CONFIRMATION", y - 22, 19, serif);
  centered(`BOOKING NUMBER  ·  ${booking.reference}`, y - 36, 7, bold, gold);
  y -= 49;

  const col = (contentWidth - 16) / 2;
  section("Booking Information");
  field("Booking Number", booking.reference, left + 8, y, col);
  field(
    "Booking Date",
    date(booking.createdAt || new Date()),
    left + 8 + col + 16,
    y,
    col
  );
  y -= 25;
  field("Booking Status", displayStatus(booking.status), left + 8, y, col);
  field(
    "Confirmation Status",
    booking.confirmationStatus ||
      (booking.status === "CONFIRMED"
        ? "Confirmed"
        : "Pending Confirmation"),
    left + 8 + col + 16,
    y,
    col
  );
  y -= 29;
  section("Guest Information");
  field("Name", booking.guestName, left + 8, y, col);
  field("Email", booking.guestEmail, left + 8 + col + 16, y, col);
  y -= 25;
  field("Phone", booking.guestPhone, left + 8, y, col);
  field("Country", booking.country || "—", left + 8 + col + 16, y, col);
  y -= 25;
  field("Special Requests", booking.notes || "—", left + 8, y, contentWidth - 16);
  y -= 29;
  section("Stay Information");
  field("Room Category", booking.room.name, left + 8, y, col);
  field(
    "Room Number",
    booking.physicalRoomNumber || "To be assigned",
    left + 8 + col + 16,
    y,
    col
  );
  y -= 25;
  field(
    "Guests",
    `${booking.adults} adult${booking.adults === 1 ? "" : "s"}`,
    left + 8,
    y,
    col
  );
  field("Children", String(booking.children), left + 8 + col + 16, y, col);
  y -= 25;
  field("Check-in", date(booking.checkIn), left + 8, y, col);
  field("Check-out", date(booking.checkOut), left + 8 + col + 16, y, col);
  y -= 25;
  const nights = nightsBetween(booking.checkIn, booking.checkOut);
  field(
    "Nights",
    `${nights} night${nights === 1 ? "" : "s"}`,
    left + 8,
    y,
    col
  );
  field(
    "Breakfast Included",
    booking.breakfast ? "Yes" : "No",
    left + 8 + col + 16,
    y,
    col
  );
  y -= 29;
  section("Payment Information");
  field("Room Rate", money(booking.roomRate), left + 8, y, col);
  field("Taxes", money(booking.taxes), left + 8 + col + 16, y, col);
  y -= 25;
  field(
    "Additional Charges",
    money(booking.additionalCharges),
    left + 8,
    y,
    col
  );
  field(
    "Grand Total",
    booking.totalAmount == null
      ? "Confirmed on request"
      : money(booking.totalAmount),
    left + 8 + col + 16,
    y,
    col
  );
  y -= 25;
  field(
    "Payment Status",
    displayStatus(booking.paymentStatus),
    left + 8,
    y,
    col
  );
  field(
    "Payment Method",
    booking.paymentMethod || "Website / Pay on arrival",
    left + 8 + col + 16,
    y,
    col
  );
  y -= 29;
  section("Hotel Information");
  field("Check-in Time", siteConfig.hours.checkIn, left + 8, y, col);
  field("Check-out Time", siteConfig.hours.checkOut, left + 8 + col + 16, y, col);
  y -= 25;
  field(
    "Cancellation Policy",
    "Cancellations and amendments are subject to your booking terms.",
    left + 8,
    y,
    contentWidth - 16
  );
  y -= 25;
  field(
    "Important Hotel Notes",
    "Please present valid identification on arrival. Our team is pleased to welcome you.",
    left + 8,
    y,
    contentWidth - 16
  );
  rule(74, gold);
  centered("Thank you for choosing Marlo Hotels.", 58, 10, serif, green);
  centered(
    `${siteConfig.name}  ·  ${siteConfig.url.replace(/^https?:\/\//, "")}  ·  ${siteConfig.contact.reservationsEmail}`,
    44,
    6.2,
    bold,
    gold
  );
  centered(
    `${siteConfig.contact.phone}  ·  ${siteConfig.contact.address}`,
    33,
    6.2,
    regular,
    muted
  );
  return pdf.save();
}
