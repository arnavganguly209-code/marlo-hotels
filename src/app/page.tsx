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
import { getPosts } from "@/content/blog";
import { getRestaurants } from "@/content/dining";
import { getExperiences } from "@/content/experiences";
import { getFeaturedRooms, getRooms } from "@/content/rooms";

export default async function HomePage() {
  const [rooms, suites, restaurants, experiences, posts] = await Promise.all([
    getRooms(),
    getFeaturedRooms(),
    getRestaurants(),
    getExperiences(),
    getPosts(),
  ]);

  return (
    <>
      <Hero />
      <AboutSection />
      <RoomsShowcase rooms={rooms.filter((room) => room.category === "room")} />
      <FeaturedSuites suites={suites} />
      <DiningSection restaurants={restaurants} />
      <WellnessSection />
      <PoolBanner />
      <EventsSection />
      <GalleryPreview />
      <ExperiencesSection experiences={experiences} />
      <AttractionsSection />
      <TestimonialsSection />
      <AwardsStrip />
      <InstagramStrip />
      <JournalPreview posts={posts} />
    </>
  );
}
