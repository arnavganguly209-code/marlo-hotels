import { AdminModulePage } from "@/components/admin/admin-module-page";
import { AdminPasswordForm } from "@/components/admin/admin-password-form";

export default function AdminSettingsPage() {
  return (
    <AdminModulePage
      title="Settings"
      description="Update your administration password. User ID remains fixed."
    >
      <AdminPasswordForm />
    </AdminModulePage>
  );
}
