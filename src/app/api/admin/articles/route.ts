import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getAdminSession } from "@/lib/admin/auth";
import { listBlogArticles, RESERVED_BLOG_KEYS, serializeBlogEntry } from "@/lib/admin/articles";
import { getDb } from "@/lib/db";
import { assertSameOrigin } from "@/lib/orbit/auth";

const schema = z.object({
  title: z.string().min(1).max(240),
  slug: z.string().min(1).max(240).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  data: z.record(z.string(), z.unknown()),
  seo: z.record(z.string(), z.unknown()).optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
});

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function revalidate(slug?: string | null) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/articles");
  revalidatePath("/orbit/blog");
}

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ entries: await listBlogArticles() });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await assertSameOrigin(request))) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid article", issues: parsed.error.flatten() }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const slug = slugify(parsed.data.slug || parsed.data.title);
  if (!slug || RESERVED_BLOG_KEYS.has(slug)) return NextResponse.json({ error: "This slug is reserved." }, { status: 400 });
  const entry = await db.contentEntry.create({
    data: {
      module: "blog", key: slug, title: parsed.data.title, slug,
      status: parsed.data.status, data: parsed.data.data as Prisma.InputJsonValue,
      seo: parsed.data.seo as Prisma.InputJsonValue | undefined,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  revalidate(slug);
  return NextResponse.json({ entry: serializeBlogEntry(entry) }, { status: 201 });
}
