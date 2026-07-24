"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import type { PaymentLogoMark } from "@/components/shared/payment-marks";
import type {
  FooterCtaEditorContent,
  FooterEditorContent,
  HeroEditorContent,
} from "@/lib/homepage-content";

export function SiteShell({
  children,
  logoUrl,
  footerLogoUrl,
  footerContent,
  footerCtaContent,
  paymentLogos,
  logoDisplay,
}: {
  children: React.ReactNode;
  logoUrl?: string;
  footerLogoUrl?: string;
  footerContent?: FooterEditorContent;
  footerCtaContent?: FooterCtaEditorContent;
  paymentLogos?: PaymentLogoMark[];
  logoDisplay?: Pick<
    HeroEditorContent,
    | "logoDesktopWidth"
    | "logoTabletWidth"
    | "logoMobileWidth"
    | "logoLeftMargin"
    | "logoTopMargin"
    | "logoOpacity"
  >;
}) {
  const pathname = usePathname() ?? "";
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
      <Header
        logoUrl={logoUrl}
        logoDisplay={
          logoDisplay
            ? {
                desktopWidth: logoDisplay.logoDesktopWidth,
                tabletWidth: logoDisplay.logoTabletWidth,
                mobileWidth: logoDisplay.logoMobileWidth,
                leftMargin: logoDisplay.logoLeftMargin,
                topMargin: logoDisplay.logoTopMargin,
                opacity: logoDisplay.logoOpacity,
              }
            : undefined
        }
      />
      <main id="main-content">{children}</main>
      <Footer
        logoUrl={footerLogoUrl ?? logoUrl}
        content={footerContent}
        ctaContent={footerCtaContent}
        paymentLogos={paymentLogos}
      />
    </>
  );
}
