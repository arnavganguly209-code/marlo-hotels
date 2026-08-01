import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";

export default async function AdminNewsletterPage() {
  const db = getDb();
  const subscribers = db
    ? await db.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      })
    : [];

  return (
    <AdminModulePage
      title="Newsletter"
      description="Subscribers to The Marlo Letter."
    >
      <AdminTable
        headers={["Email", "Joined"]}
        empty="No newsletter subscribers yet."
        rows={subscribers.map((item) => [
          item.email,
          item.createdAt.toISOString().slice(0, 10),
        ])}
      />
    </AdminModulePage>
  );
}
