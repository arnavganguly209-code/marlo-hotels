import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPaymentsPage() {
  const db = getDb();
  const bookings = db
    ? await db.booking.findMany({
        orderBy: { updatedAt: "desc" },
        take: 50,
        select: {
          reference: true,
          guestName: true,
          paymentStatus: true,
          totalAmount: true,
          updatedAt: true,
        },
      })
    : [];

  return (
    <AdminModulePage
      title="Payments"
      description="Payment status for online reservations."
    >
      <AdminTable
        headers={["Reference", "Guest", "Amount", "Status", "Updated"]}
        empty="No payment records yet."
        rows={bookings.map((booking) => [
          booking.reference,
          booking.guestName,
          booking.totalAmount
            ? formatCurrency(Number(booking.totalAmount))
            : "—",
          booking.paymentStatus,
          booking.updatedAt.toISOString().slice(0, 10),
        ])}
      />
    </AdminModulePage>
  );
}
