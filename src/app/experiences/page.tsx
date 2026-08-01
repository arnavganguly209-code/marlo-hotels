import type { Metadata } from "next";
import {
  ExperiencesShowcase,
  type ExperienceCard,
  type ExperienceImage,
} from "@/components/experiences/experiences-showcase";
import { PageHero } from "@/components/shared/page-hero";
import { getGalleryContent } from "@/lib/gallery-content";
import {
  getPageStudioDocument,
  resolveSectionImage,
  sectionItems,
} from "@/lib/page-studio-content";
import { buildMetadata } from "@/lib/seo";
import { withMediaCacheBust } from "@/lib/media-cache";

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getPageStudioDocument("experiences");
  const seo = doc.seo;
  const hero = doc.hero;
  return buildMetadata({
    title: seo?.seoTitle || hero?.seoTitle || "Experiences",
    description:
      seo?.seoDescription ||
      hero?.seoDescription ||
      "Private luxury experiences in Kathmandu — arranged by the Marlo Hotels concierge.",
    path: "/experiences",
  });
}

function pickGalleryImage(
  images: { src: string; alt: string; category: string }[],
  matchers: RegExp[],
  used: Set<string>
): ExperienceImage | null {
  for (const matcher of matchers) {
    const hit = images.find(
      (image) =>
        image.src &&
        !used.has(image.src) &&
        (matcher.test(image.src) ||
          matcher.test(image.alt) ||
          matcher.test(image.category))
    );
    if (hit) {
      used.add(hit.src);
      return {
        src: withMediaCacheBust(hit.src),
        alt: hit.alt || "Marlo Hotels experience",
      };
    }
  }
  const fallback = images.find((image) => image.src && !used.has(image.src));
  if (!fallback) return null;
  used.add(fallback.src);
  return {
    src: withMediaCacheBust(fallback.src),
    alt: fallback.alt || "Marlo Hotels experience",
  };
}

export default async function ExperiencesPage() {
  const [doc, gallery] = await Promise.all([
    getPageStudioDocument("experiences"),
    getGalleryContent(),
  ]);
  const hero = doc.hero;

  const listing = sectionItems(doc.listing).map(
    (item): ExperienceCard => ({
      title: item.title,
      description: item.description || "",
    })
  );

  const used = new Set<string>();
  const galleryImages = gallery.images.filter((image) => Boolean(image.src));

  const fallbackFrame: ExperienceImage = {
    src: "/images/dining/seating-palm.png",
    alt: "Marlo Hotels hospitality",
  };

  // Only three gallery photographs — clear frames, never a crowded collage.
  const editorialFallback =
    pickGalleryImage(galleryImages, [/gate/i, /architecture/i, /entrance/i], used) ||
    pickGalleryImage(galleryImages, [/./], used) ||
    fallbackFrame;
  const editorial = resolveSectionImage(doc.editorial, editorialFallback);

  const accentFallback =
    pickGalleryImage(
      galleryImages,
      [/expri/i, /restro/i, /dining/i, /terrace/i, /spa/i],
      used
    ) ||
    pickGalleryImage(galleryImages, [/./], used) ||
    fallbackFrame;
  const accent = resolveSectionImage(doc.accent, accentFallback);

  const ctaFallback =
    pickGalleryImage(galleryImages, [/spa/i, /room/i, /gate/i], used) || accent;
  const cta = resolveSectionImage(doc.cta, ctaFallback);

  return (
    <>
      {hero?.enabled !== false ? (
        <PageHero
          eyebrow={hero?.eyebrow || "Experiences"}
          title={hero?.heading || "The valley, opened for you"}
          description={hero?.description}
          image={{
            src: hero?.image?.src || "",
            alt: hero?.image?.alt || "Experiences at Marlo Hotels",
          }}
          videoUrl={hero?.videoUrl || undefined}
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Experiences", href: "/experiences" },
          ]}
        />
      ) : null}

      <ExperiencesShowcase
        experiences={listing}
        images={{ editorial, accent, cta }}
        sections={{
          intro: doc.intro,
          editorial: doc.editorial,
          listing: doc.listing,
          features: doc.features,
          accent: doc.accent,
          cta: doc.cta,
        }}
        features={sectionItems(doc.features)}
      />
    </>
  );
}
