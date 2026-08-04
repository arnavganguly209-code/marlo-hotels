import {
  AdminModulePage,
  getDb,
} from "@/components/admin/admin-module-page";
import {
  AdminInquiriesManager,
  type InquiryRow,
} from "@/components/admin/admin-inquiries-manager";
import { Prisma } from "@/generated/prisma/client";

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

export default async function AdminSpaPage() {
  const db = getDb();
  const where: Prisma.ContactMessageWhereInput = {
    OR: [
      { subject: { contains: "spa", mode: "insensitive" } },
      { subject: { contains: "wellness", mode: "insensitive" } },
      { subject: { contains: "treatment", mode: "insensitive" } },
      { message: { contains: "spa", mode: "insensitive" } },
    ],
  };
  const messages = db
    ? await db.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    : [];

  return (
    <AdminModulePage
      title="Spa"
      description="Spa and wellness enquiries submitted through the website."
    >
      <AdminInquiriesManager
        initialMessages={messages.map(toRow)}
        emptyLabel="No spa enquiries yet."
      />
    </AdminModulePage>
  );
}
