import "server-only";

import nodemailer from "nodemailer";
import {
  buildBookingConfirmationEmailHtml,
  type BookingConfirmationEmailPayload,
} from "@/lib/booking-confirmation-email";
import {
  generateBookingConfirmationPdf,
  nightsBetween,
  type BookingConfirmationPdfPayload,
} from "@/lib/booking-confirmation-pdf";
import { getDb } from "@/lib/db";

export type PdfAttachment = {
  filename: string;
  content: Buffer | Uint8Array;
  contentType: string;
};

export type ConfirmationMailResult = {
  sent: boolean;
  reason?: string;
  guestSent?: boolean;
  hotelSent?: boolean;
};

type BookingMailRecord = {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
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
  totalAmount?: number | null;
  physicalRoomNumber?: string | null;
  notes?: string | null;
  createdAt?: Date | string | null;
  confirmationEmailSentAt?: Date | string | null;
  room: { name: string };
};

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD?.trim()
  );
}

function mailFrom() {
  return (
    process.env.SMTP_FROM?.trim() ||
    process.env.BOOKING_FROM_EMAIL?.trim() ||
    "Marlo Hotels <booking@marlohotels.com>"
  );
}

function hotelNotifyTo() {
  return (
    process.env.BOOKING_NOTIFICATION_EMAIL?.trim() ||
    process.env.BOOKING_NOTIFY_EMAIL?.trim() ||
    "booking@marlohotels.com"
  );
}

function pdfFilename(reference: string) {
  return `Marlo-Hotels-Booking-${reference}.pdf`;
}

function createTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD?.trim();
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || "587");
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureEnv === "true" || secureEnv === "1"
      ? true
      : secureEnv === "false" || secureEnv === "0"
        ? false
        : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2" },
  });
}

