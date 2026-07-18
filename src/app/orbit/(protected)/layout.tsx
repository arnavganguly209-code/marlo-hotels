import { OrbitHeader } from "@/components/orbit/orbit-header";
import { OrbitSidebar } from "@/components/orbit/orbit-sidebar";
import { requireOrbitSession } from "@/lib/orbit/auth";
import { isNextNavigationError, orbitLog } from "@/lib/orbit/logger";
import { getBrandSettings } from "@/lib/site-settings";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

  let brand = {
    logoUrl: "/images/brand/logo.png",
    footerLogoUrl: "/images/brand/logo.png",
    faviconUrl: "/images/brand/logo.png",
  };
  try {
    brand = await getBrandSettings();
  } catch (error) {
    orbitLog("warn", "Brand settings unavailable in Orbit layout", error);
  }

  return (
    <div className="min-h-svh bg-[#f7f6f1] text-[#13251f]">
      <OrbitSidebar logoUrl={brand.logoUrl} />
      <div className="min-h-svh lg:pl-[286px]">
        <OrbitHeader />
        <div className="orbit-grid min-h-[calc(100svh-5rem)]">{children}</div>
      </div>
    </div>
  );
}
