import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import { getRooms } from "@/content/rooms";
import {
  applyInventoryRangeBulk,
  clearInventoryRangeBulk,
  deleteInventoryNight,
  getInventoryManageDay,
  getInventoryManageGrid,
  resolveInventoryViewRange,
  toUtcDate,
  upsertInventoryNight,
} from "@/lib/admin/inventory-nights";
import { getMarloRoomCategories } from "@/lib/admin/physical-rooms";

async function authorized(request: Request, mutate = false) {
  return Boolean(await getAdminSession()) && (!mutate || (await assertSameOrigin(request)));
}

function revalidateBookingSurfaces() {
  revalidatePath("/admin/inventory-manage");
  revalidatePath("/admin/inventory");
  revalidatePath("/booking");
  revalidatePath("/rooms");
}

export async function GET(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const rawFrom = url.searchParams.get("from") || undefined;
  const rawDays = url.searchParams.get("days");
  const daysParsed = rawDays === null ? undefined : Number(rawDays);
  const { from, days } = resolveInventoryViewRange(
    rawFrom,
    Number.isFinite(daysParsed) ? daysParsed : undefined
  );
  try {
    const grid = await getInventoryManageGrid(from, days);
    return NextResponse.json({ grid });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load inventory";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}

export async function PATCH(request: Request) {
  if (!(await authorized(request, true))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const date = typeof body?.date === "string" ? body.date.trim() : "";
  if (!slug || !date) {
    return NextResponse.json(
      { error: "Room category and date are required." },
      { status: 400 }
    );
  }
  if (Number.isNaN(+toUtcDate(date))) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  const numberOrUndef = (value: unknown) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
  };
  const hasInventoryKey =
    body !== null && typeof body === "object" && "inventory" in body;
  const inventoryValue = hasInventoryKey
    ? numberOrUndef(body?.inventory)
    : undefined;
  const rate1Adult = numberOrUndef(body?.rate1Adult);
  const rate2Adult = numberOrUndef(body?.rate2Adult);
  const rate3Adult = numberOrUndef(body?.rate3Adult);
  const hasRateKey =
    rate1Adult !== undefined ||
    rate2Adult !== undefined ||
    rate3Adult !== undefined;

  if (!hasInventoryKey && !hasRateKey) {
    return NextResponse.json(
      { error: "Nothing to save — send inventory or a rate." },
      { status: 400 }
    );
  }
  if (
    hasInventoryKey &&
    inventoryValue !== null &&
    inventoryValue !== undefined &&
    inventoryValue < 0
  ) {
    return NextResponse.json(
      { error: "Inventory cannot be negative." },
      { status: 400 }
    );
  }

  try {
    if (hasInventoryKey && inventoryValue === null) {
      await deleteInventoryNight(slug, date);
    } else {
      await upsertInventoryNight({
        slug,
        date,
        inventory:
          inventoryValue === undefined || inventoryValue === null
            ? undefined
            : Math.max(0, Math.floor(inventoryValue)),
        rate1Adult,
        rate2Adult,
        rate3Adult,
      });
    }
    revalidateBookingSurfaces();
    // Echo the authoritative stored night so the cell can confirm the save.
    const day = await getInventoryManageDay(slug, date);
    return NextResponse.json({ ok: true, day });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save allotment",
      },
      { status: 422 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await authorized(request, true))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  const startDate = typeof body?.startDate === "string" ? body.startDate.trim() : "";
  const endDate =
    typeof body?.endDate === "string" && body.endDate.trim()
      ? body.endDate.trim()
      : startDate;
  const clearOverrides = body?.clearOverrides === true;
  const inventoryRaw = Number(body?.inventory);
  if (!clearOverrides && !Number.isFinite(inventoryRaw)) {
    return NextResponse.json(
      { error: "Enter an inventory value to apply." },
      { status: 400 }
    );
  }
  const inventory = clearOverrides
    ? 0
    : Math.max(0, Math.floor(inventoryRaw));
  if (!startDate || Number.isNaN(+toUtcDate(startDate))) {
    return NextResponse.json(
      { error: "A valid date range is required." },
      { status: 400 }
    );
  }
  if (Number.isNaN(+toUtcDate(endDate))) {
    return NextResponse.json({ error: "Invalid end date." }, { status: 400 });
  }

  const requestedAll = body?.slug === "__ALL__" || body?.slug === "all";
  let slugs: string[];
  if (requestedAll) {
    slugs = (await getRooms())
      .filter((room) => room.published !== false)
      .map((room) => room.slug);
    if (!slugs.length) {
      slugs = (await getMarloRoomCategories()).map((item) => item.slug);
    }
  } else {
    slugs = typeof body?.slug === "string" && body.slug.trim()
      ? [body.slug.trim()]
      : [];
  }
  if (!slugs.length) {
    return NextResponse.json(
      { error: "Choose a room category or All rooms." },
      { status: 400 }
    );
  }

  try {
    if (clearOverrides) {
      const updated = await clearInventoryRangeBulk({
        slugs,
        startDate,
        endDate,
      });
      revalidateBookingSurfaces();
      return NextResponse.json({ ok: true, updated, categories: slugs.length });
    }
    const updated = await applyInventoryRangeBulk({
      slugs,
      startDate,
      endDate,
      inventory,
    });
    revalidateBookingSurfaces();
    return NextResponse.json({
      ok: true,
      updated,
      categories: slugs.length,
      inventory,
      startDate,
      endDate,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not apply allotment",
      },
      { status: 422 }
    );
  }
}
