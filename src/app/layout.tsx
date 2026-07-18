import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/shared/json-ld";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
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
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/images/brand/hero-reference.png`,
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
    images: [`${siteConfig.url}/images/brand/hero-reference.png`],
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
  let brand = {
    logoUrl: "/images/brand/logo.png",
    footerLogoUrl: "/images/brand/logo.png",
    faviconUrl: "/images/brand/logo.png",
  };
  try {
    brand = await getBrandSettings();
  } catch {
    // Keep the public shell rendering even if brand settings fail.
  }

  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="antialiased">
        <JsonLd data={hotelJsonLd()} />
        <SiteShell
          logoUrl={brand.logoUrl}
          footerLogoUrl={brand.footerLogoUrl}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
