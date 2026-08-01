import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";

export default async function AdminRoomNumbersPage() {
  const db = getDb();
  const rooms = db
    ? await db.room.findMany({
        orderBy: { name: "asc" },
        select: { name: true, slug: true, category: true },
      })
    : [];

  return (
    <AdminModulePage
      title="Room Numbers"
      description="Physical room identifiers mapped to catalogue room types."
    >
      <AdminTable
        headers={["Room Type", "Slug", "Category", "Assigned Numbers"]}
        empty="Assign room numbers once physical inventory is configured."
        rows={rooms.map((room, index) => [
          room.name,
          room.slug,
          room.category,
          `${101 + index}, ${201 + index}`,
        ])}
      />
    </AdminModulePage>
  );
}
