import {
  AdminModulePage,
  AdminTable,
  getDb,
} from "@/components/admin/admin-module-page";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOnlineBookingsPage() {
  const db = getDb();
  const bookings = db
    ? await db.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { room: { select: { name: true } } },
      })
    : [];

  return (
    <AdminModulePage
      title="Online Bookings"
      description="Website reservations captured through the Marlo booking engine."
    >
      <AdminTable
        headers={[
          "Reference",
          "Guest",
          "Room",
          "Check-in",
          "Status",
          "Total",
        ]}
        empty="No online bookings yet."
        rows={bookings.map((booking) => [
          booking.reference,
          booking.guestName,
          booking.room.name,
          booking.checkIn.toISOString().slice(0, 10),
          booking.status,
          booking.totalAmount
            ? formatCurrency(Number(booking.totalAmount))
            : "—",
        ])}
      />
    </AdminModulePage>
  );
}
