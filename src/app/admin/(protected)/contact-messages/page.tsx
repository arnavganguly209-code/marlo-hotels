import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";

export default async function AdminContactMessagesPage() {
  const db = getDb();
  const messages = db
    ? await db.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <AdminModulePage
      title="Contact Messages"
      description="Inquiries submitted through the website contact form."
    >
      <AdminTable
        headers={["Name", "Email", "Subject", "Status", "Received"]}
        empty="No contact messages yet."
        rows={messages.map((message) => [
          message.name,
          message.email,
          message.subject || "—",
          message.status,
          message.createdAt.toISOString().slice(0, 10),
        ])}
      />
    </AdminModulePage>
  );
}
