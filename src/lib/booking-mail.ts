import "server-only";

import {
  buildBookingConfirmationEmailHtml,
  type BookingConfirmationEmailPayload,
} from "@/lib/booking-confirmation-email";

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

export type PdfAttachment = {
  filename: string;
  content: Buffer | Uint8Array;
  contentType: string;
};

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  attachment?: PdfAttachment
) {
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
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      ...(attachment
        ? {
            attachments: [
              {
                filename: attachment.filename,
                content: Buffer.from(attachment.content).toString("base64"),
                content_type: attachment.contentType,
              },
            ],
          }
        : {}),
    }),
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
      buildBookingConfirmationEmailHtml(payload)
    );
    const hotelOk = await sendViaResend(
      hotelTo,
      `New booking ${payload.reference} — ${payload.guestName}`,
      buildBookingConfirmationEmailHtml(payload)
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

type ReadyBooking = BookingConfirmationEmailPayload & { status: string };

/** Sends an already-confirmed reservation with its on-demand PDF attachment. */
export async function sendBookingConfirmationReady({
  booking,
  pdf,
}: {
  booking: ReadyBooking;
  pdf?: PdfAttachment;
}): Promise<{ sent: boolean; reason?: string }> {
  if (booking.status !== "CONFIRMED") {
    return { sent: false, reason: "Booking is not confirmed" };
  }
  if (!process.env.RESEND_API_KEY) {
    return { sent: false, reason: "Email provider is not configured" };
  }
  try {
    const sent = await sendViaResend(
      booking.guestEmail,
      `Your Marlo Hotels confirmation — ${booking.reference}`,
      buildBookingConfirmationEmailHtml(booking),
      pdf
    );
    return sent ? { sent: true } : { sent: false, reason: "Email provider rejected the message" };
  } catch (error) {
    console.error("[booking-mail] Confirmation email failed", error);
    return { sent: false, reason: "Unable to send confirmation email" };
  }
}
