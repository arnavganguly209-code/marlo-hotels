import { AdminModulePage, AdminTable } from "@/components/admin/admin-module-page";

export default function AdminMeetingsPage() {
  return (
    <AdminModulePage
      title="Meetings"
      description="Meeting and event enquiries for Marlo conference spaces."
    >
      <AdminTable
        headers={["Organisation", "Date", "Guests", "Status"]}
        empty="No meeting enquiries yet."
        rows={[]}
      />
    </AdminModulePage>
  );
}
