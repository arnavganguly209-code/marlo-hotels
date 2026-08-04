-- Operational booking outcomes used by the online reservation console.
-- Each block is safe to apply to databases where an earlier deploy added it.
DO $$ BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'ON_HOLD';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'NO_SHOW';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "BookingStatus" ADD VALUE 'REFUNDED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
