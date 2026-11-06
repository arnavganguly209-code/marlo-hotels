import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import {
  getMarloRoomCategories,
  listPhysicalRooms,
} from "@/lib/admin/physical-rooms";
import {
  ALL_ROOMS_BLOCK_NAME,
  ALL_ROOMS_BLOCK_SLUG,
  DATE_BLOCK_REASONS,
  isHotelWideDateBlock,
  type DateBlockReasonValue,
} from "@/lib/admin/pms-public";
import { assertSameOrigin } from "@/lib/orbit/auth";

type Context = { params: Promise<{ id: string }> };

async function authorized(request: Request) {
  return Boolean(await getAdminSession()) && (await assertSameOrigin(request));
}

function revalidate() {
  revalidatePath("/admin/date-blocking");
  revalidatePath("/rooms");
  revalidatePath("/booking");
}

function parseDateOnly(value: unknown, fallback: Date) {
  if (typeof value !== "string" || !value.trim()) return fallback;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) {
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }
  const date = new Date(value);
  return Number.isNaN(+date) ? fallback : date;
}

function serialize<T extends { startDate: Date; endDate: Date }>(block: T) {
  return {
    ...block,
    startDate: block.startDate.toISOString(),
    endDate: block.endDate.toISOString(),
  };
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const existing = await db.dateBlock.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Date block not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const slug =
    typeof body?.roomCategorySlug === "string" && body.roomCategorySlug.trim()
      ? body.roomCategorySlug.trim()
      : existing.roomCategorySlug;
  const hotelWide = isHotelWideDateBlock(slug);
  const category = hotelWide
    ? { slug: ALL_ROOMS_BLOCK_SLUG, title: ALL_ROOMS_BLOCK_NAME }
    : (await getMarloRoomCategories()).find((item) => item.slug === slug);
  if (!category) {
    return NextResponse.json(
      { error: "Unknown Marlo room category." },
      { status: 400 }
    );
  }

  const startDate = parseDateOnly(body?.startDate, existing.startDate);
  const endDate = parseDateOnly(body?.endDate, existing.endDate);
  const reason =
    body?.reason === undefined
      ? existing.reason
      : (body.reason as DateBlockReasonValue);

  if (
    Number.isNaN(+startDate) ||
    Number.isNaN(+endDate) ||
    endDate < startDate ||
    !DATE_BLOCK_REASONS.includes(reason)
  ) {
    return NextResponse.json(
      { error: "Invalid date block update." },
      { status: 400 }
    );
  }

  const number = hotelWide
    ? null
    : body?.physicalRoomNumber === undefined
      ? existing.physicalRoomNumber
      : typeof body.physicalRoomNumber === "string" &&
          body.physicalRoomNumber.trim()
        ? body.physicalRoomNumber.trim().toUpperCase()
        : null;

  if (
    number &&
    !(await listPhysicalRooms(slug)).some(
      (room) => room.number.toUpperCase() === number
    )
  ) {
    return NextResponse.json(
      { error: "Physical room number does not belong to this category." },
      { status: 400 }
    );
  }

  const block = await db.dateBlock.update({
    where: { id },
    data: {
      roomCategorySlug: category.slug,
      roomCategoryName: category.title,
      physicalRoomNumber: number,
      startDate,
      endDate,
      reason,
      notes:
        typeof body?.notes === "string" ? body.notes.trim() : existing.notes,
      createdBy:
        typeof body?.createdBy === "string"
          ? body.createdBy.trim() || null
          : existing.createdBy,
      status:
        body?.status === "CANCELLED"
          ? "CANCELLED"
          : body?.status === "ACTIVE"
            ? "ACTIVE"
            : existing.status,
    },
  });

  revalidate();
  return NextResponse.json({ block: serialize(block) });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const { id } = await params;
  await db.dateBlock
    .update({ where: { id }, data: { status: "CANCELLED" } })
    .catch(() => null);
  revalidate();
  return NextResponse.json({ ok: true });
}
