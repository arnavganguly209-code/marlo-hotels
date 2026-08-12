-- Track successful confirmation email delivery (duplicate-send protection).
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "confirmationEmailSentAt" TIMESTAMP(3);
