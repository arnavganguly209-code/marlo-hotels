-- Booking.com-style nightly allotment for Marlo Hotels.

CREATE TABLE IF NOT EXISTS "RoomInventoryNight" (
  "id" TEXT NOT NULL,
  "roomCategorySlug" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "inventory" INTEGER NOT NULL,
  "rate1Adult" DECIMAL(10, 2),
  "rate2Adult" DECIMAL(10, 2),
  "rate3Adult" DECIMAL(10, 2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RoomInventoryNight_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RoomInventoryNight_roomCategorySlug_date_key"
  ON "RoomInventoryNight"("roomCategorySlug", "date");

CREATE INDEX IF NOT EXISTS "RoomInventoryNight_date_idx"
  ON "RoomInventoryNight"("date");

CREATE INDEX IF NOT EXISTS "RoomInventoryNight_roomCategorySlug_date_idx"
  ON "RoomInventoryNight"("roomCategorySlug", "date");
