import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Booking Received",
  description: "Thank you for choosing Marlo Hotels.",
  path: "/booking/success",
});

type PageProps = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const { reference } = await searchParams;
  return (
    <section className="flex min-h-[70vh] items-center bg-ivory py-20">
      <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-gold-700 uppercase">
          Reservation confirmed
        </p>
        <h1 className="font-display mt-4 text-4xl font-medium text-forest-950 md:text-5xl">
          Thank you for choosing Marlo Hotels.
        </h1>
        <p className="mt-6 text-base leading-relaxed font-light text-charcoal-900/70">
          Your booking request has been received successfully.
        </p>
        <p className="mt-3 text-base leading-relaxed font-light text-charcoal-900/70">
          Our reservations team will review your request and contact you shortly.
        </p>
        {reference ? (
          <p className="mt-8 rounded-2xl border border-forest-800/10 bg-white px-6 py-4 text-sm text-forest-950">
            Booking ID{" "}
            <strong className="tracking-[0.12em]">{reference}</strong>
          </p>
        ) : null}
        <p className="mt-8 text-sm text-charcoal-900/60">
          If you need to modify or cancel your booking, please email:{" "}
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
    </section>
  );
}
