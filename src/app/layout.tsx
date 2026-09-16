import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/shared/json-ld";
import { getHomepageContent } from "@/lib/homepage-content";
import { hotelJsonLd } from "@/lib/seo";
import { DEFAULT_SITE_KEYWORDS } from "@/lib/seo-keywords";
import { getSiteSeo } from "@/lib/site-seo";
import { socialShareImageUrl } from "@/lib/social-share-image";
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

export async function generateMetadata(): Promise<Metadata> {
  const siteSeo = await getSiteSeo();
  const title =
    siteSeo.metaTitle || `${siteConfig.name} — ${siteConfig.tagline}`;
  const description = siteSeo.metaDescription || siteConfig.description;
  const keywords =
    siteSeo.keywords.length > 0 ? siteSeo.keywords : DEFAULT_SITE_KEYWORDS;
  const ogImage = siteSeo.ogImageUrl || socialShareImageUrl(siteUrl);
  const canonical = siteSeo.canonicalUrl || siteUrl;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description,
    keywords,
    authors: [{ name: siteConfig.name }],
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
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
}

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
  let siteKeywords = DEFAULT_SITE_KEYWORDS;
  try {
    const [brandResult, homepageResult, paymentResult, siteSeo] =
      await Promise.all([
        getBrandSettings(),
        getHomepageContent(),
        getPaymentLogoSettings(),
        getSiteSeo(),
      ]);
    brand = brandResult;
    homepage = homepageResult;
    paymentMarks = paymentResult.marks;
    siteKeywords = siteSeo.keywords;
  } catch {
    // Keep the public shell rendering even if brand settings fail.
  }

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${libreBodoni.variable} ${dmSans.variable}`}
    >
      <body className="antialiased">
        <JsonLd data={hotelJsonLd(siteKeywords)} />
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
