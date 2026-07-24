import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Please add a subject"),
  message: z.string().min(10, "Please write a few words for us"),
});

export const bookingRequestSchema = z
  .object({
    checkIn: z.string().min(1, "Select a check-in date"),
    checkOut: z.string().min(1, "Select a check-out date"),
    adults: z.number().int().min(1).max(8),
    children: z.number().int().min(0).max(6),
    rooms: z.number().int().min(1).max(5),
    roomSlug: z.string().min(1, "Choose a room"),
    promoCode: z.string().optional(),
    guestName: z.string().min(2, "Please tell us your name"),
    guestEmail: z.email("Please enter a valid email address"),
    guestPhone: z.string().min(5, "Please enter a phone number"),
    whatsapp: z.string().min(5, "Please enter a WhatsApp number"),
    country: z.string().min(2, "Please enter your country"),
    arrivalTime: z.string().min(1, "Please enter arrival time"),
    notes: z.string().min(2, "Please add a special request"),
    breakfast: z.boolean().optional(),
    totalAmount: z.number().optional(),
    billingName: z.string().optional(),
    billingCountry: z.string().optional(),
    billingAddress: z.string().optional(),
    paymentIntent: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.checkOut) > new Date(data.checkIn),
    { message: "Check-out must be after check-in", path: ["checkOut"] }
  );

export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
