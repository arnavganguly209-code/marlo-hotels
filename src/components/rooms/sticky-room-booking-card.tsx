"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CounterField } from "@/components/ui/counter-field";
import type { Room } from "@/types/content";
import {
  BREAKFAST_PER_PERSON_PER_NIGHT,
  quoteFromDates,
} from "@/lib/booking-pricing";
import { siteConfig } from "@/lib/site";
import { formatCurrency, toISODateString } from "@/lib/utils";
import { cn } from "@/lib/utils";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function StickyRoomBookingCard({
  room,
  initial,
}: {
  room: Room;
  initial?: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    rooms?: number;
    breakfast?: boolean;
    promo?: string;
  };
}) {
  const router = useRouter();
  const today = new Date();
  const [checkIn, setCheckIn] = useState(
    initial?.checkIn || toISODateString(addDays(today, 7))
  );
  const [checkOut, setCheckOut] = useState(
    initial?.checkOut || toISODateString(addDays(today, 9))
  );
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [rooms, setRooms] = useState(initial?.rooms ?? 1);
  const [breakfast, setBreakfast] = useState(Boolean(initial?.breakfast));
  const [promo, setPromo] = useState(initial?.promo ?? "");

  const quote = useMemo(
    () =>
      quoteFromDates({
        basePricePerNight: room.priceFrom,
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
        breakfast,
        includedAdults: room.includedAdults,
        includedChildren: room.includedChildren,
        breakfastPerPersonPerNight:
          room.breakfastPrice || BREAKFAST_PER_PERSON_PER_NIGHT,
        extraAdultPerNight: room.extraAdultPrice,
        extraChildPerNight: room.extraChildPrice,
      }),
    [
      room.priceFrom,
      room.breakfastPrice,
      room.includedAdults,
      room.includedChildren,
      room.extraAdultPrice,
      room.extraChildPrice,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      breakfast,
    ]
  );

  const soldOut = room.inventory < rooms;

  function bookNow() {
    if (soldOut) return;
    const params = new URLSearchParams({
      room: room.slug,
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
      rooms: String(rooms),
      breakfast: breakfast ? "1" : "0",
      total: String(quote.total),
    });
    if (promo.trim()) params.set("promo", promo.trim().toUpperCase());
    router.push(`/booking/checkout?${params.toString()}`);
  }

  return (
    <aside className="shadow-luxury sticky top-28 rounded-2xl border border-forest-800/10 bg-white p-6 lg:p-7">
      <p className="text-[10px] font-semibold tracking-[0.28em] text-gold-700 uppercase">
        Reserve
      </p>
      <p className="font-display mt-2 text-3xl font-medium text-forest-950">
        {formatCurrency(quote.total, room.currency)}
      </p>
      <p className="mt-1 text-xs text-charcoal-900/55">
        {quote.nights} night{quote.nights > 1 ? "s" : ""} ·{" "}
        {room.includedAdults}A / {room.includedChildren}C included · Without
        Breakfast base
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-[10px] tracking-[0.2em] text-charcoal-900/50 uppercase">
          Check In
          <input
            type="date"
            value={checkIn}
            min={toISODateString(today)}
            onChange={(event) => {
              setCheckIn(event.target.value);
              if (event.target.value >= checkOut) {
                setCheckOut(
                  toISODateString(addDays(new Date(event.target.value), 1))
                );
              }
            }}
            className="mt-2 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
          />
        </label>
        <label className="block text-[10px] tracking-[0.2em] text-charcoal-900/50 uppercase">
          Check Out
          <input
            type="date"
            value={checkOut}
            min={toISODateString(addDays(new Date(checkIn), 1))}
            onChange={(event) => setCheckOut(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
          />
        </label>
        <CounterField label="Adults" value={adults} min={1} max={siteConfig.booking.maxAdults} onChange={setAdults} />
        <CounterField label="Children" value={children} min={0} max={siteConfig.booking.maxChildren} onChange={setChildren} />
        <CounterField label="Rooms" value={rooms} min={1} max={Math.min(siteConfig.booking.maxRooms, Math.max(1, room.inventory))} onChange={setRooms} />

        <div>
          <p className="text-[10px] tracking-[0.2em] text-charcoal-900/50 uppercase">
            Breakfast
          </p>
          <div className="mt-2 space-y-2">
            {(
              [
                { value: false, label: "Without Breakfast" },
                {
                  value: true,
                  label: `With Breakfast (+$${room.breakfastPrice || 5}/person)`,
                },
              ] as const
            ).map((option) => (
              <button
                key={String(option.value)}
                type="button"
                onClick={() => setBreakfast(option.value)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm",
                  breakfast === option.value
                    ? "border-gold-500 bg-gold-50 text-forest-950"
                    : "border-forest-800/10 text-charcoal-900/70"
                )}
              >
                <span
                  className={cn(
                    "grid size-4 place-items-center rounded-full border",
                    breakfast === option.value
                      ? "border-gold-600"
                      : "border-forest-800/25"
                  )}
                >
                  {breakfast === option.value ? (
                    <span className="size-2 rounded-full bg-gold-600" />
                  ) : null}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-[10px] tracking-[0.2em] text-charcoal-900/50 uppercase">
          Promo
          <input
            value={promo}
            onChange={(event) => setPromo(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm uppercase tracking-widest"
            placeholder="Optional"
          />
        </label>
      </div>

      <dl className="mt-5 space-y-1.5 border-t border-forest-800/10 pt-4 text-xs text-charcoal-900/70">
        <div className="flex justify-between">
          <dt>
            Room ({room.priceFrom} × {quote.nights})
          </dt>
          <dd>{formatCurrency(quote.roomSubtotal, room.currency)}</dd>
        </div>
        {quote.extraAdultCharge > 0 ? (
          <div className="flex justify-between">
            <dt>Extra adults (+{quote.extraAdults})</dt>
            <dd>+{formatCurrency(quote.extraAdultCharge, room.currency)}</dd>
          </div>
        ) : null}
        {quote.extraChildCharge > 0 ? (
          <div className="flex justify-between">
            <dt>Extra children (+{quote.extraChildren})</dt>
            <dd>+{formatCurrency(quote.extraChildCharge, room.currency)}</dd>
          </div>
        ) : null}
        {quote.breakfastCharge > 0 ? (
          <div className="flex justify-between">
            <dt>Breakfast</dt>
            <dd>+{formatCurrency(quote.breakfastCharge, room.currency)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between pt-1 text-sm font-semibold text-forest-950">
          <dt>Total</dt>
          <dd>{formatCurrency(quote.total, room.currency)}</dd>
        </div>
      </dl>

      <button
        type="button"
        disabled={soldOut}
        onClick={bookNow}
        className="shadow-gold mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gold-500 text-[11px] font-semibold tracking-[0.2em] text-charcoal-950 uppercase transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {soldOut ? "Sold Out" : "Book Now"}
      </button>
      {soldOut ? (
        <p className="mt-3 text-center text-xs text-red-700">No Rooms Available</p>
      ) : null}
    </aside>
  );
}
