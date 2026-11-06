import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import {
  applyInventoryRange,
  dateKey,
  getInventoryManageGrid,
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
  const from = url.searchParams.get("from") || dateKey(new Date());
  const days = Number(url.searchParams.get("days") || 30);
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

  const numberOrUndef = (value: unknown) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
  };
  const inventoryValue = numberOrUndef(body?.inventory);

  try {
    await upsertInventoryNight({
      slug,
      date,
      inventory:
        inventoryValue === undefined || inventoryValue === null
          ? undefined
          : Math.max(0, Math.floor(inventoryValue)),
      rate1Adult: numberOrUndef(body?.rate1Adult),
      rate2Adult: numberOrUndef(body?.rate2Adult),
      rate3Adult: numberOrUndef(body?.rate3Adult),
    });
    revalidateBookingSurfaces();
    return NextResponse.json({ ok: true });
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
  const startDate = typeof body?.startDate === "string" ? body.startDate : "";
  const endDate = typeof body?.endDate === "string" ? body.endDate : startDate;
  const inventory = Math.max(0, Math.floor(Number(body?.inventory)));
  if (!startDate || Number.isNaN(+toUtcDate(startDate))) {
    return NextResponse.json(
      { error: "A valid date range is required." },
      { status: 400 }
    );
  }

  const slugs =
    body?.slug === "__ALL__" || body?.slug === "all"
      ? (await getMarloRoomCategories()).map((item) => item.slug)
      : typeof body?.slug === "string" && body.slug.trim()
        ? [body.slug.trim()]
        : [];
  if (!slugs.length) {
    return NextResponse.json(
      { error: "Choose a room category or All rooms." },
      { status: 400 }
    );
  }

  try {
    let updated = 0;
    for (const slug of slugs) {
      updated += await applyInventoryRange({
        slug,
        startDate,
        endDate,
        inventory,
      });
    }
    revalidateBookingSurfaces();
    return NextResponse.json({ ok: true, updated });
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
