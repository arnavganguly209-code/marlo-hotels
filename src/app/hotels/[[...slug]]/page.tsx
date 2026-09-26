import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { SeoLandingView } from "@/components/seo-landing/seo-landing-view";
import { getRooms } from "@/content/rooms";
import { siteConfig } from "@/lib/site";
import {
  getPublicSeoLandingPage,
  getRelatedSeoLandingPages,
} from "@/lib/seo-landing/queries";
import {
  filterRoomsForLanding,
  segmentsToPath,
} from "@/lib/seo-landing/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug?.length) {
    return { title: "Hotels in Kathmandu | Marlo Hotels" };
  }
  const path = segmentsToPath(slug);
  const page = await getPublicSeoLandingPage(path);
  if (!page) return { title: "Not found" };

  const canonical =
    page.canonicalUrl?.trim() || `${siteConfig.url}/${page.path}`;
  const image =
    page.featuredImageUrl || `${siteConfig.url}/images/brand/social-share.jpg`;

  return {
    title: { absolute: page.metaTitle },
    description: page.metaDescription,
    alternates: { canonical },
    robots: page.robotsIndex
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      siteName: siteConfig.name,
      type: "website",
      images: [{ url: image, alt: page.featuredImageAlt || page.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
      images: [image],
    },
  };
}

export default async function HotelsSeoLandingPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug?.length) {
    redirect("/hotels/kathmandu");
  }
  const path = segmentsToPath(slug);
  const page = await getPublicSeoLandingPage(path);
  if (!page) notFound();

  const [allRooms, related] = await Promise.all([
    getRooms(),
    getRelatedSeoLandingPages(page.relatedPaths),
  ]);
  const rooms = filterRoomsForLanding(allRooms, page.roomFilter);

  return (
    <SeoLandingView
      page={page}
      rooms={rooms}
      related={related.filter((item) => item.path !== page.path)}
    />
  );
}
