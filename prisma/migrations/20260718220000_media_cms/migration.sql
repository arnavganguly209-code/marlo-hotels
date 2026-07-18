-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "MediaFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaFolder_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "MediaAsset" ADD COLUMN     "durationMs" INTEGER;
ALTER TABLE "MediaAsset" ADD COLUMN     "title" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN     "seoTitle" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN     "seoDescription" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN     "folderId" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN     "focalX" DOUBLE PRECISION NOT NULL DEFAULT 50;
ALTER TABLE "MediaAsset" ADD COLUMN     "focalY" DOUBLE PRECISION NOT NULL DEFAULT 50;
ALTER TABLE "MediaAsset" ADD COLUMN     "cropJson" JSONB;
ALTER TABLE "MediaAsset" ADD COLUMN     "posterUrl" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN     "posterAssetId" TEXT;
ALTER TABLE "MediaAsset" ADD COLUMN     "currentVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "MediaAsset" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "MediaVersion" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "checksum" TEXT NOT NULL,
    "isOriginal" BOOLEAN NOT NULL DEFAULT true,
    "cropJson" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaPlacement" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "assetId" TEXT,
    "mediaType" "MediaKind" NOT NULL DEFAULT 'IMAGE',
    "alt" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "focalX" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "focalY" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "videoAutoplay" BOOLEAN NOT NULL DEFAULT true,
    "videoLoop" BOOLEAN NOT NULL DEFAULT true,
    "videoMuted" BOOLEAN NOT NULL DEFAULT true,
    "posterUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaFolder_slug_key" ON "MediaFolder"("slug");
CREATE INDEX "MediaFolder_parentId_name_idx" ON "MediaFolder"("parentId", "name");
CREATE INDEX "MediaAsset_kind_deletedAt_createdAt_idx" ON "MediaAsset"("kind", "deletedAt", "createdAt");
CREATE INDEX "MediaAsset_checksum_idx" ON "MediaAsset"("checksum");
CREATE INDEX "MediaAsset_folderId_idx" ON "MediaAsset"("folderId");
CREATE UNIQUE INDEX "MediaVersion_url_key" ON "MediaVersion"("url");
CREATE INDEX "MediaVersion_assetId_createdAt_idx" ON "MediaVersion"("assetId", "createdAt");
CREATE UNIQUE INDEX "MediaVersion_assetId_version_key" ON "MediaVersion"("assetId", "version");
CREATE UNIQUE INDEX "MediaPlacement_key_key" ON "MediaPlacement"("key");
CREATE INDEX "MediaPlacement_assetId_idx" ON "MediaPlacement"("assetId");

-- AddForeignKey
ALTER TABLE "MediaFolder" ADD CONSTRAINT "MediaFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "MediaFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MediaVersion" ADD CONSTRAINT "MediaVersion_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaPlacement" ADD CONSTRAINT "MediaPlacement_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
