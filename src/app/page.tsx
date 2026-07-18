import { AboutSection } from "@/components/home/about-section";
import { AttractionsSection } from "@/components/home/attractions-section";
import { AwardsStrip } from "@/components/home/awards-strip";
import { DiningSection } from "@/components/home/dining-section";
import { EventsSection } from "@/components/home/events-section";
import { ExperiencesSection } from "@/components/home/experiences-section";
import { FeaturedSuites } from "@/components/home/featured-suites";
import { GalleryPreview } from "@/components/home/gallery-preview";
import { Hero } from "@/components/home/hero";
import { InstagramStrip } from "@/components/home/instagram-strip";
import { JournalPreview } from "@/components/home/journal-preview";
import { PoolBanner } from "@/components/home/pool-banner";
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
    // A named media placement remains compatible with the Media Library's
    // "Use as Hero" action. The visual editor document otherwise owns content.
    image: heroMedia.id
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
    mediaType: heroMedia.id ? heroMedia.kind : homepage.hero.mediaType,
    videoUrl:
      heroMedia.id && heroMedia.kind === "VIDEO"
        ? heroMedia.src
        : homepage.hero.videoUrl,
    videoAutoplay: heroMedia.id
      ? heroMedia.videoAutoplay !== false
      : homepage.hero.videoAutoplay,
    videoLoop: heroMedia.id
      ? heroMedia.videoLoop !== false
      : homepage.hero.videoLoop,
    videoMuted: heroMedia.id
      ? heroMedia.videoMuted !== false
      : homepage.hero.videoMuted,
    poster: heroMedia.posterUrl
      ? {
          src: heroMedia.posterUrl,
          alt: homepage.hero.poster?.alt || homepage.hero.image.alt,
        }
      : homepage.hero.poster,
  };

  return (
    <>
      {heroContent.mediaType === "IMAGE" ? (
        <link rel="preload" as="image" href={heroContent.image.src} />
      ) : null}
      <Hero content={heroContent} />
      <AboutSection content={homepage.about} />
      <RoomsShowcase content={homepage.rooms} />
      <FeaturedSuites content={homepage.featuredSuites} />
      <DiningSection content={homepage.dining} />
      <WellnessSection content={homepage.wellness} />
      <PoolBanner content={homepage.pool} />
      <EventsSection content={homepage.events} />
      <GalleryPreview content={homepage.gallery} />
      <ExperiencesSection content={homepage.experiences} />
      <AttractionsSection content={homepage.attractions} />
      <TestimonialsSection content={homepage.testimonials} />
      <AwardsStrip content={homepage.awards} />
      <InstagramStrip content={homepage.instagram} />
      <JournalPreview content={homepage.journal} />
    </>
  );
}
