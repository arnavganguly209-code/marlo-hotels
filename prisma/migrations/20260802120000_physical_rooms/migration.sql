-- Physical room numbers (PMS) for Marlo Hotels admin.
-- Linked to catalogue room categories by slug (ContentEntry module=rooms).

CREATE TYPE "PhysicalRoomStatus" AS ENUM (
  'AVAILABLE',
  'OCCUPIED',
  'MAINTENANCE',
  'OUT_OF_SERVICE',
  'CLEANING',
  'BLOCKED'
);

CREATE TABLE "PhysicalRoom" (
  "id" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "roomCategorySlug" TEXT NOT NULL,
  "roomCategoryName" TEXT NOT NULL,
  "status" "PhysicalRoomStatus" NOT NULL DEFAULT 'AVAILABLE',
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PhysicalRoom_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PhysicalRoom_roomCategorySlug_number_key"
  ON "PhysicalRoom"("roomCategorySlug", "number");

CREATE INDEX "PhysicalRoom_roomCategorySlug_status_idx"
  ON "PhysicalRoom"("roomCategorySlug", "status");

CREATE INDEX "PhysicalRoom_status_idx"
  ON "PhysicalRoom"("status");
