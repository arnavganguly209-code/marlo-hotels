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

const updateSchema = z.object({
  path: z
    .string()
    .min(3)
    .max(200)
    .regex(/^hotels\/[a-z0-9\-\/]+$/i)
    .optional(),
  title: z.string().min(1).max(200).optional(),
  metaTitle: z.string().min(1).max(200).optional(),
  metaDescription: z.string().min(1).max(500).optional(),
  h1: z.string().min(1).max(200).optional(),
  intro: z.string().min(1).max(5000).optional(),
  body: z.string().max(20000).optional(),
  faqs: z.array(faqSchema).optional(),
  locationKey: z.string().max(80).nullable().optional(),
  categoryKey: z.string().max(80).nullable().optional(),
  facilityKey: z.string().max(80).nullable().optional(),
  roomFilter: z
    .enum(["all", "featured", "suites", "rooms", "budget", "luxury"])
    .optional(),
  canonicalUrl: z.string().nullable().optional(),
  robotsIndex: z.boolean().optional(),
  enabled: z.boolean().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  featuredImageUrl: z.string().max(500).nullable().optional(),
  featuredImageAlt: z.string().max(200).nullable().optional(),
  relatedPaths: z.array(z.string().max(200)).optional(),
});

type Context = { params: Promise<{ id: string }> };

async function authorize(request: Request) {
  return (await getOrbitSession()) && (await assertSameOrigin(request));
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
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
  const { id } = await params;
  const existing = await db.seoLandingPage.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const d = parsed.data;
  const nextStatus = d.status ?? existing.status;
  const page = await db.seoLandingPage.update({
    where: { id },
    data: {
      path: d.path ? d.path.replace(/^\/+/, "").toLowerCase() : undefined,
      title: d.title,
      metaTitle: d.metaTitle,
      metaDescription: d.metaDescription,
      h1: d.h1,
      intro: d.intro,
      body: d.body,
      faqs:
        d.faqs !== undefined
          ? (d.faqs as Prisma.InputJsonValue)
          : undefined,
      locationKey: d.locationKey === undefined ? undefined : d.locationKey,
      categoryKey: d.categoryKey === undefined ? undefined : d.categoryKey,
      facilityKey: d.facilityKey === undefined ? undefined : d.facilityKey,
      roomFilter: d.roomFilter,
      canonicalUrl:
        d.canonicalUrl === undefined
          ? undefined
          : d.canonicalUrl || null,
      robotsIndex: d.robotsIndex,
      enabled: d.enabled,
      status: d.status,
      featuredImageUrl:
        d.featuredImageUrl === undefined ? undefined : d.featuredImageUrl,
      featuredImageAlt:
        d.featuredImageAlt === undefined ? undefined : d.featuredImageAlt,
      relatedPaths:
        d.relatedPaths !== undefined
          ? (d.relatedPaths as Prisma.InputJsonValue)
          : undefined,
      publishedAt:
        nextStatus === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
    },
  });

  await writeAuditLog({
    action: "UPDATE",
    module: "seo-pages",
    entityId: page.id,
    summary: `Updated SEO landing ${page.path}`,
  });
  revalidatePath(`/${existing.path}`);
  revalidatePath(`/${page.path}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/orbit/seo/pages");
  return NextResponse.json({ page });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  const page = await db.seoLandingPage.delete({ where: { id } });
  await writeAuditLog({
    action: "DELETE",
    module: "seo-pages",
    entityId: page.id,
    summary: `Deleted SEO landing ${page.path}`,
  });
  revalidatePath(`/${page.path}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/orbit/seo/pages");
  return NextResponse.json({ ok: true });
}
