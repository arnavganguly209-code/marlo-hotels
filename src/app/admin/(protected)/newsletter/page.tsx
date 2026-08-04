import {
  AdminModulePage,
  getDb,
} from "@/components/admin/admin-module-page";
import { AdminNewsletterManager } from "@/components/admin/admin-newsletter-manager";

export default async function AdminNewsletterPage() {
  const db = getDb();
  const subscribers = db
    ? await db.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
      })
    : [];

  return (
    <AdminModulePage
      title="Newsletter"
      description="Subscribers to The Marlo Letter."
    >
      <AdminNewsletterManager
        initialSubscribers={subscribers.map((item) => ({
          id: item.id,
          email: item.email,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </AdminModulePage>
  );
}
