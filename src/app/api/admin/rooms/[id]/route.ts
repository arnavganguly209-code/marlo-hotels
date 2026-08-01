import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import { normalizeRoomCatalogData, type RoomCatalogData } from "@/lib/orbit/room-defaults";

type Context = { params: Promise<{ id: string }> };

async function authorized(request: Request) {
  return Boolean(await getAdminSession()) && (await assertSameOrigin(request));
}

function invalidate(slug?: string | null) {
  revalidatePath("/"); revalidatePath("/rooms");
  if (slug) revalidatePath(`/rooms/${slug}`);
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const previous = await db.contentEntry.findFirst({ where: { id, module: "rooms" } });
  if (!previous) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 240) : previous.title;
  if (!title) return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  const data = normalizeRoomCatalogData(body.data as Partial<RoomCatalogData>, previous.data as Partial<RoomCatalogData>);
  const roomStatus = data.roomStatus || "available";
  data.available = roomStatus === "available";
  data.roomStatus = roomStatus;
  // Draft/Archive always win so "Save Draft" can keep a room off the public site.
  const status =
    body.status === "DRAFT" || body.status === "ARCHIVED" || body.status === "SCHEDULED"
      ? body.status
      : roomStatus === "hidden"
        ? "DRAFT"
        : "PUBLISHED";
  const slug = typeof body.slug === "string" ? body.slug.trim() || null : previous.slug;
  const entry = await db.contentEntry.update({
    where: { id },
    data: {
      title, slug, status,
      data: data as Prisma.InputJsonValue,
      seo: body.seo === null ? Prisma.JsonNull : body.seo ? body.seo as Prisma.InputJsonValue : undefined,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    },
  });
  invalidate(previous.slug); invalidate(entry.slug);
  return NextResponse.json({
    entry: {
      ...entry,
      data: entry.data as Record<string, unknown>,
      seo: entry.seo as Record<string, unknown> | null,
      scheduledAt: entry.scheduledAt?.toISOString() ?? null,
      updatedAt: entry.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const entry = await db.contentEntry.findFirst({ where: { id, module: "rooms" } });
  if (!entry) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  await db.contentEntry.delete({ where: { id } });
  invalidate(entry.slug);
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: Context) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { id } = await params;
  const source = await db.contentEntry.findFirst({ where: { id, module: "rooms" } });
  if (!source) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  const entry = await db.contentEntry.create({
    data: {
      module: "rooms", key: `room-${crypto.randomUUID()}`, title: `${source.title} (Copy)`,
      slug: source.slug ? `${source.slug}-copy-${Date.now()}` : null, status: "DRAFT",
      data: source.data as Prisma.InputJsonValue,
      seo: source.seo ? source.seo as Prisma.InputJsonValue : undefined,
    },
  });
  invalidate(entry.slug);
  return NextResponse.json({ entry }, { status: 201 });
}
