import type { Metadata } from "next";
import { RoomCard } from "@/components/cards/room-card";
import { PageHero } from "@/components/shared/page-hero";
import { RoomsSearchBar } from "@/components/rooms/rooms-search-bar";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBookingPageContent } from "@/lib/booking-page-content";
import {
  occupancyIndexFromRooms,
  resolvePartySearch,
} from "@/lib/booking-occupancy";
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

  const published = allRooms.filter((room) => room.published !== false);
  const occupancy = occupancyIndexFromRooms(published);

  const adults = Math.max(1, toInt(params.adults, 2));
  const children = toInt(params.children, 1);
  const requestedRooms = Math.max(1, toInt(params.rooms, 1));

  const resolved =
    params.checkIn && params.checkOut
      ? resolvePartySearch(occupancy, {
          adults,
          children,
          rooms: requestedRooms,
        })
      : null;

  const search = resolved
    ? {
        checkIn: params.checkIn!,
        checkOut: params.checkOut!,
        adults: resolved.adults,
        children: resolved.children,
        rooms: resolved.rooms,
        breakfast: params.breakfast === "1",
        promo: params.promo,
      }
    : undefined;

  const matchSlugs = new Set(resolved?.matches.map((room) => room.slug) ?? []);
  const matched = search
    ? published.filter((room) => matchSlugs.has(room.slug))
    : published;
  const rooms = matched.filter((room) => room.category === "room");
  const suites = matched.filter((room) => room.category === "suite");

  return (
    <>
      <PageHero
        eyebrow={bookingContent.cover.eyebrow || "Reservations"}
        title={
          search
            ? "Choose your room"
            : bookingContent.cover.title || "Reserve your stay"
        }
        description={
          search
            ? `${search.checkIn} → ${search.checkOut} · ${search.adults} adult${search.adults > 1 ? "s" : ""} · ${search.children} child${search.children === 1 ? "" : "ren"} · ${search.rooms} room${search.rooms > 1 ? "s" : ""} · ${search.breakfast ? "With breakfast" : "Without breakfast"}`
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
            occupancy={occupancy}
          />
          {resolved?.message ? (
            <p className="mt-4 text-sm font-medium text-forest-900">
              {resolved.message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="bg-ivory py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            align="left"
            eyebrow="Step 2 · Select Your Room"
            title="Compatible rooms for your party"
            description={
              search
                ? "Only room types that fit your adults are listed. Live totals include nights, extra children and meal plan."
                : "Select check-in, check-out and meal plan above to see live pricing, then Book Now."
            }
          />
          {search && rooms.length === 0 ? (
            <p className="mt-10 text-sm text-charcoal-900/65">
              No rooms match this guest mix.
            </p>
          ) : (
            <Stagger className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {rooms.map((room) => (
                <StaggerItem key={room.slug}>
                  <RoomCard room={room} search={search} bookToCheckout />
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
            eyebrow="Suites"
            title="Residences of the house"
            description="Private terraces, carved timber and dedicated service."
          />
          {search && suites.length === 0 ? (
            <p className="mt-10 text-sm text-charcoal-900/65">
              No suites match this guest mix.
            </p>
          ) : (
            <Stagger className="mt-14 grid gap-8 md:grid-cols-2">
              {suites.map((suite) => (
                <StaggerItem key={suite.slug}>
                  <RoomCard room={suite} search={search} bookToCheckout />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </>
  );
}