async function sendSmtpMail(options: {
  to: string;
  subject: string;
  html: string;
  attachment?: PdfAttachment;
}) {
  const transport = createTransport();
  if (!transport) {
    return { ok: false as const, error: "SMTP is not configured" };
  }

  try {
    const info = await transport.sendMail({
      from: mailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachment
        ? [
            {
              filename: options.attachment.filename,
              content: Buffer.from(options.attachment.content),
              contentType: options.attachment.contentType,
            },
          ]
        : undefined,
    });
    return { ok: true as const, messageId: info.messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown SMTP error";
    console.error("[booking-mail] SMTP send failed", {
      to: options.to,
      subject: options.subject,
      error: message,
    });
    return { ok: false as const, error: message };
  }
}

function toEmailPayload(booking: BookingMailRecord): BookingConfirmationEmailPayload {
  const total =
    booking.totalAmount == null ? null : Number(booking.totalAmount);
  return {
    reference: booking.reference,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    roomName: booking.room.name,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    rooms: booking.rooms,
    breakfast: booking.breakfast,
    totalAmount: total,
    phone: booking.guestPhone,
    country: booking.country,
    status: booking.status,
    notes: booking.notes,
    nights: nightsBetween(booking.checkIn, booking.checkOut),
    physicalRoomNumber: booking.physicalRoomNumber,
    paymentStatus: booking.paymentStatus,
  };
}

function toPdfPayload(booking: BookingMailRecord): BookingConfirmationPdfPayload {
  return {
    reference: booking.reference,
    status: booking.status,
    createdAt: booking.createdAt || new Date(),
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    country: booking.country,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    rooms: booking.rooms,
    breakfast: booking.breakfast,
    paymentStatus: booking.paymentStatus,
    totalAmount:
      booking.totalAmount == null ? null : Number(booking.totalAmount),
    physicalRoomNumber: booking.physicalRoomNumber,
    notes: booking.notes,
    room: { name: booking.room.name },
  };
}

/**
 * Sends luxury confirmation email + PDF to guest and hotel when booking is CONFIRMED.
 * Marks confirmationEmailSentAt only after at least one successful delivery.
 * Never throws — booking flows must remain intact if mail fails.
 */
export async function sendConfirmedBookingEmails(
  booking: BookingMailRecord,
  options?: { force?: boolean; pdf?: PdfAttachment }
): Promise<ConfirmationMailResult> {
  if (booking.status !== "CONFIRMED") {
    return {
      sent: false,
      reason: "Confirmation email is only sent for CONFIRMED bookings",
    };
  }

  if (booking.confirmationEmailSentAt && !options?.force) {
    return {
      sent: false,
      reason: `Confirmation email already sent for ${booking.reference}`,
    };
  }

  if (!smtpConfigured()) {
    console.error(
      "[booking-mail] SMTP env vars missing (SMTP_HOST, SMTP_USER, SMTP_PASSWORD). Confirmation email not sent.",
      { reference: booking.reference }
    );
    return { sent: false, reason: "SMTP is not configured on the server" };
  }

  let attachment = options?.pdf;
  if (!attachment) {
    try {
      const pdf = await generateBookingConfirmationPdf(toPdfPayload(booking));
      attachment = {
        filename: pdfFilename(booking.reference),
        content: pdf,
        contentType: "application/pdf",
      };
    } catch (error) {
      console.error("[booking-mail] PDF generation failed", {
        reference: booking.reference,
        error,
      });
      return { sent: false, reason: "Could not generate booking PDF attachment" };
    }
  } else {
    attachment = {
      ...attachment,
      filename: attachment.filename || pdfFilename(booking.reference),
    };
  }

  const html = buildBookingConfirmationEmailHtml(toEmailPayload(booking));
  const subject = `Reservation Confirmed — ${booking.reference} | Marlo Hotels`;
  const hotelTo = hotelNotifyTo();

  const guestResult = await sendSmtpMail({
    to: booking.guestEmail,
    subject,
    html,
    attachment,
  });
  const hotelResult = await sendSmtpMail({
    to: hotelTo,
    subject: `Booking copy — ${booking.reference} — ${booking.guestName}`,
    html,
    attachment,
  });

  const guestSent = guestResult.ok;
  const hotelSent = hotelResult.ok;

  if (!guestSent && !hotelSent) {
    return {
      sent: false,
      guestSent,
      hotelSent,
      reason:
        ("error" in guestResult ? guestResult.error : undefined) ||
        ("error" in hotelResult ? hotelResult.error : undefined) ||
        "SMTP delivery failed",
    };
  }

  if (!guestSent) {
    console.error("[booking-mail] Guest confirmation failed; hotel copy may have sent", {
      reference: booking.reference,
      error: "error" in guestResult ? guestResult.error : undefined,
    });
  }
  if (!hotelSent) {
    console.error("[booking-mail] Hotel copy failed; guest may have received confirmation", {
      reference: booking.reference,
      error: "error" in hotelResult ? hotelResult.error : undefined,
    });
  }

  const db = getDb();
  if (db) {
    try {
      await db.booking.updateMany({
        where: {
          id: booking.id,
          ...(options?.force ? {} : { confirmationEmailSentAt: null }),
        },
        data: { confirmationEmailSentAt: new Date() },
      });
    } catch (error) {
      console.error("[booking-mail] Failed to mark confirmationEmailSentAt", {
        reference: booking.reference,
        error,
      });
    }
  }

  return {
    sent: true,
    guestSent,
    hotelSent,
    reason:
      guestSent && hotelSent
        ? undefined
        : guestSent
          ? "Guest email sent; hotel copy failed"
          : "Hotel copy sent; guest email failed",
  };
}

/** @deprecated Pending bookings no longer send confirmation mail. Kept for call-site compatibility. */
export async function sendBookingEmails(_payload: unknown) {
  console.info(
    "[booking-mail] Skipping email on pending booking create — confirmation sends only when status is CONFIRMED."
  );
}

/** Admin / API helper for an already-loaded confirmed booking. */
export async function sendBookingConfirmationReady({
  booking,
  pdf,
  force = false,
}: {
  booking: BookingConfirmationEmailPayload & {
    id?: string;
    status: string;
    guestPhone?: string;
    paymentStatus?: string;
    confirmationEmailSentAt?: Date | string | null;
    physicalRoomNumber?: string | null;
    notes?: string | null;
  };
  pdf?: PdfAttachment;
  force?: boolean;
}): Promise<ConfirmationMailResult> {
  if (!booking.id) {
    return { sent: false, reason: "Booking id required for confirmation email" };
  }
  return sendConfirmedBookingEmails(
    {
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      paymentStatus: booking.paymentStatus || "UNPAID",
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.phone || booking.guestPhone || "",
      country: booking.country,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      adults: booking.adults,
      children: booking.children,
      rooms: booking.rooms,
      breakfast: booking.breakfast,
      totalAmount: booking.totalAmount,
      physicalRoomNumber: booking.physicalRoomNumber,
      notes: booking.notes,
      createdAt: (booking as { createdAt?: Date | string | null }).createdAt,
      confirmationEmailSentAt: booking.confirmationEmailSentAt,
      room: { name: booking.roomName },
    },
    { force, pdf }
  );
}
