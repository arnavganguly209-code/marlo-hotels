/**
 * Seed / refresh published sitewide SEO entry for Orbit → SEO.
 * VPS: cd /var/www/marlo-hotels && node --env-file=.env scripts/seed-site-seo.mjs
 */
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);

async function getPrisma() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL missing");

  const { PrismaPg } = await import("@prisma/adapter-pg");
  const candidates = [
    path.join(process.cwd(), "src/generated/prisma/client.js"),
    path.join(process.cwd(), "src/generated/prisma/index.js"),
  ];

  let PrismaClient;
  for (const file of candidates) {
    try {
      ({ PrismaClient } = await import(pathToFileURL(file).href));
      break;
    } catch {
      // try next
    }
  }
  if (!PrismaClient) {
    ({ PrismaClient } = require("@prisma/client"));
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

const KEYWORDS = [
  "luxury hotel in Kathmandu",
  "luxury hotel Kathmandu Nepal",
  "luxury hotel in Thamel Kathmandu",
  "best luxury hotel in Kathmandu",
  "5 star hotel Kathmandu",
  "boutique hotel Kathmandu",
  "luxury accommodation Kathmandu",
  "hotel in Thamel Kathmandu",
  "best hotel in Thamel",
  "hotels in Kathmandu Nepal",
  "hotel near Thamel Kathmandu",
  "hotel near Kathmandu Durbar Square",
  "hotel near Garden of Dreams Kathmandu",
  "hotel near Paryatan Marg Kathmandu",
  "hotel near Kathmandu tourist attractions",
  "hotel in central Kathmandu",
  "Marlo Hotels",
  "luxury suites Kathmandu",
  "hotel spa Nepal",
].join("\n");

const META = {
  page: "site",
  metaTitle: "Marlo Hotels — Stay Beyond Extraordinary",
  metaDescription:
    "Marlo Hotels is a five-star luxury sanctuary in the heart of Kathmandu — timeless elegance, celebrated dining, restorative wellness and Himalayan hospitality.",
  keywords: KEYWORDS,
  robots: "index, follow",
};

const prisma = await getPrisma();
try {
  const existing = await prisma.contentEntry.findMany({
    where: { module: "seo" },
    select: { id: true, key: true, title: true, status: true },
  });
  console.log("existing", JSON.stringify(existing));

  const sitewide = existing.find((e) =>
    ["site", "sitewide", "global"].includes(e.key)
  );

  if (!sitewide) {
    const created = await prisma.contentEntry.create({
      data: {
        module: "seo",
        key: "site",
        title: "Sitewide SEO — Marlo Hotels",
        slug: "site",
        status: "PUBLISHED",
        publishedAt: new Date(),
        data: META,
        seo: {
          metaTitle: META.metaTitle,
          metaDescription: META.metaDescription,
          keywords: META.keywords,
          robots: META.robots,
        },
      },
    });
    console.log("created", created.id, created.title);
  } else {
    const full = await prisma.contentEntry.findUnique({
      where: { id: sitewide.id },
    });
    const data =
      full?.data && typeof full.data === "object" && !Array.isArray(full.data)
        ? full.data
        : {};
    const seo =
      full?.seo && typeof full.seo === "object" && !Array.isArray(full.seo)
        ? full.seo
        : {};
    await prisma.contentEntry.update({
      where: { id: sitewide.id },
      data: {
        title: "Sitewide SEO — Marlo Hotels",
        status: "PUBLISHED",
        publishedAt: full?.publishedAt ?? new Date(),
        data: { ...data, ...META },
        seo: {
          ...seo,
          metaTitle: META.metaTitle,
          metaDescription: META.metaDescription,
          keywords: META.keywords,
          robots: META.robots,
        },
      },
    });
    console.log("updated", sitewide.id);
  }
} finally {
  await prisma.$disconnect();
}
