import { AdminInventoryManage } from "@/components/admin/admin-inventory-manage";
import { getInventoryManageGrid, resolveInventoryViewRange } from "@/lib/admin/inventory-nights";

export const dynamic = "force-dynamic";

export default async function AdminInventoryManagePage() {
  const { from, days } = resolveInventoryViewRange();
  const grid = await getInventoryManageGrid(from, days);
  return <AdminInventoryManage initialGrid={grid} />;
}
