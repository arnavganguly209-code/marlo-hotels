import type { Metadata } from "next";
import { RoomCard } from "@/components/cards/room-card";
import { PageHero } from "@/components/shared/page-hero";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { RoomsSearchBar } from "@/components/rooms/rooms-search-bar";
import { getRooms } from "@/content/rooms";
import {
  filterRoomsForParty,
  suggestedRoomsForSearch,
} from "@/lib/booking-pricing";
import { getRoomsPageContent } from "@/lib/rooms-page-content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Rooms & Suites",
  description:
    "Choose your room at Marlo Hotels — live pricing with breakfast options and guest calculations.",
  path: "/rooms",
});

type PageProps = {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    rooms?: string;
    promo?: string;
    breakfast?: string;
  }>;
};

function toInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const [params, allRooms, pageContent] = await Promise.all([
    searchParams,
    getRooms(),
    getRoomsPageContent(),
  ]);
  const { cover } = pageContent;

  const adults = Math.max(1, toInt(params.adults, 2));
  const children = toInt(params.children, 1);
  const roomsCount = Math.max(
    1,
    toInt(params.rooms, 1),
    suggestedRoomsForSearch(adults, children)
  );

  const search =
    params.checkIn && params.checkOut
      ? {
          checkIn: params.checkIn,
          checkOut: params.checkOut,
          adults,
          children,
          rooms: roomsCount,
          breakfast: params.breakfast === "1",
          promo: params.promo,
        }
      : undefined;

  const published = allRooms.filter((room) => room.published !== false);
  const matched = search
    ? filterRoomsForParty(
        published,
        search.adults,
        search.children,
        search.rooms
      )
    : published;
  const rooms = matched.filter((room) => room.category === "room");
  const suites = matched.filter((room) => room.category === "suite");

  return (
    <>
      <PageHero
        eyebrow={cover.eyebrow}
        title={search ? "Available rooms for your dates" : cover.title}
        description={
          search
            ? `${search.checkIn} → ${search.checkOut} · ${search.adults} adult${search.adults > 1 ? "s" : ""} · ${search.children} child${search.children === 1 ? "" : "ren"} · ${search.rooms} room${search.rooms > 1 ? "s" : ""}`
            : cover.description
        }
        image={{
          src: cover.src,
          alt: cover.alt,
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Rooms & Suites", href: "/rooms" },
        ]}
      />

      <section className="border-b border-forest-800/10 bg-cream-50 py-8">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <RoomsSearchBar initial={search} />
        </div>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="The Rooms"
            title="Rooms with a point of view"
            description="Results match your guests — 1 child is complimentary per room, a 2nd child is +$5 / night."
          />
          {search && rooms.length === 0 ? (
            <p className="mt-10 text-sm text-charcoal-900/65">
              No rooms match this guest mix. Try adding rooms or adjusting
              adults/children.
            </p>
          ) : (
            <Stagger className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <StaggerItem key={room.slug}>
                  <RoomCard room={room} search={search} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="The Suites"
            title="Residences of the house"
            description="Private terraces, carved timber and dedicated service."
          />
          {search && suites.length === 0 ? (
            <p className="mt-10 text-sm text-charcoal-900/65">
              No suites match this guest mix for the selected room count.
            </p>
          ) : (
            <Stagger className="mt-14 grid gap-8 md:grid-cols-2">
              {suites.map((suite) => (
                <StaggerItem key={suite.slug}>
                  <RoomCard room={suite} search={search} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </>
  );
}
