import { getDb } from "@/lib/db";
import { getStudioDefaults } from "@/lib/orbit/page-studio-defaults";
import {
  emptyStudioSection,
  PAGE_STUDIO_SECTIONS,
  parseFaqLines,
  parseLines,
  parseTitledLines,
  type StudioSectionData,
} from "@/lib/orbit/page-studio";

export type PageStudioDocument = Record<string, StudioSectionData>;

function mergeSection(
  base: StudioSectionData,
  saved?: Partial<StudioSectionData> | null
): StudioSectionData {
  if (!saved) return base;
  const pick = (key: keyof StudioSectionData) => {
    const value = saved[key];
    if (typeof value === "string") return value.trim() ? value : base[key];
    if (typeof value === "boolean") return value;
    return value ?? base[key];
  };
  return {
    ...base,
    enabled: saved.enabled !== false,
    eyebrow: String(pick("eyebrow") || ""),
    heading: String(pick("heading") || base.heading),
    description: String(pick("description") || ""),
    buttonText: String(pick("buttonText") || ""),
    buttonLink: String(pick("buttonLink") || ""),
    videoUrl: String(saved.videoUrl || ""),
    videoAssetId: saved.videoAssetId ?? null,
    hours: String(pick("hours") || ""),
    features: String(pick("features") || ""),
    faq: String(pick("faq") || ""),
    items: String(pick("items") || ""),
    seoTitle: String(pick("seoTitle") || ""),
    seoDescription: String(pick("seoDescription") || ""),
    image: {
      assetId: saved.image?.assetId ?? null,
      src: String(saved.image?.src || ""),
      alt: String(saved.image?.alt || base.image.alt || base.heading),
    },
    gallery: Array.isArray(saved.gallery)
      ? saved.gallery.map((item) => ({
          assetId: item?.assetId ?? null,
          src: String(item?.src || ""),
          alt: String(item?.alt || base.heading),
        }))
      : [],
  };
}

export async function getPageStudioDocument(
  moduleSlug: string
): Promise<PageStudioDocument> {
  const defaults = getStudioDefaults(moduleSlug);
  const sections = PAGE_STUDIO_SECTIONS[moduleSlug] || [];
  const db = getDb();
  if (!db) return defaults;
  try {
    const entry = await db.contentEntry.findUnique({
      where: { module_key: { module: moduleSlug, key: "page-studio" } },
    });
    if (!entry?.data || typeof entry.data !== "object") return defaults;
    const data = entry.data as Record<string, Partial<StudioSectionData>>;
    const merged: PageStudioDocument = {};
    for (const section of sections) {
      merged[section.key] = mergeSection(
        defaults[section.key] || emptyStudioSection(section.label),
        data[section.key]
      );
    }
    return merged;
  } catch {
    return defaults;
  }
}

export function sectionItems(section?: StudioSectionData) {
  return parseTitledLines(section?.items || "");
}

export function sectionFeatures(section?: StudioSectionData) {
  return parseLines(section?.features || "");
}

export function sectionHours(section?: StudioSectionData) {
  return parseTitledLines(section?.hours || "").map((item) => ({
    label: item.title,
    hours: item.description || item.title,
  }));
}

export function sectionFaq(section?: StudioSectionData) {
  return parseFaqLines(section?.faq || "");
}

export function sectionGallery(section?: StudioSectionData) {
  return section?.gallery || [];
}
