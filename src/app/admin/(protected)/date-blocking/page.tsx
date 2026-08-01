import { AdminModulePage, AdminTable } from "@/components/admin/admin-module-page";

export default function AdminDateBlockingPage() {
  return (
    <AdminModulePage
      title="Date Blocking"
      description="Block unsellable dates for maintenance, private events or overbooking control."
    >
      <AdminTable
        headers={["Date Range", "Rooms", "Reason", "Status"]}
        empty="No active date blocks. Create blocks as operational needs arise."
        rows={[]}
      />
    </AdminModulePage>
  );
}
