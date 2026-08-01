import { AdminModulePage, AdminTable } from "@/components/admin/admin-module-page";

export default function AdminOfflineBookingsPage() {
  return (
    <AdminModulePage
      title="Offline Bookings"
      description="Walk-in and phone reservations recorded by front-desk staff."
    >
      <AdminTable
        headers={["Reference", "Guest", "Room", "Check-in", "Status"]}
        empty="No offline bookings recorded yet."
        rows={[]}
      />
    </AdminModulePage>
  );
}
