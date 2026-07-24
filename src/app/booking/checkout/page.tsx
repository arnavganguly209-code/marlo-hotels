import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingCheckoutForm } from "@/components/booking/booking-checkout-form";
import { getRooms } from "@/content/rooms";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Guest Details",
  description: "Complete your Marlo Hotels booking guest details.",
  path: "/booking/checkout",
});

export default async function BookingCheckoutPage() {
  const rooms = await getRooms();
  return (
    <section className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Suspense fallback={<p className="text-sm">Loading…</p>}>
          <BookingCheckoutForm
            rooms={rooms.map((room) => ({
              slug: room.slug,
              name: room.name,
              priceFrom: room.priceFrom,
              currency: room.currency,
              breakfastPrice: room.breakfastPrice,
            }))}
          />
        </Suspense>
      </div>
    </section>
  );
}
