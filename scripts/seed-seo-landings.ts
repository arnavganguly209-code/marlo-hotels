/**
 * Upsert SEO landing pages (Marlo-only) from scripts/seo-landing-seeds.json.
 * Regenerate that file first: `node scripts/generate-seo-landing-seeds.mjs` (or `npm run seo:generate-landings`).
 * Safe: only touches SeoLandingPage table. Existing rows are updated so new pages and copy reach production.
 *
 * Run via `npm run seo:seed-landings` (uses tsx so we can import the generated Prisma TS client).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Prisma } from "../src/generated/prisma/client";
import type { ContentStatus } from "../src/generated/prisma/enums";

loadEnv({ path: path.join(process.cwd(), ".env"), override: false });

type SeedRow = {
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  body: string;
  faqs: Prisma.InputJsonValue;
  locationKey: string | null;
  categoryKey: string | null;
  facilityKey: string | null;
  roomFilter: string;
  relatedPaths: Prisma.InputJsonValue;
  status: ContentStatus;
  robotsIndex: boolean;
  enabled: boolean;
};

const seeds = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "scripts/seo-landing-seeds.json"),
    "utf8"
  )
) as SeedRow[];

function getPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL missing");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

async function main() {
  const prisma = getPrisma();
  try {
    for (const seed of seeds) {
      const existing = await prisma.seoLandingPage.findUnique({
        where: { path: seed.path },
        select: { publishedAt: true },
      });
      const publishedAt =
        seed.status === "PUBLISHED"
          ? existing?.publishedAt ?? new Date()
          : null;
      const data = {
        title: seed.title,
        metaTitle: seed.metaTitle,
        metaDescription: seed.metaDescription,
        h1: seed.h1,
        intro: seed.intro,
        body: seed.body,
        faqs: seed.faqs,
        locationKey: seed.locationKey,
        categoryKey: seed.categoryKey,
        facilityKey: seed.facilityKey,
        roomFilter: seed.roomFilter,
        relatedPaths: seed.relatedPaths,
        status: seed.status,
        robotsIndex: seed.robotsIndex,
        enabled: seed.enabled,
        publishedAt,
        featuredImageUrl: "/images/brand/social-share.jpg",
        featuredImageAlt: "Marlo Hotels Kathmandu",
      };
      await prisma.seoLandingPage.upsert({
        where: { path: seed.path },
        create: { path: seed.path, ...data },
        update: data,
      });
      console.log("ok", seed.path);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
