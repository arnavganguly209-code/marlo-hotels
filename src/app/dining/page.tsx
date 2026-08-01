import type { Metadata } from "next";
import {
  DiningExperience,
  type DiningMealStep,
} from "@/components/dining/dining-experience";
import { PageHero } from "@/components/shared/page-hero";
import { getHomepageContent } from "@/lib/homepage-content";
import {
  getPageStudioDocument,
  sectionHours,
} from "@/lib/page-studio-content";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("dining");
  const seo = doc.seo;
  const hero = doc.hero;
  return buildMetadata({
    title: seo?.seoTitle || hero?.seoTitle || "Dining",
    description:
      seo?.seoDescription ||
      hero?.seoDescription ||
      "Elegant dining at Marlo Hotels — fresh cuisine, peaceful atmosphere and international hospitality in Kathmandu.",
    path: "/dining",
  });
}

type HourRow = { label: string; hours: string };

function findHours(rows: HourRow[], ...needles: string[]) {
  for (const needle of needles) {
    const hit = rows.find((row) =>
      row.label.toLowerCase().includes(needle.toLowerCase())
    );
    if (hit?.hours?.trim()) return hit.hours.trim();
  }
  return "";
}

async function resolveMealTimeline(): Promise<DiningMealStep[]> {
  const [diningDoc, homepage] = await Promise.all([
    getPageStudioDocument("dining"),
    getHomepageContent(),
  ]);

  const fromOpening = sectionHours(diningDoc.hours);
  const fromBreakfast = sectionHours(diningDoc.breakfast);
  const fromHome = (homepage.breakfast?.timings || []).map((item) => ({
    label: item.label,
    hours: item.hours,
  }));

  const rows: HourRow[] = [...fromOpening, ...fromBreakfast, ...fromHome];

  const details: Record<string, string> = {
    Breakfast:
      "An unhurried start — eggs to order, regional breads and coffee for the valley morning.",
    Lunch:
      "A calm midday table — light plates, Nepali favourites and international comforts.",
    "Evening Tea":
      "A soft pause between afternoon and dinner — fresh tea, coffee and quiet seating.",
    Dinner:
      "Evening service with considered pacing — fresh ingredients and warm hospitality.",
  };

  return (
    [
      {
        step: "Breakfast",
        hours: findHours(rows, "breakfast"),
        detail: details.Breakfast,
      },
      {
        step: "Lunch",
        hours: findHours(rows, "lunch"),
        detail: details.Lunch,
      },
      {
        step: "Evening Tea",
        hours: findHours(rows, "evening tea", "high tea", "tea"),
        detail: details["Evening Tea"],
      },
      {
        step: "Dinner",
        hours: findHours(rows, "dinner"),
        detail: details.Dinner,
      },
    ] satisfies DiningMealStep[]
  ).map((item) => ({
    ...item,
    // Never invent clock times — leave blank if CMS has no matching hours.
    hours: item.hours,
  }));
}

export default async function DiningPage() {
  const [doc, mealTimeline] = await Promise.all([
    getPageStudioDocument("dining"),
    resolveMealTimeline(),
  ]);
  const hero = doc.hero;

  return (
    <>
      {/* Hero cover — Orbit / studio image unchanged */}
      <PageHero
        eyebrow={hero?.eyebrow || "Dining"}
        title={hero?.heading || "Tables worth travelling for"}
        description={hero?.description}
        image={{
          src: hero?.image?.src || "",
          alt: hero?.image?.alt || "Dining at Marlo Hotels",
        }}
        videoUrl={hero?.videoUrl || undefined}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Dining", href: "/dining" },
        ]}
      />

      <DiningExperience doc={doc} mealTimeline={mealTimeline} />
    </>
  );
}
