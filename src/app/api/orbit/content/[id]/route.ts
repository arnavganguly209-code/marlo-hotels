import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";

const updateSchema = z.object({
  title: z.string().min(1).max(240).optional(),
  slug: z.string().max(240).optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  seo: z.record(z.string(), z.unknown()).optional().nullable(),
  scheduledAt: z.iso.datetime().optional().nullable(),
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
      { error: "Invalid content", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const entry = await db.contentEntry.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      status: parsed.data.status,
      data: parsed.data.data
        ? (parsed.data.data as Prisma.InputJsonValue)
        : undefined,
      seo: parsed.data.seo
        ? (parsed.data.seo as Prisma.InputJsonValue)
        : undefined,
      scheduledAt:
        parsed.data.scheduledAt === undefined
          ? undefined
          : parsed.data.scheduledAt
            ? new Date(parsed.data.scheduledAt)
            : null,
      publishedAt:
        parsed.data.status === "PUBLISHED" ? new Date() : undefined,
    },
  });
  await writeAuditLog({
    action: "UPDATE",
    module: entry.module,
    entityId: entry.id,
    summary: `Updated ${entry.title}`,
  });
  return NextResponse.json({ entry });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const entry = await db.contentEntry.delete({ where: { id } });
  await writeAuditLog({
    action: "DELETE",
    module: entry.module,
    entityId: entry.id,
    summary: `Deleted ${entry.title}`,
  });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Context) {
  if (!(await authorize(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const source = await db.contentEntry.findUnique({ where: { id } });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const entry = await db.contentEntry.create({
    data: {
      module: source.module,
      key: `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      title: `${source.title} (Copy)`,
      slug: source.slug ? `${source.slug}-copy-${Date.now()}` : null,
      status: "DRAFT",
      data: source.data as Prisma.InputJsonValue,
      seo: source.seo
        ? (source.seo as Prisma.InputJsonValue)
        : undefined,
    },
  });
  await writeAuditLog({
    action: "DUPLICATE",
    module: entry.module,
    entityId: entry.id,
    summary: `Duplicated ${source.title}`,
  });
  return NextResponse.json({ entry }, { status: 201 });
}
