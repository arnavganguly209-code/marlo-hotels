import {
  AdminModulePage,
  getDb,
} from "@/components/admin/admin-module-page";
import {
  AdminInquiriesManager,
  type InquiryRow,
} from "@/components/admin/admin-inquiries-manager";

function toRow(message: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
}): InquiryRow {
  return {
    id: message.id,
    name: message.name,
    email: message.email,
    phone: message.phone,
    country: message.country,
    subject: message.subject,
    message: message.message,
    status: message.status,
    createdAt: message.createdAt.toISOString(),
  };
}

export default async function AdminContactMessagesPage() {
  const db = getDb();
  const messages = db
    ? await db.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    : [];

  return (
    <AdminModulePage
      title="Contact Messages"
      description="Every website inquiry, contact, and request submitted through Marlo forms."
    >
      <AdminInquiriesManager
        initialMessages={messages.map(toRow)}
        emptyLabel="No contact messages yet."
      />
    </AdminModulePage>
  );
}
