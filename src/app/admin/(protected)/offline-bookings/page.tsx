import { AdminModulePage } from "@/components/admin/admin-module-page";
import { AdminOfflineBookingsManager } from "@/components/admin/admin-offline-bookings-manager";
import { getDb } from "@/lib/db";
import { getMarloRoomCategories, listPhysicalRooms } from "@/lib/admin/physical-rooms";

export const dynamic = "force-dynamic";
export default async function AdminOfflineBookingsPage() {
  const db = getDb();
  const [categories, initialPhysicalRooms, rawBookings] = await Promise.all([
    getMarloRoomCategories(), listPhysicalRooms(),
    db ? db.booking.findMany({ where: { source: "OFFLINE" }, include: { room: { select: { name: true, slug: true } } }, orderBy: { createdAt: "desc" } }) : [],
  ]);
  const initialBookings = rawBookings.map((booking) => ({ ...booking, totalAmount: booking.totalAmount === null ? null : Number(booking.totalAmount), checkIn: booking.checkIn.toISOString(), checkOut: booking.checkOut.toISOString(), createdAt: booking.createdAt.toISOString(), updatedAt: booking.updatedAt.toISOString() }));
  return (
    <AdminModulePage
      title="Offline Bookings"
      description="Walk-in and phone reservations recorded by front-desk staff."
    >
      <AdminOfflineBookingsManager {...{ categories, initialBookings, initialPhysicalRooms }} />
    </AdminModulePage>
  );
}
