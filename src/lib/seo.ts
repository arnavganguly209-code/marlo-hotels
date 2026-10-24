import type { Metadata } from "next";
import { sanitizePublicCopy } from "@/lib/content-accuracy";
import { siteConfig } from "@/lib/site";
import { socialShareImageUrl } from "@/lib/social-share-image";
import { parseKeywords } from "@/lib/seo-keywords";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string | string[];
  noIndex?: boolean;
};

function brandedTitle(title: string) {
  return /\| Marlo Hotels\s*$/i.test(title)
    ? title
    : `${title} | ${siteConfig.name}`;
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  keywords,
  noIndex = false,
}: PageSeo): Metadata {
  const url = `${siteConfig.url}${path === "/" ? "" : path}` || siteConfig.url;
  const canonical = path === "/" ? `${siteConfig.url}/` : url;
  const ogImage = image ?? socialShareImageUrl(siteConfig.url);
  const keywordList = parseKeywords(keywords);
  const absoluteTitle = brandedTitle(title);

  return {
    title: { absolute: absoluteTitle },
    description,
    ...(keywordList.length ? { keywords: keywordList } : {}),
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: absoluteTitle,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type,
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: absoluteTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description,
      images: [ogImage],
    },
  };
}

export function hotelJsonLd(keywords: string[] = []) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: siteConfig.name,
    description: sanitizePublicCopy(siteConfig.description),
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/brand/logo.png`,
    image: socialShareImageUrl(siteConfig.url),
    ...(keywords.length ? { keywords: keywords.join(", ") } : {}),
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: "$$$$",
    checkinTime: "14:00",
    checkoutTime: "12:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Paryatan Marg",
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
      postalCode: "44600",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.contact.geo.lat,
      longitude: siteConfig.contact.geo.lng,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Hotel accommodation" },
      { "@type": "LocationFeatureSpecification", name: "Spa" },
      { "@type": "LocationFeatureSpecification", name: "Restaurant" },
      { "@type": "LocationFeatureSpecification", name: "Airport transfer" },
      { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi" },
    ],
    paymentAccepted: ["PayPal", "Pay at Hotel"],
    sameAs: Object.values(siteConfig.social),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  };
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url: `${siteConfig.url}${input.path === "/" ? "/" : input.path}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path === "/" ? "/" : item.path}`,
    })),
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  author: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.image,
    url: `${siteConfig.url}/blog/${post.slug}`,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/brand/logo.png`,
      },
    },
  };
}
