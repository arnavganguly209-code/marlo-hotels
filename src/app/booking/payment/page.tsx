import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingPaymentForm } from "@/components/booking/booking-payment-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Payment",
  description: "Choose PayPal or Pay at Hotel for your Marlo Hotels stay.",
  path: "/booking/payment",
  noIndex: true,
});

export default function BookingPaymentPage() {
  return (
    <section className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Suspense fallback={<p className="text-sm">Loading…</p>}>
          <BookingPaymentForm />
        </Suspense>
      </div>
    </section>
  );
}
