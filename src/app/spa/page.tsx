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
    title: seo?.seoTitle || hero?.seoTitle || "Spa & Wellness",
    description:
      seo?.seoDescription ||
      hero?.seoDescription ||
      "Marlo Spa — Himalayan wellness, private treatment suites and luxury rituals in Kathmandu.",
    path: "/spa",
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

      <SpaExperience />
    </>
  );
}
