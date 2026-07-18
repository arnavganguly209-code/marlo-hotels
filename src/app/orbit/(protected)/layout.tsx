import { OrbitHeader } from "@/components/orbit/orbit-header";
import { OrbitSidebar } from "@/components/orbit/orbit-sidebar";
import { requireOrbitSession } from "@/lib/orbit/auth";
import { getBrandSettings } from "@/lib/site-settings";

export default async function ProtectedOrbitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOrbitSession();
  const brand = await getBrandSettings();

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
