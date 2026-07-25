import "server-only";

import { siteConfig } from "@/lib/site";

type BookingMailPayload = {
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  whatsapp: string;
  country: string;
  arrivalTime: string;
  notes: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  breakfast: boolean;
  totalAmount?: number;
};

function bookingHtml(payload: BookingMailPayload, forGuest: boolean) {
  const meal = payload.breakfast ? "With Breakfast" : "Without Breakfast";
  const total =
    typeof payload.totalAmount === "number"
      ? `$${payload.totalAmount}`
      : "Confirmed on request";
  return `
  <div style="font-family:Georgia,serif;color:#1a2e26;line-height:1.6">
    <p style="letter-spacing:.2em;text-transform:uppercase;font-size:11px;color:#b8893d">Marlo Hotels</p>
    <h1 style="font-weight:500;font-size:28px;margin:12px 0 16px">
      ${forGuest ? "Thank you for choosing Marlo Hotels" : "New reservation request"}
    </h1>
    <p>${forGuest
      ? "Your reservation request has been received successfully. Our reservations team will contact you shortly."
      : "A new booking request was submitted on the website."}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Booking ID</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right"><strong>${payload.reference}</strong></td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Guest</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right">${payload.guestName}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Room</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right">${payload.roomName}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Dates</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right">${payload.checkIn} → ${payload.checkOut}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Meal plan</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right">${meal}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Guests</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right">${payload.adults} adults · ${payload.children} children · ${payload.rooms} rooms</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Arrival</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right">${payload.arrivalTime}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e8e4da">Estimated total</td><td style="padding:8px 0;border-bottom:1px solid #e8e4da;text-align:right">${total}</td></tr>
    </table>
    <p style="margin-top:24px;font-size:13px;color:#5c6b63">
      To modify or cancel, contact <a href="mailto:info@marlohotels.com">info@marlohotels.com</a>
      or ${siteConfig.contact.reservations}.
    </p>
  </div>`;
}

async function sendViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from =
    process.env.BOOKING_FROM_EMAIL ||
    "Marlo Hotels <onboarding@resend.dev>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  return response.ok;
}

/**
 * Sends guest confirmation + hotel notification when email is configured.
 * Booking still succeeds if mail is unavailable.
 */
export async function sendBookingEmails(payload: BookingMailPayload) {
  const hotelTo =
    process.env.BOOKING_NOTIFY_EMAIL ||
    "info@marlohotels.com";

  try {
    const guestOk = await sendViaResend(
      payload.guestEmail,
      `Marlo Hotels reservation ${payload.reference}`,
      bookingHtml(payload, true)
    );
    const hotelOk = await sendViaResend(
      hotelTo,
      `New booking ${payload.reference} — ${payload.guestName}`,
      bookingHtml(payload, false)
    );
    if (!guestOk && !hotelOk) {
      console.info("[booking-mail] No mail provider configured; booking saved.", {
        reference: payload.reference,
      });
    }
  } catch (error) {
    console.error("[booking-mail] Failed to send", error);
  }
}
