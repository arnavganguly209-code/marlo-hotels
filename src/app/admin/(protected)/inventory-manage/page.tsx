import { AdminInventoryManage } from "@/components/admin/admin-inventory-manage";
import { dateKey, getInventoryManageGrid } from "@/lib/admin/inventory-nights";

export const dynamic = "force-dynamic";

export default async function AdminInventoryManagePage() {
  const from = dateKey(new Date());
  const grid = await getInventoryManageGrid(from, 30);
  return <AdminInventoryManage initialGrid={grid} />;
}
