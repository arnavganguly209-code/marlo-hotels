import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/shared/json-ld";
import { getHomepageContent } from "@/lib/homepage-content";
import { hotelJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getBrandSettings, getPaymentLogoSettings } from "@/lib/site-settings";
import "./globals.css";

/** Locked for Header / Homepage Hero / Footer — do not replace. */
const cormorant = localFont({
  src: [
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-500-italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-600-italic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../fonts/cormorant-garamond/cormorant-garamond-latin-700-italic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

/** Locked for Header / Homepage Hero / Footer — do not replace. */
const jost = localFont({
  src: [
    {
      path: "../fonts/jost/jost-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/jost/jost-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/jost/jost-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/jost/jost-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-jost",
  display: "swap",
  preload: true,
});

/** Luxury content headings — JW / Four Seasons serif character. */
const libreBodoni = localFont({
  src: [
    {
      path: "../fonts/libre-bodoni/libre-bodoni-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/libre-bodoni/libre-bodoni-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/libre-bodoni/libre-bodoni-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/libre-bodoni/libre-bodoni-latin-500-italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../fonts/libre-bodoni/libre-bodoni-latin-600-italic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../fonts/libre-bodoni/libre-bodoni-latin-700-italic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-libre-bodoni",
  display: "swap",
});

/** Premium content body — clean hotel brochure sans. */
const dmSans = localFont({
  src: [
    {
      path: "../fonts/dm-sans/dm-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/dm-sans/dm-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/dm-sans/dm-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/dm-sans/dm-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

function safeSiteUrl() {
  try {
    return new URL(siteConfig.url).toString().replace(/\/$/, "");
  } catch {
    return "https://marlohotels.com";
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
  const isPrintSurface = /\/print\/?$/.test(pathname);

  // Orbit routes skip brand DB lookups and hotel JSON-LD to avoid any
  // server-side exception path on the administration console.
  // Print surfaces render the booking PDF only — no public site chrome.
  if (isOrbit || isPrintSurface) {
    return (
      <html
        lang="en"
        className={`${cormorant.variable} ${jost.variable} ${libreBodoni.variable} ${dmSans.variable}`}
      >
        <body className="antialiased">{children}</body>
      </html>
    );
  }

  let brand = {
    logoUrl: "/images/brand/logo.png",
    footerLogoUrl: "/images/brand/logo.png",
    faviconUrl: "/images/brand/logo.png",
  };
  let paymentMarks: Awaited<
    ReturnType<typeof getPaymentLogoSettings>
  >["marks"] = [];
  let homepage: Awaited<ReturnType<typeof getHomepageContent>> | null = null;
  try {
    const [brandResult, homepageResult, paymentResult] = await Promise.all([
      getBrandSettings(),
      getHomepageContent(),
      getPaymentLogoSettings(),
    ]);
    brand = brandResult;
    homepage = homepageResult;
    paymentMarks = paymentResult.marks;
  } catch {
    // Keep the public shell rendering even if brand settings fail.
  }

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${libreBodoni.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        <JsonLd data={hotelJsonLd()} />
        <SiteShell
          logoUrl={homepage?.hero.logo.src || brand.logoUrl}
          footerLogoUrl={brand.footerLogoUrl}
          footerContent={homepage?.footer}
          footerCtaContent={homepage?.footerCta}
          paymentLogos={paymentMarks}
          logoDisplay={homepage?.hero}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
