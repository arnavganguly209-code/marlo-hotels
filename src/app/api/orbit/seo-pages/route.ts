import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";

const faqSchema = z.object({
  question: z.string().min(1).max(400),
  answer: z.string().min(1).max(4000),
});

const pageSchema = z.object({
  path: z
    .string()
    .min(3)
    .max(200)
    .regex(/^hotels\/[a-z0-9\-\/]+$/i, "Path must start with hotels/"),
  title: z.string().min(1).max(200),
  metaTitle: z.string().min(1).max(200),
  metaDescription: z.string().min(1).max(500),
  h1: z.string().min(1).max(200),
  intro: z.string().min(1).max(5000),
  body: z.string().max(20000).optional().default(""),
  faqs: z.array(faqSchema).optional().default([]),
  locationKey: z.string().max(80).nullable().optional(),
  categoryKey: z.string().max(80).nullable().optional(),
  facilityKey: z.string().max(80).nullable().optional(),
  roomFilter: z
    .enum(["all", "featured", "suites", "rooms", "budget", "luxury"])
    .optional()
    .default("all"),
  canonicalUrl: z.string().url().nullable().optional().or(z.literal("")),
  robotsIndex: z.boolean().optional().default(true),
  enabled: z.boolean().optional().default(true),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  featuredImageUrl: z.string().max(500).nullable().optional(),
  featuredImageAlt: z.string().max(200).nullable().optional(),
  relatedPaths: z.array(z.string().max(200)).optional().default([]),
});

async function authorize(request: Request) {
  return (await getOrbitSession()) && (await assertSameOrigin(request));
}

export async function GET() {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  try {
    const pages = await db.seoLandingPage.findMany({
      orderBy: { path: "asc" },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json(
      {
        error: "SeoLandingPage table unavailable",
        detail: error instanceof Error ? error.message : "unknown",
      },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = pageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const data = parsed.data;
  const path = data.path.replace(/^\/+/, "").toLowerCase();
  const page = await db.seoLandingPage.create({
    data: {
      path,
      title: data.title,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      h1: data.h1,
      intro: data.intro,
      body: data.body || "",
      faqs: data.faqs as Prisma.InputJsonValue,
      locationKey: data.locationKey || null,
      categoryKey: data.categoryKey || null,
      facilityKey: data.facilityKey || null,
      roomFilter: data.roomFilter || "all",
      canonicalUrl: data.canonicalUrl || null,
      robotsIndex: data.robotsIndex ?? true,
      enabled: data.enabled ?? true,
      status: data.status,
      featuredImageUrl: data.featuredImageUrl || null,
      featuredImageAlt: data.featuredImageAlt || null,
      relatedPaths: data.relatedPaths as Prisma.InputJsonValue,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  await writeAuditLog({
    action: "CREATE",
    module: "seo-pages",
    entityId: page.id,
    summary: `Created SEO landing ${page.path}`,
  });
  revalidatePath(`/${page.path}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/orbit/seo/pages");
  return NextResponse.json({ page }, { status: 201 });
}
