import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { moduleBySlug } from "@/lib/orbit/modules";

const contentSchema = z.object({
  module: z.string().min(1).max(80),
  title: z.string().min(1).max(240),
  slug: z.string().max(240).optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]),
  data: z.record(z.string(), z.unknown()),
  seo: z.record(z.string(), z.unknown()).optional().nullable(),
  scheduledAt: z.iso.datetime().optional().nullable(),
});

export async function GET(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const moduleSlug = new URL(request.url).searchParams.get("module");
  if (!moduleSlug || !moduleBySlug.has(moduleSlug)) {
    return NextResponse.json({ error: "Unknown module" }, { status: 400 });
  }
  const entries = await db.contentEntry.findMany({
    where: { module: moduleSlug },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const parsed = contentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !moduleBySlug.has(parsed.data?.module ?? "")) {
    return NextResponse.json(
      { error: "Invalid content", issues: parsed.error?.flatten() },
      { status: 400 }
    );
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const entry = await db.contentEntry.create({
    data: {
      module: parsed.data.module,
      title: parsed.data.title,
      slug: parsed.data.slug,
      status: parsed.data.status,
      data: parsed.data.data as Prisma.InputJsonValue,
      seo: parsed.data.seo
        ? (parsed.data.seo as Prisma.InputJsonValue)
        : undefined,
      key,
      scheduledAt: parsed.data.scheduledAt
        ? new Date(parsed.data.scheduledAt)
        : null,
      publishedAt:
        parsed.data.status === "PUBLISHED" ? new Date() : null,
    },
  });
  await writeAuditLog({
    action: "CREATE",
    module: parsed.data.module,
    entityId: entry.id,
    summary: `Created ${entry.title}`,
  });
  revalidateTag("media");
  revalidatePath("/");
  revalidatePath(`/orbit/${parsed.data.module}`);
  return NextResponse.json({ entry }, { status: 201 });
}
