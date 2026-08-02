import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import {
  PHYSICAL_ROOM_STATUSES,
  getMarloRoomCategories,
  listPhysicalRooms,
  serializePhysicalRoom,
  syncCategoryInventory,
  type PhysicalRoomStatusValue,
} from "@/lib/admin/physical-rooms";

async function authorized(request: Request, mutate = false) {
  const session = await getAdminSession();
  return Boolean(session) && (!mutate || (await assertSameOrigin(request)));
}

export async function GET(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = new URL(request.url).searchParams.get("slug") || undefined;
  const [categories, rooms] = await Promise.all([
    getMarloRoomCategories(),
    listPhysicalRooms(slug),
  ]);

  return NextResponse.json({ categories, rooms });
}

export async function POST(request: Request) {
  if (!(await authorized(request, true))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    number?: unknown;
    roomCategorySlug?: unknown;
    status?: unknown;
    notes?: unknown;
  } | null;

  const number =
    typeof body?.number === "string" ? body.number.trim().toUpperCase() : "";
  const slug =
    typeof body?.roomCategorySlug === "string"
      ? body.roomCategorySlug.trim()
      : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";
  const status = (
    PHYSICAL_ROOM_STATUSES.includes(body?.status as PhysicalRoomStatusValue)
      ? body?.status
      : "AVAILABLE"
  ) as PhysicalRoomStatusValue;

  if (!number) {
    return NextResponse.json({ error: "Room number is required" }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json(
      { error: "Room category is required" },
      { status: 400 }
    );
  }

  const categories = await getMarloRoomCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category) {
    return NextResponse.json(
      { error: "Unknown Marlo room category" },
      { status: 400 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  try {
    const room = await db.physicalRoom.create({
      data: {
        number,
        roomCategorySlug: category.slug,
        roomCategoryName: category.title,
        status,
        notes,
      },
    });
    await syncCategoryInventory(category.slug);
    revalidatePath("/admin/room-numbers");
    revalidatePath("/admin/inventory");
    revalidatePath("/rooms");
    revalidatePath(`/rooms/${category.slug}`);
    return NextResponse.json(
      { room: serializePhysicalRoom(room) },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "That room number already exists for this category." },
      { status: 409 }
    );
  }
}
