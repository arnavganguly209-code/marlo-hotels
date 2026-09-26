-- Isolated SEO landing pages for /hotels/... (Marlo-only).
-- Safe additive migration: creates a new table only. No existing data altered.

CREATE TABLE IF NOT EXISTS "SeoLandingPage" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "h1" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "locationKey" TEXT,
    "categoryKey" TEXT,
    "facilityKey" TEXT,
    "roomFilter" TEXT NOT NULL DEFAULT 'all',
    "canonicalUrl" TEXT,
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "featuredImageUrl" TEXT,
    "featuredImageAlt" TEXT,
    "relatedPaths" JSONB NOT NULL DEFAULT '[]',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoLandingPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SeoLandingPage_path_key" ON "SeoLandingPage"("path");
CREATE INDEX IF NOT EXISTS "SeoLandingPage_status_enabled_robotsIndex_idx" ON "SeoLandingPage"("status", "enabled", "robotsIndex");
CREATE INDEX IF NOT EXISTS "SeoLandingPage_locationKey_idx" ON "SeoLandingPage"("locationKey");
CREATE INDEX IF NOT EXISTS "SeoLandingPage_categoryKey_idx" ON "SeoLandingPage"("categoryKey");
CREATE INDEX IF NOT EXISTS "SeoLandingPage_facilityKey_idx" ON "SeoLandingPage"("facilityKey");
