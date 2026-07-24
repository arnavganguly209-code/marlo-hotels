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
import { getPlacement } from "@/lib/orbit/media";

export default async function HomePage() {
  const [homepage, heroMedia] = await Promise.all([
    getHomepageContent(),
    getPlacement("home.hero"),
  ]);
  const heroContent = {
    ...homepage.hero,
    image:
      homepage.hero.mediaType === "VIDEO"
        ? { ...homepage.hero.image, src: "", alt: homepage.hero.image.alt || "" }
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
    poster: undefined,
  };

  return (
    <>
      {heroContent.mediaType === "VIDEO" && heroContent.videoUrl ? (
        <link
          rel="preload"
          as="video"
          href={heroContent.videoUrl.split("?")[0]}
          type="video/mp4"
        />
      ) : heroContent.mediaType === "IMAGE" && heroContent.image?.src ? (
        <link rel="preload" as="image" href={heroContent.image.src} />
      ) : null}
      <Hero content={heroContent} />
      <AboutSection content={homepage.about} />
      <RoomsShowcase content={homepage.rooms} />
      <BreakfastSection content={homepage.breakfast} />
      <DiningSection content={homepage.dining} />
      <WellnessSection content={homepage.wellness} />
      <FeatureGridSectionView content={homepage.facilities} tone="cream" />
      <FeatureGridSectionView content={homepage.whyStay} tone="ivory" />
      <FeatureGridSectionView content={homepage.guestServices} tone="forest" />
      <AttractionsSection content={homepage.attractions} />
      <TestimonialsSection content={homepage.testimonials} />
      <OffersSection content={homepage.offers} />
      <GalleryPreview content={homepage.gallery} />
      <LocationSection content={homepage.location} />
    </>
  );
}
