import type { Metadata } from "next";
import { BookingEngine } from "@/components/booking/booking-engine";
import { PageHero } from "@/components/shared/page-hero";
import { getRooms } from "@/content/rooms";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Reserve Your Stay",
  description:
    "Reserve your stay at Marlo Hotels — choose your dates, select from rooms and suites, and our reservations team confirms within hours. Best rate guaranteed when booking direct.",
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
    room?: string;
  }>;
};

function toCount(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rooms = await getRooms();

  return (
    <>
      <PageHero
        eyebrow="Reservations"
        title="Reserve your stay"
        description="Direct bookings enjoy our best available rate, room upgrade priority and a welcome ritual at the spa."
        image={{
          src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2400&auto=format&fit=crop",
          alt: "A Marlo room prepared for arrival",
        }}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Booking", href: "/booking" },
        ]}
      />

      <section className="bg-ivory py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <BookingEngine
            rooms={rooms}
            initial={{
              checkIn: params.checkIn,
              checkOut: params.checkOut,
              adults: toCount(params.adults, 2),
              children: params.children ? Number(params.children) || 0 : 0,
              rooms: toCount(params.rooms, 1),
              promo: params.promo,
              room: params.room,
            }}
          />
        </div>
      </section>
    </>
  );
}
