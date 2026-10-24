import type { Metadata } from "next";
import { SpaExperience } from "@/components/spa/spa-experience";
import { PageHero } from "@/components/shared/page-hero";
import { getPageStudioDocument } from "@/lib/page-studio-content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("spa");
  const seo = doc.seo;
  const hero = doc.hero;
  return buildMetadata({
    title: seo?.seoTitle || hero?.seoTitle || "Spa & Wellness in Kathmandu",
    description:
      seo?.seoDescription ||
      hero?.seoDescription ||
      "Spa and wellness at Marlo Hotels in Thamel, Kathmandu. See current treatments, massage and recovery experiences offered at the hotel.",
    path: "/spa",
    keywords:
      seo?.seoKeywords ||
      "spa in Kathmandu, hotel spa in Kathmandu, spa in Thamel, massage and spa Kathmandu",
  });
}

export default async function SpaPage() {
  const doc = await getPageStudioDocument("spa");
  const hero = doc.hero;

  return (
    <>
      {/* Hero cover — Orbit / studio image unchanged */}
      <PageHero
        eyebrow={hero?.eyebrow || "Spa & Wellness"}
        title={hero?.heading || "A sanctuary of stillness"}
        description={hero?.description}
        image={{
          src: hero?.image?.src || "",
          alt: hero?.image?.alt || "Marlo Spa",
        }}
        videoUrl={hero?.videoUrl || undefined}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Spa & Wellness", href: "/spa" },
        ]}
      />

      <SpaExperience doc={doc} />
    </>
  );
}
