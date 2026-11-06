import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import { getMarloRoomCategories, listPhysicalRooms } from "@/lib/admin/physical-rooms";
import {
  ALL_ROOMS_BLOCK_NAME,
  ALL_ROOMS_BLOCK_SLUG,
  DATE_BLOCK_REASONS,
  isHotelWideDateBlock,
  type DateBlockReasonValue,
} from "@/lib/admin/pms-public";
import { assertSameOrigin } from "@/lib/orbit/auth";

async function authorized(request: Request, mutate = false) {
  return Boolean(await getAdminSession()) && (!mutate || (await assertSameOrigin(request)));
}

function serialize<T extends { startDate: Date; endDate: Date }>(block: T) {
  return { ...block, startDate: block.startDate.toISOString(), endDate: block.endDate.toISOString() };
}

function parseDateOnly(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) {
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }
  const date = new Date(value);
  return Number.isNaN(+date) ? null : date;
}

function revalidateListing() {
  revalidatePath("/admin/date-blocking");
  revalidatePath("/rooms");
  revalidatePath("/booking");
}

export async function GET(request: Request) {
  if (!(await authorized(request))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ blocks: [] });
  const status = new URL(request.url).searchParams.get("status");
  const blocks = await db.dateBlock.findMany({
    where: status === "all" ? undefined : { status: status === "CANCELLED" ? "CANCELLED" : "ACTIVE" },
    orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ blocks: blocks.map(serialize) });
}

export async function POST(request: Request) {
  if (!(await authorized(request, true))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const slug = typeof body?.roomCategorySlug === "string" ? body.roomCategorySlug.trim() : "";
  const startDate = parseDateOnly(body?.startDate);
  const endDate = parseDateOnly(body?.endDate);
  const reason = body?.reason as DateBlockReasonValue;
  if (!slug || !startDate || !endDate || endDate < startDate) {
    return NextResponse.json({ error: "Provide a valid category and date range." }, { status: 400 });
  }
  if (!DATE_BLOCK_REASONS.includes(reason)) return NextResponse.json({ error: "Invalid block reason." }, { status: 400 });

  const hotelWide = isHotelWideDateBlock(slug);
  const category = hotelWide
    ? { slug: ALL_ROOMS_BLOCK_SLUG, title: ALL_ROOMS_BLOCK_NAME }
    : (await getMarloRoomCategories()).find((item) => item.slug === slug);
  if (!category) return NextResponse.json({ error: "Unknown Marlo room category." }, { status: 400 });

  const number =
    hotelWide
      ? null
      : typeof body?.physicalRoomNumber === "string" && body.physicalRoomNumber.trim()
        ? body.physicalRoomNumber.trim().toUpperCase()
        : null;
  if (number && !(await listPhysicalRooms(slug)).some((room) => room.number.toUpperCase() === number)) {
    return NextResponse.json({ error: "Physical room number does not belong to this category." }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  try {
    const block = await db.dateBlock.create({
      data: {
        roomCategorySlug: category.slug,
        roomCategoryName: category.title,
        physicalRoomNumber: number,
        startDate,
        endDate,
        reason,
        notes: typeof body?.notes === "string" ? body.notes.trim() : "",
        createdBy: typeof body?.createdBy === "string" ? body.createdBy.trim() : null,
      },
    });
    revalidateListing();
    return NextResponse.json({ block: serialize(block) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save date block";
    console.error("[admin] date-block create failed", { error: message });
    return NextResponse.json({ error: "Could not save date block." }, { status: 422 });
  }
}
