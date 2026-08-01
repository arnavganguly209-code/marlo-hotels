import { AdminModulePage, AdminTable } from "@/components/admin/admin-module-page";

export default function AdminSpaPage() {
  return (
    <AdminModulePage
      title="Spa"
      description="Spa treatments and wellness appointment overview."
    >
      <AdminTable
        headers={["Guest", "Treatment", "Date", "Status"]}
        empty="No spa bookings recorded yet."
        rows={[]}
      />
    </AdminModulePage>
  );
}
