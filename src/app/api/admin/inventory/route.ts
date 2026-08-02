import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { assertSameOrigin } from "@/lib/orbit/auth";
import {
  buildInventoryRows,
  syncAllCategoryInventories,
} from "@/lib/admin/physical-rooms";

async function authorized(request: Request, mutate = false) {
  const session = await getAdminSession();
  return Boolean(session) && (!mutate || (await assertSameOrigin(request)));
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

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/room-numbers");
  revalidatePath("/rooms");
  revalidatePath("/");

  return NextResponse.json({
    ok: true,
    message: "Inventory synced with room numbers.",
    rows,
  });
}
