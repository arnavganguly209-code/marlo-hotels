import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { headers } from "next/headers";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/shared/json-ld";
import { getHomepageContent } from "@/lib/homepage-content";
import { hotelJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getBrandSettings } from "@/lib/site-settings";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

function safeSiteUrl() {
  try {
    return new URL(siteConfig.url).toString().replace(/\/$/, "");
  } catch {
    return "https://marlo.theglobalorbit.com";
  }
}

const siteUrl = safeSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "luxury hotel Kathmandu",
    "5 star hotel Nepal",
    "Marlo Hotels",
    "luxury suites",
    "boutique hotel Kathmandu",
    "hotel spa Nepal",
  ],
  authors: [{ name: siteConfig.name }],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteUrl}/images/brand/hero-reference.png`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [`${siteUrl}/images/brand/hero-reference.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0c1a18",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = (await headers()).get("x-marlo-pathname") ?? "";
  const isOrbit = pathname.startsWith("/orbit");

  // Orbit routes skip brand DB lookups and hotel JSON-LD to avoid any
  // server-side exception path on the administration console.
  if (isOrbit) {
    return (
      <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
        <body className="antialiased">{children}</body>
      </html>
    );
  }

  let brand = {
    logoUrl: "/images/brand/logo.png",
    footerLogoUrl: "/images/brand/logo.png",
    faviconUrl: "/images/brand/logo.png",
  };
  let homepage: Awaited<ReturnType<typeof getHomepageContent>> | null = null;
  try {
    [brand, homepage] = await Promise.all([
      getBrandSettings(),
      getHomepageContent(),
    ]);
  } catch {
    // Keep the public shell rendering even if brand settings fail.
  }

  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="antialiased">
        <JsonLd data={hotelJsonLd()} />
        <SiteShell
          logoUrl={homepage?.hero.logo.src || brand.logoUrl}
          footerLogoUrl={brand.footerLogoUrl}
          footerContent={homepage?.footer}
          footerCtaContent={homepage?.footerCta}
          logoDisplay={homepage?.hero}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
