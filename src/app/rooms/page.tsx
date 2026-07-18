import type { Metadata } from "next";
import { RoomCard } from "@/components/cards/room-card";
import { PageHero } from "@/components/shared/page-hero";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getRooms } from "@/content/rooms";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Rooms & Suites",
  description:
    "Sixty-eight rooms and suites layered in forest green, cream and hand-finished brass — from garden rooms to the Royal Heritage Suite. Discover luxury accommodation at Marlo Hotels, Kathmandu.",
  path: "/rooms",
});

export default async function RoomsPage() {
  const allRooms = await getRooms();
  const rooms = allRooms.filter((room) => room.category === "room");
  const suites = allRooms.filter((room) => room.category === "suite");

  return (
    <>
      <PageHero
        eyebrow="Rooms & Suites"
        title="Quarters of quiet grandeur"
        description="Every room at Marlo is an argument for staying in — mountain light, hand-loomed textiles and beds you will write home about."
        image={{
          src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2400&auto=format&fit=crop",
          alt: "A Marlo guest room bathed in morning light",
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Rooms & Suites", href: "/rooms" },
        ]}
      />

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="The Rooms"
            title="Rooms with a point of view"
            description="Garden calm, valley panoramas or direct access to the pool deck — choose the light you wake to."
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <StaggerItem key={room.slug}>
                <RoomCard room={room} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="The Suites"
            title="Residences of the house"
            description="Private terraces, carved timber and dedicated service — our suites are addresses in their own right."
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2">
            {suites.map((suite) => (
              <StaggerItem key={suite.slug}>
                <RoomCard room={suite} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
