import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";

export default async function AdminRestaurantPage() {
  const db = getDb();
  const restaurants = db
    ? await db.restaurant.findMany({
        orderBy: { name: "asc" },
        select: {
          name: true,
          cuisine: true,
          hours: true,
          published: true,
        },
      })
    : [];

  return (
    <AdminModulePage
      title="Restaurant"
      description="Dining venues published on the Marlo website."
    >
      <AdminTable
        headers={["Venue", "Cuisine", "Hours", "Status"]}
        empty="No restaurants configured."
        rows={restaurants.map((item) => [
          item.name,
          item.cuisine,
          item.hours,
          item.published ? "Live" : "Hidden",
        ])}
      />
    </AdminModulePage>
  );
}
