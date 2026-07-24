import type { Metadata } from "next";
import { LuxuryStudioPage } from "@/components/shared/luxury-studio-page";
import { getPageStudioDocument } from "@/lib/page-studio-content";
import { PAGE_STUDIO_SECTIONS } from "@/lib/orbit/page-studio";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("experiences");
  const seo = doc.seo;
  return buildMetadata({
    title: seo?.seoTitle || "Experiences",
    description:
      seo?.seoDescription ||
      "Private luxury experiences in Kathmandu — arranged by the Marlo Hotels concierge.",
    path: "/experiences",
  });
}

export default async function ExperiencesPage() {
  const doc = await getPageStudioDocument("experiences");
  return (
    <LuxuryStudioPage
      moduleLabel="Experiences"
      path="/experiences"
      doc={doc}
      sectionDefs={PAGE_STUDIO_SECTIONS.experiences}
    />
  );
}
