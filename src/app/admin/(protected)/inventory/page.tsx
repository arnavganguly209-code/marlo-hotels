import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";

export default async function AdminInventoryPage() {
  const db = getDb();
  const rooms = db
    ? await db.room.findMany({
        orderBy: { name: "asc" },
        select: { name: true, published: true, featured: true },
      })
    : [];

  return (
    <AdminModulePage
      title="Inventory"
      description="Availability overview for sellable room inventory."
    >
      <AdminTable
        headers={["Room", "Listed", "Featured", "Sellable Units"]}
        empty="No inventory records yet."
        rows={rooms.map((room) => [
          room.name,
          room.published ? "Yes" : "No",
          room.featured ? "Yes" : "No",
          room.published ? "Open" : "Closed",
        ])}
      />
    </AdminModulePage>
  );
}
