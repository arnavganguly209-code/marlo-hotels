"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function SiteShell({
  children,
  logoUrl,
  footerLogoUrl,
}: {
  children: React.ReactNode;
  logoUrl?: string;
  footerLogoUrl?: string;
}) {
  const pathname = usePathname();
  const isOrbit = pathname.startsWith("/orbit");

  if (isOrbit) return <>{children}</>;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-gold-500 px-5 py-3 text-sm font-medium text-charcoal-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to main content
      </a>
      <Header logoUrl={logoUrl} />
      <main id="main-content">{children}</main>
      <Footer logoUrl={footerLogoUrl ?? logoUrl} />
    </>
  );
}
