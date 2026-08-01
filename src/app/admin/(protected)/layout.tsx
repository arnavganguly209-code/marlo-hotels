import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin/auth";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();
  return <AdminShell>{children}</AdminShell>;
}
