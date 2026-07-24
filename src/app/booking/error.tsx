"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[booking]", error);
  }, [error]);

  return (
    <section className="bg-ivory px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-xl rounded-2xl border border-forest-800/10 bg-white p-10 text-center shadow-luxury-sm">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-gold-600 uppercase">
          Reservations
        </p>
        <h1 className="font-display mt-4 text-3xl font-medium text-forest-950">
          We could not load booking
        </h1>
        <p className="mt-4 text-sm leading-relaxed font-light text-charcoal-900/65">
          Please try again. If the problem continues, call our reservations desk
          and we will complete your stay by phone.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="forest" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline-dark">
            <Link href="/rooms">Browse rooms</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
