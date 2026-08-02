import { AdminModulePage } from "@/components/admin/admin-module-page";
import { AdminDateBlockingManager } from "@/components/admin/admin-date-blocking-manager";
import { getDb } from "@/lib/db";
import { getMarloRoomCategories, listPhysicalRooms } from "@/lib/admin/physical-rooms";

export const dynamic = "force-dynamic";
export default async function AdminDateBlockingPage() {
  const db = getDb();
  const [initialCategories, initialPhysicalRooms, rawBlocks] = await Promise.all([
    getMarloRoomCategories(), listPhysicalRooms(),
    db ? db.dateBlock.findMany({ orderBy: [{ startDate: "asc" }, { createdAt: "desc" }] }).catch(() => []) : [],
  ]);
  const initialBlocks = rawBlocks.map((block) => ({ ...block, startDate: block.startDate.toISOString(), endDate: block.endDate.toISOString() }));
  return (
    <AdminModulePage
      title="Date Blocking"
      description="Block unsellable dates for maintenance, private events or overbooking control."
    >
      <AdminDateBlockingManager {...{ initialCategories, initialBlocks, initialPhysicalRooms }} />
    </AdminModulePage>
  );
}
