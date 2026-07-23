import { OrbitHeader } from "@/components/orbit/orbit-header";
import { OrbitShell } from "@/components/orbit/orbit-shell";
import { OrbitSidebar } from "@/components/orbit/orbit-sidebar";
import { requireOrbitSession } from "@/lib/orbit/auth";
import { isNextNavigationError, orbitLog } from "@/lib/orbit/logger";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_LOGO = "/images/brand/logo.png";

export default async function ProtectedOrbitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireOrbitSession();
  } catch (error) {
    if (isNextNavigationError(error)) throw error;
    orbitLog("error", "Protected Orbit layout session check failed", error);
    redirect("/orbit?reason=session-expired");
  }

  // Never touch the database in the protected shell — brand assets use the
  // static logo so a Prisma/env failure cannot crash the dashboard chrome.
  return (
    <OrbitShell>
      <div className="orbit-app-shell min-h-svh">
        <OrbitSidebar logoUrl={DEFAULT_LOGO} />
        <div className="min-h-svh lg:pl-[300px]">
          <OrbitHeader />
          <div className="orbit-grid min-h-[calc(100svh-5rem)] w-full max-w-none">
            {children}
          </div>
        </div>
      </div>
    </OrbitShell>
  );
}
