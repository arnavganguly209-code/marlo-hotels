import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getAdminSession } from "@/lib/admin/auth";
import { RESERVED_BLOG_KEYS, serializeBlogEntry } from "@/lib/admin/articles";
import { getDb } from "@/lib/db";
import { assertSameOrigin } from "@/lib/orbit/auth";

const schema = z.object({
  title: z.string().min(1).max(240).optional(),
  slug: z.string().min(1).max(240).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  seo: z.record(z.string(), z.unknown()).optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
});
type Context = { params: Promise<{ id: string }> };

function revalidate(slug?: string | null) {
  revalidatePath("/blog"); if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/articles"); revalidatePath("/orbit/blog");
}
async function article(id: string) {
  const db = getDb(); if (!db) return [null, null] as const;
  const entry = await db.contentEntry.findUnique({ where: { id } });
  return [db, entry && entry.module === "blog" && !RESERVED_BLOG_KEYS.has(entry.key) ? entry : null] as const;
}
async function authorize(request: Request) {
  return (await getAdminSession()) && (await assertSameOrigin(request));
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorize(request))) return NextResponse.json({ error: "Unauthorized or invalid origin" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid article", issues: parsed.error.flatten() }, { status: 400 });
  const { id } = await params; const [db, current] = await article(id);
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  if (!current) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  if (parsed.data.slug && RESERVED_BLOG_KEYS.has(parsed.data.slug)) return NextResponse.json({ error: "This slug is reserved." }, { status: 400 });
  const entry = await db.contentEntry.update({ where: { id }, data: {
    title: parsed.data.title, slug: parsed.data.slug, status: parsed.data.status,
    data: parsed.data.data as Prisma.InputJsonValue | undefined,
    seo:
      parsed.data.seo === undefined
        ? undefined
        : parsed.data.seo
          ? (parsed.data.seo as Prisma.InputJsonValue)
          : Prisma.JsonNull,
    scheduledAt: parsed.data.scheduledAt === undefined ? undefined : parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : undefined,
  }});
  revalidate(current.slug); revalidate(entry.slug);
  return NextResponse.json({ entry: serializeBlogEntry(entry) });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorize(request))) return NextResponse.json({ error: "Unauthorized or invalid origin" }, { status: 401 });
  const { id } = await params; const [db, current] = await article(id);
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  if (!current) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  await db.contentEntry.delete({ where: { id } }); revalidate(current.slug);
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Context) {
  if (!(await authorize(request))) return NextResponse.json({ error: "Unauthorized or invalid origin" }, { status: 401 });
  const { id } = await params; const [db, source] = await article(id);
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  if (!source) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  const key = `${source.key}-copy-${Date.now()}`;
  const entry = await db.contentEntry.create({ data: {
    module: "blog", key, title: `${source.title} (Copy)`, slug: `${source.slug || source.key}-copy-${Date.now()}`,
    status: "DRAFT", data: source.data as Prisma.InputJsonValue,
    seo: source.seo as Prisma.InputJsonValue | undefined,
  }});
  revalidate(entry.slug);
  return NextResponse.json({ entry: serializeBlogEntry(entry) }, { status: 201 });
}
