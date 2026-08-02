-- Date blocking + offline booking fields for Marlo Hotels PMS.

DO $$ BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_IN';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_OUT';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "PaymentStatus" ADD VALUE 'PARTIAL';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "PaymentStatus" ADD VALUE 'OFFLINE';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'ONLINE';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "breakfast" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "physicalRoomNumber" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "internalRemarks" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "createdBy" TEXT;

CREATE INDEX IF NOT EXISTS "Booking_source_createdAt_idx" ON "Booking"("source", "createdAt");
CREATE INDEX IF NOT EXISTS "Booking_physicalRoomNumber_checkIn_idx" ON "Booking"("physicalRoomNumber", "checkIn");

DO $$ BEGIN
  CREATE TYPE "DateBlockReason" AS ENUM (
    'MAINTENANCE',
    'RENOVATION',
    'DEEP_CLEANING',
    'PRIVATE_BOOKING',
    'VIP_RESERVATION',
    'OWNER_USE',
    'BLOCKED',
    'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DateBlockStatus" AS ENUM (
    'ACTIVE',
    'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "DateBlock" (
  "id" TEXT NOT NULL,
  "roomCategorySlug" TEXT NOT NULL,
  "roomCategoryName" TEXT NOT NULL,
  "physicalRoomNumber" TEXT,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL,
  "reason" "DateBlockReason" NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "status" "DateBlockStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DateBlock_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DateBlock_roomCategorySlug_startDate_endDate_idx"
  ON "DateBlock"("roomCategorySlug", "startDate", "endDate");

CREATE INDEX IF NOT EXISTS "DateBlock_status_startDate_endDate_idx"
  ON "DateBlock"("status", "startDate", "endDate");

CREATE INDEX IF NOT EXISTS "DateBlock_physicalRoomNumber_idx"
  ON "DateBlock"("physicalRoomNumber");
