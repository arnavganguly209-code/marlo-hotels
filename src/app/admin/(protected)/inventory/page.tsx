import { AdminModulePage } from "@/components/admin/admin-module-page";
import { AdminInventoryManager } from "@/components/admin/admin-inventory-manager";
import { buildInventoryRows } from "@/lib/admin/physical-rooms";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const rows = await buildInventoryRows();

  return (
    <AdminModulePage
      title="Inventory"
      description="Live inventory for Marlo Hotels room categories — totals stay synchronized with Room Numbers."
    >
      <AdminInventoryManager initialRows={rows} />
    </AdminModulePage>
  );
}
