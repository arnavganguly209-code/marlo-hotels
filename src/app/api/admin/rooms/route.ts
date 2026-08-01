import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import { ROOM_CATALOG, normalizeRoomCatalogData, type RoomCatalogData } from "@/lib/orbit/room-defaults";

async function authorized(request: Request, mutate = false) {
  const session = await getAdminSession();
  return Boolean(session) && (!mutate || (await assertSameOrigin(request)));
}

function serialize(entry: {
  id: string; module: string; key: string; title: string; slug: string | null;
  status: string; data: unknown; seo: unknown; scheduledAt: Date | null; updatedAt: Date;
}) {
  return {
    ...entry,
    data: entry.data as Record<string, unknown>,
    seo: entry.seo as Record<string, unknown> | null,
    scheduledAt: entry.scheduledAt?.toISOString() ?? null,
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const existing = await db.contentEntry.findMany({ where: { module: "rooms" } });
  const keys = new Set(existing.map((entry) => entry.key));
  const slugs = new Set(existing.map((entry) => entry.slug).filter(Boolean));
  await Promise.all(ROOM_CATALOG.filter((seed) => !keys.has(seed.key) && !slugs.has(seed.slug)).map((seed) =>
    db.contentEntry.upsert({
      where: { module_key: { module: "rooms", key: seed.key } },
      create: { module: "rooms", key: seed.key, title: seed.title, slug: seed.slug, status: "PUBLISHED", data: seed.data, publishedAt: new Date() },
      update: {},
    })
  ));
  const entries = await db.contentEntry.findMany({ where: { module: "rooms" }, orderBy: { updatedAt: "asc" } });
  return NextResponse.json({
    entries: entries.filter((entry) => entry.key !== "page-studio" && entry.key !== "page-content").map(serialize)
      .sort((a, b) => Number(a.data.sortOrder ?? 100) - Number(b.data.sortOrder ?? 100) || a.title.localeCompare(b.title)),
  });
}

export async function POST(request: Request) {
  if (!(await authorized(request, true))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as { title?: unknown; slug?: unknown; data?: unknown; seo?: unknown } | null;
  const title = typeof body?.title === "string" ? body.title.trim().slice(0, 240) : "";
  if (!title) return NextResponse.json({ error: "Room name is required" }, { status: 400 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const data = normalizeRoomCatalogData(body?.data as Partial<RoomCatalogData>);
  const key = `room-${crypto.randomUUID()}`;
  const slug =
    typeof body?.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : key;
  const entry = await db.contentEntry.create({
    data: {
      module: "rooms",
      key,
      title,
      slug,
      status: "DRAFT",
      data: {
        ...data,
        buttonLink: `/rooms/${slug}`,
        roomStatus: data.roomStatus || "hidden",
        available: false,
      } as Prisma.InputJsonValue,
      seo: body?.seo ? (body.seo as Prisma.InputJsonValue) : undefined,
    },
  });
  revalidatePath("/rooms");
  revalidatePath("/");
  return NextResponse.json({ entry: serialize(entry) }, { status: 201 });
}
