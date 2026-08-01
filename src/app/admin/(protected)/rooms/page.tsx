import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";
import { formatCurrency } from "@/lib/utils";

export default async function AdminRoomsPage() {
  const db = getDb();
  const rooms = db
    ? await db.room.findMany({
        orderBy: { name: "asc" },
        select: {
          name: true,
          category: true,
          priceFrom: true,
          occupancy: true,
          published: true,
        },
      })
    : [];

  return (
    <AdminModulePage
      title="Rooms"
      description="Published and draft room inventory from the Marlo catalogue."
    >
      <AdminTable
        headers={["Room", "Category", "From", "Occupancy", "Status"]}
        empty="No rooms found in the database."
        rows={rooms.map((room) => [
          room.name,
          room.category,
          formatCurrency(Number(room.priceFrom)),
          room.occupancy,
          room.published ? "Published" : "Hidden",
        ])}
      />
    </AdminModulePage>
  );
}
