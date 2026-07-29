import type { Metadata } from "next";
import { RoomCard } from "@/components/cards/room-card";
import { PageHero } from "@/components/shared/page-hero";
import { RoomsSearchBar } from "@/components/rooms/rooms-search-bar";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBookingPageContent } from "@/lib/booking-page-content";
import {
  filterRoomsForParty,
  suggestedRoomsForSearch,
} from "@/lib/booking-pricing";
import { getRooms } from "@/content/rooms";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Reserve Your Stay",
  description:
    "Reserve your stay at Marlo Hotels — choose dates, meal plan and room, then complete guest details and payment.",
  path: "/booking",
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

export default async function BookingPage({ searchParams }: PageProps) {
  const [params, allRooms, bookingContent] = await Promise.all([
    searchParams,
    getRooms(),
    getBookingPageContent(),
  ]);

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
        eyebrow={bookingContent.cover.eyebrow || "Reservations"}
        title={
          search ? "Choose your room" : bookingContent.cover.title || "Reserve your stay"
        }
        description={
          search
            ? `${search.checkIn} → ${search.checkOut} · ${search.adults} adult${search.adults > 1 ? "s" : ""} · ${search.rooms} room${search.rooms > 1 ? "s" : ""} · ${search.breakfast ? "With breakfast" : "Without breakfast"}`
            : bookingContent.cover.description
        }
        image={{
          src: bookingContent.cover.src,
          alt: bookingContent.cover.alt,
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Booking", href: "/booking" },
        ]}
      />

      <section className="border-b border-forest-800/10 bg-cream-50 py-8">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <RoomsSearchBar
            actionPath="/booking"
            submitLabel="Choose Your Room"
            initial={search}
          />
        </div>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="Step 2 · Select Your Room"
            title="All room categories"
            description={
              search
                ? "Live totals include nights, extra guests and your selected meal plan."
                : "Select check-in, check-out and meal plan above to see live pricing, then Book Now."
            }
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <StaggerItem key={room.slug}>
                <RoomCard room={room} search={search} bookToCheckout />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-cream-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="Suites"
            title="Residences of the house"
            description="Private terraces, carved timber and dedicated service."
          />
          <Stagger className="mt-14 grid gap-8 md:grid-cols-2">
            {suites.map((suite) => (
              <StaggerItem key={suite.slug}>
                <RoomCard room={suite} search={search} bookToCheckout />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
