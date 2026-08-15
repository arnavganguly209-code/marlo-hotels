import { AdminOnlineBookingsManager } from "@/components/admin/admin-online-bookings-manager";
import { AdminModulePage, getDb } from "@/components/admin/admin-module-page";

export default async function AdminOnlineBookingsPage() {
  const db = getDb();
  const bookings = db
    ? await db.booking.findMany({
        where: { source: { not: "OFFLINE" } },
        orderBy: { createdAt: "desc" },
        include: { room: { select: { name: true, slug: true } } },
      })
    : [];
  const initialBookings = bookings.map((booking) => ({
    ...booking,
    totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount),
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    paidAt: booking.paidAt ? booking.paidAt.toISOString() : null,
    confirmationEmailSentAt: booking.confirmationEmailSentAt
      ? booking.confirmationEmailSentAt.toISOString()
      : null,
  }));

  return (
    <AdminModulePage
      title="Online Bookings"
      description="Manage website reservations, guest confirmation documents and payment status."
    >
      <AdminOnlineBookingsManager initialBookings={initialBookings} />
    </AdminModulePage>
  );
}
