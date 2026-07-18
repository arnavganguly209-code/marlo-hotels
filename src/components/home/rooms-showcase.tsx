import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RoomCard } from "@/components/cards/room-card";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomepageContent } from "@/lib/homepage-content";

export function RoomsShowcase({
  content,
}: {
  content: HomepageContent["rooms"];
}) {
  if (!content.enabled) return null;
  const rooms = content.items.filter((room) => room.images[0]?.src);

  return (
    <section className="bg-cream-100 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
        />

        <Stagger className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <StaggerItem key={room.slug}>
              <RoomCard room={room} labels={content.labels} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center">
          <Button asChild variant="outline-dark" size="lg">
            <Link href={content.buttonLink ?? "/rooms"}>
              {content.buttonText ?? "View All Rooms & Suites"}
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
