import type { Metadata } from "next";
import { LuxuryStudioPage } from "@/components/shared/luxury-studio-page";
import { getPageStudioDocument } from "@/lib/page-studio-content";
import { PAGE_STUDIO_SECTIONS } from "@/lib/orbit/page-studio";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("spa");
  const seo = doc.seo;
  return buildMetadata({
    title: seo?.seoTitle || "Spa & Wellness",
    description:
      seo?.seoDescription ||
      "Marlo Spa — signature treatments, thermal wellness and private relaxation in Kathmandu.",
    path: "/spa",
  });
}

export default async function SpaPage() {
  const doc = await getPageStudioDocument("spa");
  return (
    <LuxuryStudioPage
      moduleLabel="Spa & Wellness"
      path="/spa"
      doc={doc}
      sectionDefs={PAGE_STUDIO_SECTIONS.spa}
    />
  );
}
