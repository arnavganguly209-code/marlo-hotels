import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
};

export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: PageSeo): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImage = image ?? `${siteConfig.url}/images/brand/hero-reference.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type,
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function hotelJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/brand/logo.png`,
    image: `${siteConfig.url}/images/brand/hero-reference.png`,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: "$$$$",
    starRating: { "@type": "Rating", ratingValue: "5" },
    checkinTime: "14:00",
    checkoutTime: "12:00",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Durbar Marg",
      addressLocality: "Kathmandu",
      postalCode: "44600",
      addressCountry: "NP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.contact.geo.lat,
      longitude: siteConfig.contact.geo.lng,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Luxury Accommodation" },
      { "@type": "LocationFeatureSpecification", name: "Luxury Spa" },
      { "@type": "LocationFeatureSpecification", name: "Fine Dining" },
      { "@type": "LocationFeatureSpecification", name: "Airport Transfer" },
      { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi" },
    ],
    paymentAccepted: [
      "Visa",
      "MasterCard",
      "American Express",
      "Alipay",
      "UnionPay",
    ],
    sameAs: Object.values(siteConfig.social),
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
      item: `${siteConfig.url}${item.path}`,
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
