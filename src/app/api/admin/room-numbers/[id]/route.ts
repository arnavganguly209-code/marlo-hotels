import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import {
  PHYSICAL_ROOM_STATUSES,
  getMarloRoomCategories,
  serializePhysicalRoom,
  syncCategoryInventory,
  type PhysicalRoomStatusValue,
} from "@/lib/admin/physical-rooms";

type Context = { params: Promise<{ id: string }> };

async function authorized(request: Request) {
  return Boolean(await getAdminSession()) && (await assertSameOrigin(request));
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    number?: unknown;
    roomCategorySlug?: unknown;
    status?: unknown;
    notes?: unknown;
  } | null;

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const { id } = await params;
  const existing = await db.physicalRoom.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Room number not found" }, { status: 404 });
  }

  const number =
    typeof body?.number === "string"
      ? body.number.trim().toUpperCase()
      : existing.number;
  if (!number) {
    return NextResponse.json({ error: "Room number is required" }, { status: 400 });
  }

  let categorySlug = existing.roomCategorySlug;
  let categoryName = existing.roomCategoryName;
  if (typeof body?.roomCategorySlug === "string" && body.roomCategorySlug.trim()) {
    const nextSlug = body.roomCategorySlug.trim();
    const categories = await getMarloRoomCategories();
    const category = categories.find((item) => item.slug === nextSlug);
    if (!category) {
      return NextResponse.json(
        { error: "Unknown Marlo room category" },
        { status: 400 }
      );
    }
    categorySlug = category.slug;
    categoryName = category.title;
  }

  const status = (
    PHYSICAL_ROOM_STATUSES.includes(body?.status as PhysicalRoomStatusValue)
      ? body?.status
      : existing.status
  ) as PhysicalRoomStatusValue;

  const notes =
    typeof body?.notes === "string" ? body.notes.trim() : existing.notes;

  try {
    const room = await db.physicalRoom.update({
      where: { id },
      data: {
        number,
        roomCategorySlug: categorySlug,
        roomCategoryName: categoryName,
        status,
        notes,
      },
    });

    await syncCategoryInventory(existing.roomCategorySlug);
    if (categorySlug !== existing.roomCategorySlug) {
      await syncCategoryInventory(categorySlug);
    }

    revalidatePath("/admin/room-numbers");
    revalidatePath("/admin/inventory");
    revalidatePath("/rooms");
    revalidatePath(`/rooms/${existing.roomCategorySlug}`);
    if (categorySlug !== existing.roomCategorySlug) {
      revalidatePath(`/rooms/${categorySlug}`);
    }

    return NextResponse.json({ room: serializePhysicalRoom(room) });
  } catch {
    return NextResponse.json(
      { error: "That room number already exists for this category." },
      { status: 409 }
    );
  }
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
  const existing = await db.physicalRoom.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Room number not found" }, { status: 404 });
  }

  await db.physicalRoom.delete({ where: { id } });
  await syncCategoryInventory(existing.roomCategorySlug);

  revalidatePath("/admin/room-numbers");
  revalidatePath("/admin/inventory");
  revalidatePath("/rooms");
  revalidatePath(`/rooms/${existing.roomCategorySlug}`);

  return NextResponse.json({ ok: true });
}
