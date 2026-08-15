import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import {
  buildInventoryRows,
  setCategoryInventory,
  syncAllCategoryInventories,
} from "@/lib/admin/physical-rooms";

async function authorized(request: Request, mutate = false) {
  const session = await getAdminSession();
  return Boolean(session) && (!mutate || (await assertSameOrigin(request)));
}

function revalidateInventoryPaths() {
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/room-numbers");
  revalidatePath("/admin/rooms");
  revalidatePath("/rooms");
  revalidatePath("/");
  revalidatePath("/booking");
}

export async function GET(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await buildInventoryRows();
  return NextResponse.json({ rows });
}

/** Sync sellable inventory counts into Marlo room catalogue ContentEntries. */
export async function POST(request: Request) {
  if (!(await authorized(request, true))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await syncAllCategoryInventories();
  const rows = await buildInventoryRows();
  revalidateInventoryPaths();

  return NextResponse.json({
    ok: true,
    message: "Inventory synced with room numbers.",
    rows,
  });
}

/** Set bookable inventory for one room category (online booking capacity). */
export async function PATCH(request: Request) {
  if (!(await authorized(request, true))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    slug?: unknown;
    inventory?: unknown;
  } | null;

  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  const inventory = Number(body?.inventory);
  if (!slug || !Number.isFinite(inventory) || inventory < 0) {
    return NextResponse.json(
      { error: "Valid slug and inventory (0+) are required." },
      { status: 400 }
    );
  }

  try {
    const nextInventory = await setCategoryInventory(slug, inventory);
    const rows = await buildInventoryRows();
    revalidateInventoryPaths();
    return NextResponse.json({
      ok: true,
      inventory: nextInventory,
      message: `Inventory set to ${nextInventory} for online booking.`,
      rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update inventory",
      },
      { status: 400 }
    );
  }
}
