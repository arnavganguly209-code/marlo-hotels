/**
 * Upsert SEO landing pages (Marlo-only) from scripts/seo-landing-seeds.json.
 * Regenerate that file first: `node scripts/generate-seo-landing-seeds.mjs` (or `npm run seo:generate-landings`).
 * Safe: only touches SeoLandingPage table. Existing rows are updated so new pages and copy reach production.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const seeds = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "scripts/seo-landing-seeds.json"),
    "utf8"
  )
);

async function getPrisma() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL missing");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  let PrismaClient;
  for (const file of [
    path.join(process.cwd(), "src/generated/prisma/client.js"),
    path.join(process.cwd(), "src/generated/prisma/index.js"),
  ]) {
    try {
      ({ PrismaClient } = await import(pathToFileURL(file).href));
      break;
    } catch {
      // continue
    }
  }
  if (!PrismaClient) ({ PrismaClient } = require("@prisma/client"));
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

const prisma = await getPrisma();
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
