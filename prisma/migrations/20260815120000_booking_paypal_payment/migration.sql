-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentCurrency" TEXT DEFAULT 'USD';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paypalOrderId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paypalCaptureId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_paypalOrderId_key" ON "Booking"("paypalOrderId");
CREATE INDEX IF NOT EXISTS "Booking_paymentMethod_paymentStatus_idx" ON "Booking"("paymentMethod", "paymentStatus");
