import { siteConfig } from "@/lib/site";

export type BookingConfirmationEmailPayload = {
  reference: string;
  guestName: string;
  guestEmail: string;
  roomName: string;
  checkIn: string | Date;
  checkOut: string | Date;
  adults: number;
  children: number;
  rooms: number;
  breakfast: boolean;
  totalAmount?: number | null;
  phone?: string;
  country?: string | null;
  status?: string;
  bookingUrl?: string;
  pdfUrl?: string;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const date = (value: string | Date) =>
  new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

export function buildBookingConfirmationEmailHtml(payload: BookingConfirmationEmailPayload) {
  const total = payload.totalAmount == null
    ? "Confirmed on request"
    : new Intl.NumberFormat("en-US", { style: "currency", currency: siteConfig.currency }).format(payload.totalAmount);
  const bookingUrl = payload.bookingUrl || `${siteConfig.url}/booking/confirmation/${encodeURIComponent(payload.reference)}/print`;
  const pdfUrl = payload.pdfUrl || `${siteConfig.url}/api/booking/${encodeURIComponent(payload.reference)}/pdf?mode=download`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:12px 0;border-bottom:1px solid #e9e2d5;color:#66716c">${label}</td><td style="padding:12px 0;border-bottom:1px solid #e9e2d5;text-align:right;color:#0c1a18;font-weight:600">${value}</td></tr>`;

  return `<div style="margin:0;padding:32px 12px;background:#f5f0e7;font-family:Georgia,'Times New Roman',serif;color:#0c1a18">
  <div style="max-width:640px;margin:auto;background:#fffdf8;border:1px solid #e4d6bd">
    <div style="height:5px;background:#c9963f"></div>
    <div style="padding:34px 42px;background:#0c1a18;color:#fffdf8;text-align:center">
      <div style="font-size:23px;letter-spacing:3px;color:#c9963f;text-transform:uppercase">Marlo Hotels</div>
      <div style="margin-top:10px;font-size:11px;letter-spacing:2px;text-transform:uppercase">${escapeHtml(siteConfig.tagline)}</div>
    </div>
    <div style="padding:38px 42px">
      <p style="margin:0;color:#c9963f;font-size:11px;letter-spacing:2px;text-transform:uppercase">${escapeHtml(payload.status === "CONFIRMED" ? "Reservation confirmed" : "Reservation received")}</p>
      <h1 style="margin:13px 0 12px;font-size:29px;font-weight:500">A warm welcome awaits, ${escapeHtml(payload.guestName)}.</h1>
      <p style="margin:0 0 26px;line-height:1.65;color:#52605a">Your stay at Marlo Hotels is confirmed. We look forward to making every moment of your visit exceptional.</p>
      <div style="padding:17px 20px;background:#f5f0e7;border-left:3px solid #c9963f;margin-bottom:24px">
        <span style="font-size:11px;color:#66716c;text-transform:uppercase;letter-spacing:1.5px">Booking ID</span><br><strong style="font-size:18px">${escapeHtml(payload.reference)}</strong>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">${row("Guest", escapeHtml(payload.guestName))}${row("Phone", escapeHtml(payload.phone || "—"))}${row("Country", escapeHtml(payload.country || "—"))}${row("Room", escapeHtml(payload.roomName))}${row("Stay", `${date(payload.checkIn)} – ${date(payload.checkOut)}`)}${row("Guests", `${payload.adults} adult${payload.adults === 1 ? "" : "s"}${payload.children ? ` · ${payload.children} child${payload.children === 1 ? "" : "ren"}` : ""}`)}${row("Breakfast", payload.breakfast ? "Included" : "Not included")}${row("Grand total", total)}</table>
      <div style="padding-top:28px;text-align:center">
        <a href="${bookingUrl}" style="display:inline-block;margin:4px;padding:12px 16px;background:#0c1a18;color:#fffdf8;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase">View Booking</a>
        <a href="${pdfUrl}" style="display:inline-block;margin:4px;padding:12px 16px;border:1px solid #c9963f;color:#0c1a18;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase">Download PDF</a>
        <a href="${siteConfig.url}" style="display:inline-block;margin:4px;padding:12px 16px;color:#0c1a18;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase">Visit Website</a>
      </div>
    </div>
    <div style="padding:24px 42px;background:#0c1a18;color:#d9d5c9;text-align:center;font-family:Arial,sans-serif;font-size:12px;line-height:1.6">
      ${escapeHtml(siteConfig.contact.address)}<br>${escapeHtml(siteConfig.contact.reservationsEmail)} · ${escapeHtml(siteConfig.contact.reservations)}
      <div style="margin-top:12px;color:#c9963f;letter-spacing:3px">INSTAGRAM · FACEBOOK · X</div>
    </div>
  </div>
</div>`;
}
