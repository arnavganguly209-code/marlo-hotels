import type { Metadata } from "next";
import { LuxuryStudioPage } from "@/components/shared/luxury-studio-page";
import { getPageStudioDocument } from "@/lib/page-studio-content";
import { PAGE_STUDIO_SECTIONS } from "@/lib/orbit/page-studio";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("dining");
  const seo = doc.seo;
  return buildMetadata({
    title: seo?.seoTitle || "Dining",
    description:
      seo?.seoDescription ||
      "Fine dining and breakfast at Marlo Hotels — contemporary Himalayan cuisine and private dining.",
    path: "/dining",
  });
}

export default async function DiningPage() {
  const doc = await getPageStudioDocument("dining");
  return (
    <LuxuryStudioPage
      moduleLabel="Dining"
      path="/dining"
      doc={doc}
      sectionDefs={PAGE_STUDIO_SECTIONS.dining}
    />
  );
}
