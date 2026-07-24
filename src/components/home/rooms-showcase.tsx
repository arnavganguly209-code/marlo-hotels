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
  const rooms = content.items;
  const rowOne = rooms.slice(0, 4);
  const rowTwo = rooms.slice(4);

  return (
    <section className="bg-cream-100 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.heading}
          description={content.description}
        />

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {rowOne.map((room) => (
            <StaggerItem key={room.slug}>
              <RoomCard room={room} labels={content.labels} />
            </StaggerItem>
          ))}
        </Stagger>

        {rowTwo.length ? (
          <Stagger className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:mx-auto xl:max-w-[1080px]">
            {rowTwo.map((room) => (
              <StaggerItem key={room.slug}>
                <RoomCard room={room} labels={content.labels} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : null}

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
