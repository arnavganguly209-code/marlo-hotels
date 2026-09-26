import { SeoLandingPagesManager } from "@/components/orbit/seo-landing-pages-manager";
import { listSeoLandingPages } from "@/lib/seo-landing/queries";

export const dynamic = "force-dynamic";

export default async function OrbitSeoLandingPagesPage() {
  const pages = await listSeoLandingPages();
  return (
    <SeoLandingPagesManager
      initialPages={pages.map((page) => ({
        id: page.id,
        path: page.path,
        title: page.title,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        h1: page.h1,
        intro: page.intro,
        body: page.body,
        faqs: page.faqs,
        locationKey: page.locationKey,
        categoryKey: page.categoryKey,
        facilityKey: page.facilityKey,
        roomFilter: page.roomFilter,
        canonicalUrl: page.canonicalUrl,
        robotsIndex: page.robotsIndex,
        enabled: page.enabled,
        status: page.status,
        featuredImageUrl: page.featuredImageUrl,
        featuredImageAlt: page.featuredImageAlt,
        relatedPaths: page.relatedPaths,
        updatedAt: page.updatedAt.toISOString(),
      }))}
    />
  );
}
