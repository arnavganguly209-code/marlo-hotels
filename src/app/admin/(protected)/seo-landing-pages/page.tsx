import { redirect } from "next/navigation";

/** @deprecated Use /admin/backlink-pages */
export default function AdminSeoLandingPagesRedirect() {
  redirect("/admin/backlink-pages");
}
