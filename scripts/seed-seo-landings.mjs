/**
 * Upsert priority SEO landing pages (Marlo-only).
 * Safe: only touches SeoLandingPage table.
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
      select: { id: true },
    });
    if (!existing) {
      await prisma.seoLandingPage.create({
        data: {
          path: seed.path,
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
          publishedAt: seed.status === "PUBLISHED" ? new Date() : null,
          featuredImageUrl: "/images/brand/social-share.jpg",
          featuredImageAlt: "Marlo Hotels Kathmandu",
        },
      });
      console.log("created", seed.path);
    } else {
      console.log("exists", seed.path, "(left unchanged)");
    }
  }
} finally {
  await prisma.$disconnect();
}
