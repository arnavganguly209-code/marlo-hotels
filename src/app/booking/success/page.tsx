import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Booking Received",
  description: "Thank you for choosing Marlo Hotels.",
  path: "/booking/success",
});

type PageProps = {
  searchParams: Promise<{
    reference?: string;
    total?: string;
    roomName?: string;
    room?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    rooms?: string;
    breakfast?: string;
    guestName?: string;
    arrivalTime?: string;
    mealPlan?: string;
  }>;
};

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const reference = params.reference;
  const mealPlan =
    params.mealPlan ||
    (params.breakfast === "1" ? "With Breakfast" : "Without Breakfast");
  const adults = Number(params.adults || 0);
  const children = Number(params.children || 0);
  const rooms = Number(params.rooms || 0);
  const total = Number(params.total || 0);

  return (
    <section className="bg-ivory py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="rounded-2xl border border-forest-800/10 bg-white p-8 text-center shadow-luxury-sm md:p-12">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-gold-700 uppercase">
            Reservation received
          </p>
          <h1 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
            Thank you for choosing Marlo Hotels.
          </h1>
          <p className="mt-6 text-base leading-relaxed font-light text-charcoal-900/70">
            Your reservation request has been received successfully.
          </p>
          <p className="mt-3 text-base leading-relaxed font-light text-charcoal-900/70">
            Our reservations team will contact you shortly.
          </p>

          {reference ? (
            <p className="mt-8 inline-block rounded-2xl border border-gold-500/35 bg-cream-50 px-6 py-4 text-sm text-forest-950">
              Booking ID{" "}
              <strong className="tracking-[0.14em] text-gold-700">
                {reference}
              </strong>
            </p>
          ) : null}

          <div className="mt-10 rounded-2xl border border-forest-800/10 bg-cream-50 p-6 text-left">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-gold-700 uppercase">
              Reservation summary
            </p>
            <dl className="mt-4 space-y-3 text-sm text-charcoal-900/75">
              <div className="flex justify-between gap-4">
                <dt>Guest name</dt>
                <dd className="font-medium text-forest-950">
                  {params.guestName || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Room</dt>
                <dd className="font-medium text-forest-950">
                  {params.roomName || params.room || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Dates</dt>
                <dd className="text-right font-medium text-forest-950">
                  {params.checkIn && params.checkOut
                    ? `${formatDate(params.checkIn)} → ${formatDate(params.checkOut)}`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Meal plan</dt>
                <dd className="font-medium text-forest-950">{mealPlan}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Guests</dt>
                <dd className="font-medium text-forest-950">
                  {adults
                    ? `${adults} adult${adults > 1 ? "s" : ""}${
                        children > 0
                          ? ` · ${children} child${children > 1 ? "ren" : ""}`
                          : ""
                      }${
                        rooms
                          ? ` · ${rooms} room${rooms > 1 ? "s" : ""}`
                          : ""
                      }`
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Arrival time</dt>
                <dd className="font-medium text-forest-950">
                  {params.arrivalTime || "—"}
                </dd>
              </div>
              {total > 0 ? (
                <div className="flex justify-between gap-4 border-t border-forest-800/10 pt-3">
                  <dt>Estimated total</dt>
                  <dd className="font-medium text-forest-950">
                    {formatCurrency(total)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <p className="mt-8 text-sm text-charcoal-900/60">
            If you wish to modify or cancel your reservation please contact:{" "}
            <a
              href="mailto:info@marlohotels.com"
              className="text-gold-700 underline-offset-4 hover:underline"
            >
              info@marlohotels.com
            </a>
          </p>

          <Link
            href="/"
            className="mt-10 inline-flex h-12 items-center rounded-xl bg-forest-900 px-6 text-[11px] font-semibold tracking-[0.2em] text-ivory uppercase"
          >
            Return Home
          </Link>
        </div>
      </div>
    </section>
  );
}
