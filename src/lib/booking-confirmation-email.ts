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
  roomRate?: number | null;
  additionalCharges?: number | null;
  phone?: string;
  country?: string | null;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string | null;
  paypalOrderId?: string | null;
  paypalCaptureId?: string | null;
  notes?: string | null;
  nights?: number;
  physicalRoomNumber?: string | null;
  bookingUrl?: string;
  pdfUrl?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const date = (value: string | Date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const money = (value?: number | null) =>
  value == null
    ? "Confirmed on request"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: siteConfig.currency,
      }).format(value);

const statusLabel = (value?: string) =>
  (value || "CONFIRMED").replaceAll("_", " ");

function nightsBetween(checkIn: Date | string, checkOut: Date | string) {
  return Math.max(
    0,
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000
    )
  );
}

export function buildBookingConfirmationEmailHtml(
  payload: BookingConfirmationEmailPayload
) {
  const nights =
    payload.nights ?? nightsBetween(payload.checkIn, payload.checkOut);
  const total = money(payload.totalAmount);
  const bookingUrl =
    payload.bookingUrl ||
    `${siteConfig.url}/booking/confirmation/${encodeURIComponent(payload.reference)}/print`;
  const pdfUrl =
    payload.pdfUrl ||
    `${siteConfig.url}/api/booking/${encodeURIComponent(payload.reference)}/pdf?mode=download`;
  const logoUrl = `${siteConfig.url}/images/brand/logo.png`;
  const notes =
    payload.notes?.replace(/\s+/g, " ").trim() || "None";

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:11px 0;border-bottom:1px solid #e9e2d5;color:#66716c;font-family:Arial,Helvetica,sans-serif;font-size:13px;width:42%">${label}</td>
      <td style="padding:11px 0;border-bottom:1px solid #e9e2d5;text-align:right;color:#0c1a18;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reservation Confirmed</title></head>
<body style="margin:0;padding:0;background:#f5f0e7;">
  <div style="margin:0;padding:28px 12px;background:#f5f0e7;font-family:Georgia,'Times New Roman',serif;color:#0c1a18">
    <div style="max-width:640px;margin:auto;background:#fffdf8;border:1px solid #e4d6bd">
      <div style="height:5px;background:#c9963f;line-height:5px;font-size:0">&nbsp;</div>
      <div style="padding:32px 28px 28px;background:#0c1a18;color:#fffdf8;text-align:center">
        <img src="${logoUrl}" alt="Marlo Hotels" width="140" style="display:block;margin:0 auto 14px;max-width:140px;height:auto;border:0" />
        <div style="font-size:22px;letter-spacing:3px;color:#c9963f;text-transform:uppercase">Marlo Hotels</div>
        <div style="margin-top:10px;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;color:#d9d5c9">${escapeHtml(siteConfig.tagline)}</div>
      </div>
      <div style="padding:34px 28px">
        <p style="margin:0;color:#c9963f;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif">Booking Confirmation</p>
        <h1 style="margin:12px 0 12px;font-size:28px;font-weight:500;line-height:1.25">Thank you, ${escapeHtml(payload.guestName)}.</h1>
        <p style="margin:0 0 24px;line-height:1.65;color:#52605a;font-family:Arial,Helvetica,sans-serif;font-size:14px">Your booking at Marlo Hotels has been received. A confirmation PDF is attached — we look forward to welcoming you to Kathmandu.</p>
        <div style="padding:16px 18px;background:#f5f0e7;border-left:3px solid #c9963f;margin-bottom:22px">
          <span style="font-size:11px;color:#66716c;text-transform:uppercase;letter-spacing:1.5px;font-family:Arial,Helvetica,sans-serif">Booking / Reference ID</span><br>
          <strong style="font-size:18px;letter-spacing:0.04em">${escapeHtml(payload.reference)}</strong>
        </div>
        <table role="presentation" style="width:100%;border-collapse:collapse">
          ${row("Guest name", escapeHtml(payload.guestName))}
          ${row("Email", escapeHtml(payload.guestEmail))}
          ${row("Phone", escapeHtml(payload.phone || "—"))}
          ${row("Country", escapeHtml(payload.country || "—"))}
          ${row("Booking status", escapeHtml(statusLabel(payload.status)))}
          ${row("Room", escapeHtml(payload.roomName))}
          ${row("Room number", escapeHtml(payload.physicalRoomNumber || "To be assigned"))}
          ${row("Rooms", String(payload.rooms))}
          ${row("Guests", `${payload.adults} adult${payload.adults === 1 ? "" : "s"}`)}
          ${row("Children", String(payload.children))}
          ${row("Check-in", date(payload.checkIn))}
          ${row("Check-out", date(payload.checkOut))}
          ${row("Nights", `${nights} night${nights === 1 ? "" : "s"}`)}
          ${row("Breakfast", payload.breakfast ? "Included" : "Not included")}
          ${row("Room rate", money(payload.roomRate ?? payload.totalAmount))}
          ${row("Extra charges", money(payload.additionalCharges ?? 0))}
          ${row("Total amount", total)}
          ${row("Payment status", escapeHtml(statusLabel(payload.paymentStatus)))}
          ${row(
            "Payment method",
            escapeHtml(
              payload.paymentMethod === "PAYPAL"
                ? "PayPal"
                : payload.paymentMethod === "CARD"
                  ? "Card"
                  : payload.paymentMethod || "—"
            )
          )}
          ${
            payload.paypalOrderId
              ? row("PayPal order", escapeHtml(payload.paypalOrderId))
              : ""
          }
          ${
            payload.paypalCaptureId
              ? row("PayPal capture", escapeHtml(payload.paypalCaptureId))
              : ""
          }
          ${row("Special requests", escapeHtml(notes))}
        </table>
        <div style="padding-top:26px;text-align:center">
          <a href="${bookingUrl}" style="display:inline-block;margin:4px;padding:12px 16px;background:#0c1a18;color:#fffdf8;text-decoration:none;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif">View Booking</a>
          <a href="${pdfUrl}" style="display:inline-block;margin:4px;padding:12px 16px;border:1px solid #c9963f;color:#0c1a18;text-decoration:none;font-size:11px;letter-spacing:1.2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif">Download PDF</a>
        </div>
        <p style="margin:26px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#66716c;text-align:center">
          A detailed booking confirmation PDF is attached to this email.<br>
          ${escapeHtml(siteConfig.contact.address)}<br>
          ${escapeHtml(siteConfig.contact.reservations)} · ${escapeHtml(siteConfig.contact.reservationsEmail)}
        </p>
      </div>
      <div style="padding:22px 28px;background:#0c1a18;color:#d9d5c9;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.65">
        Marlo Hotels<br>
        ${escapeHtml(siteConfig.contact.address)}<br>
        ${escapeHtml(siteConfig.contact.phone)} · booking@marlohotels.com
      </div>
    </div>
  </div>
</body>
</html>`;
}
