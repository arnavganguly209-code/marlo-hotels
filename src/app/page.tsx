import { AboutSection } from "@/components/home/about-section";
import { AttractionsSection } from "@/components/home/attractions-section";
import { BreakfastSection } from "@/components/home/breakfast-section";
import { DiningSection } from "@/components/home/dining-section";
import { FeatureGridSectionView } from "@/components/home/feature-grid-section";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { Hero } from "@/components/home/hero";
import { LocationSection } from "@/components/home/location-section";
import { OffersSection } from "@/components/home/offers-section";
import { RoomsShowcase } from "@/components/home/rooms-showcase";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { WellnessSection } from "@/components/home/wellness-section";
import { getHomepageContent } from "@/lib/homepage-content";
import { getGalleryContent } from "@/lib/gallery-content";
import { occupancyIndexFromRooms } from "@/lib/booking-occupancy";
import { getPlacement } from "@/lib/orbit/media";
import { getRooms } from "@/content/rooms";
import type { GalleryImage } from "@/types/content";

const GALLERY_PREVIEW_CATEGORIES = new Set<GalleryImage["category"]>([
  "Rooms",
  "Dining",
  "Wellness",
  "Spa",
  "Architecture",
  "Events",
]);

function toPreviewCategory(category: string): GalleryImage["category"] {
  if (GALLERY_PREVIEW_CATEGORIES.has(category as GalleryImage["category"])) {
    return category as GalleryImage["category"];
  }
  return "Rooms";
}

export default async function HomePage() {
  const [homepage, heroMedia, allRooms, galleryPage] = await Promise.all([
    getHomepageContent(),
    getPlacement("home.hero"),
    getRooms(),
    getGalleryContent(),
  ]);
  const occupancy = occupancyIndexFromRooms(
    allRooms.filter((room) => room.published !== false)
  );
  const heroContent = {
    ...homepage.hero,
    image:
      homepage.hero.mediaType === "VIDEO"
        ? {
            ...homepage.hero.image,
            // Keep a still frame available as poster fallback while video boots.
            src:
              homepage.hero.poster?.src ||
              homepage.hero.image?.src ||
              heroMedia.posterUrl ||
              "/images/brand/hero-reception.png",
            alt: homepage.hero.image.alt || homepage.hero.poster?.alt || "",
          }
        : homepage.hero.image?.src
          ? homepage.hero.image
          : heroMedia.id && heroMedia.kind === "IMAGE"
            ? {
                ...homepage.hero.image,
                assetId: heroMedia.id,
                src: heroMedia.src,
                alt: heroMedia.alt,
                title: heroMedia.title || homepage.hero.image.title,
                focalX: heroMedia.focalX,
                focalY: heroMedia.focalY,
              }
            : homepage.hero.image,
    mediaType: homepage.hero.mediaType,
    videoUrl:
      homepage.hero.mediaType === "VIDEO"
        ? homepage.hero.videoUrl ||
          (heroMedia.id && heroMedia.kind === "VIDEO" ? heroMedia.src : "")
        : "",
    videoAssetId:
      homepage.hero.mediaType === "VIDEO"
        ? homepage.hero.videoAssetId ||
          (heroMedia.id && heroMedia.kind === "VIDEO" ? heroMedia.id : null)
        : null,
    videoAutoplay: true,
    videoLoop: true,
    videoMuted: true,
    poster:
      homepage.hero.poster?.src
        ? homepage.hero.poster
        : heroMedia.posterUrl
          ? {
              src: heroMedia.posterUrl,
              alt: homepage.hero.image?.alt || "Marlo Hotels",
            }
          : {
              src: "/images/brand/hero-reception.png",
              alt: homepage.hero.image?.alt || "Marlo Hotels",
            },
  };

  const posterHref = heroContent.poster?.src?.split("?")[0];
  const videoHref =
    heroContent.mediaType === "VIDEO" && heroContent.videoUrl
      ? "/videos/hero-loop.mp4"
      : undefined;

  return (
    <>
      {posterHref ? (
        <link rel="preload" as="image" href={posterHref} fetchPriority="high" />
      ) : null}
      {videoHref ? (
        <link
          rel="preload"
          as="video"
          href={videoHref}
          type="video/mp4"
          fetchPriority="high"
        />
      ) : heroContent.mediaType === "IMAGE" && heroContent.image?.src ? (
        <link
          rel="preload"
          as="image"
          href={heroContent.image.src.split("?")[0]}
          fetchPriority="high"
        />
      ) : null}
      <Hero content={heroContent} occupancy={occupancy} />
      <AboutSection content={homepage.about} />
      <RoomsShowcase content={homepage.rooms} />
      <BreakfastSection content={homepage.breakfast} />
      <DiningSection content={homepage.dining} />
      <WellnessSection content={homepage.wellness} />
      <FeatureGridSectionView content={homepage.facilities} tone="forest" />
      <FeatureGridSectionView content={homepage.whyStay} tone="ivory" />
      <AttractionsSection content={homepage.attractions} />
      <TestimonialsSection content={homepage.testimonials} />
      <OffersSection content={homepage.offers} />
      <GalleryPreview
        content={{
          ...homepage.gallery,
          enabled: true,
          eyebrow: homepage.gallery.eyebrow || galleryPage.cover.eyebrow,
          heading: homepage.gallery.heading || galleryPage.cover.title,
          description:
            homepage.gallery.description || galleryPage.cover.description,
          buttonText: homepage.gallery.buttonText || "View Full Gallery",
          buttonLink: homepage.gallery.buttonLink || "/gallery",
          // Always mirror the live /gallery library (6–8 premium tiles).
          items: galleryPage.images.slice(0, 8).map((image) => ({
            src: image.src,
            alt: image.alt,
            category: toPreviewCategory(image.category),
          })),
        }}
      />
      <LocationSection content={homepage.location} />
    </>
  );
}
