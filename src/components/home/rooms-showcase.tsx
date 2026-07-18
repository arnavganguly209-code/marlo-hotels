import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { RoomCard } from "@/components/cards/room-card";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Room } from "@/types/content";

export function RoomsShowcase({ rooms }: { rooms: Room[] }) {
  return (
    <section className="bg-cream-100 py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Rooms & Suites"
          title="Quarters of quiet grandeur"
          description="Sixty-eight rooms and suites layered in forest green, cream and hand-finished brass — each one an argument for staying in."
        />

        <Stagger className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {rooms.slice(0, 3).map((room) => (
            <StaggerItem key={room.slug}>
              <RoomCard room={room} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center">
          <Button asChild variant="outline-dark" size="lg">
            <Link href="/rooms">
              View All Rooms & Suites
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
