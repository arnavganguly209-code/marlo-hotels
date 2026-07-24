"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getRoomBySlugSync } from "@/lib/booking-client-rooms";
import { formatCurrency } from "@/lib/utils";

export function BookingCheckoutForm({
  rooms,
}: {
  rooms: {
    slug: string;
    name: string;
    priceFrom: number;
    currency: string;
    breakfastPrice: number;
  }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const roomSlug = params.get("room") || rooms[0]?.slug || "";
  const room =
    rooms.find((item) => item.slug === roomSlug) ||
    getRoomBySlugSync(rooms, roomSlug);

  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    whatsapp: "",
    country: "",
    arrivalTime: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const total = Number(params.get("total") || 0);

  const summary = useMemo(
    () => ({
      checkIn: params.get("checkIn") || "",
      checkOut: params.get("checkOut") || "",
      adults: Number(params.get("adults") || 2),
      children: Number(params.get("children") || 0),
      rooms: Number(params.get("rooms") || 1),
      breakfast: params.get("breakfast") === "1",
      promo: params.get("promo") || "",
      total,
    }),
    [params, total]
  );

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (
      !form.guestName.trim() ||
      !form.guestEmail.trim() ||
      !form.guestPhone.trim() ||
      !form.whatsapp.trim() ||
      !form.country.trim() ||
      !form.arrivalTime.trim() ||
      !form.notes.trim()
    ) {
      setError("Please complete every required field.");
      return;
    }
    const next = new URLSearchParams(params.toString());
    next.set("guestName", form.guestName.trim());
    next.set("guestEmail", form.guestEmail.trim());
    next.set("guestPhone", form.guestPhone.trim());
    next.set("whatsapp", form.whatsapp.trim());
    next.set("country", form.country.trim());
    next.set("arrivalTime", form.arrivalTime.trim());
    next.set("notes", form.notes.trim());
    router.push(`/booking/payment?${next.toString()}`);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-forest-800/10 bg-white p-6 md:p-8">
        <h1 className="font-display text-3xl font-medium text-forest-950">
          Guest details
        </h1>
        <p className="text-sm text-charcoal-900/60">
          All fields are required to continue to payment.
        </p>
        {(
          [
            ["guestName", "Full Name", "text"],
            ["guestEmail", "Email", "email"],
            ["guestPhone", "Mobile Number", "tel"],
            ["whatsapp", "WhatsApp Number", "tel"],
            ["country", "Country", "text"],
            ["arrivalTime", "Arrival Time", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key} className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
            {label}
            <input
              required
              type={type}
              value={form[key]}
              onChange={(event) =>
                setForm((current) => ({ ...current, [key]: event.target.value }))
              }
              className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
            />
          </label>
        ))}
        <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
          Special Request
          <textarea
            required
            rows={4}
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({ ...current, notes: event.target.value }))
            }
            className="mt-1.5 w-full rounded-xl border border-forest-800/15 px-4 py-3 text-sm normal-case tracking-normal"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          className="mt-2 h-12 w-full rounded-xl bg-gold-500 text-[11px] font-semibold tracking-[0.2em] text-charcoal-950 uppercase"
        >
          Continue to Payment
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-forest-800/10 bg-cream-50 p-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
          Stay summary
        </p>
        <h2 className="font-display mt-2 text-2xl text-forest-950">
          {room?.name || "Room"}
        </h2>
        <dl className="mt-5 space-y-2 text-sm text-charcoal-900/70">
          <div className="flex justify-between">
            <dt>Check in</dt>
            <dd>{summary.checkIn}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Check out</dt>
            <dd>{summary.checkOut}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Guests</dt>
            <dd>
              {summary.adults} adults · {summary.children} children
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Breakfast</dt>
            <dd>{summary.breakfast ? "With Breakfast" : "Without Breakfast"}</dd>
          </div>
          <div className="flex justify-between border-t border-forest-800/10 pt-3 text-base font-semibold text-forest-950">
            <dt>Total</dt>
            <dd>{formatCurrency(summary.total, room?.currency || "USD")}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
