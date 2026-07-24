"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildRoomsSearchParams } from "@/lib/booking-pricing";
import { toISODateString } from "@/lib/utils";
import { cn } from "@/lib/utils";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function RoomsSearchBar({
  initial,
}: {
  initial?: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    breakfast: boolean;
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

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push(
      `/rooms?${buildRoomsSearchParams({
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
        promo,
        breakfast,
      })}`
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-2xl border border-forest-800/10 bg-white p-4 md:grid-cols-[repeat(6,minmax(0,1fr))_auto] md:items-end"
    >
      <label className="text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
        Check In
        <input
          type="date"
          required
          value={checkIn}
          min={toISODateString(today)}
          onChange={(event) => setCheckIn(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className="text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
        Check Out
        <input
          type="date"
          required
          value={checkOut}
          min={toISODateString(addDays(new Date(checkIn), 1))}
          onChange={(event) => setCheckOut(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className="text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
        Adults
        <input
          type="number"
          min={1}
          max={8}
          value={adults}
          onChange={(event) => setAdults(Number(event.target.value) || 1)}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className="text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
        Children
        <input
          type="number"
          min={0}
          max={6}
          value={children}
          onChange={(event) => setChildren(Number(event.target.value) || 0)}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className="text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
        Rooms
        <input
          type="number"
          min={1}
          max={5}
          value={rooms}
          onChange={(event) => setRooms(Number(event.target.value) || 1)}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className="text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
        Promo
        <input
          value={promo}
          onChange={(event) => setPromo(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm uppercase tracking-widest"
          placeholder="Optional"
        />
      </label>
      <div className="flex flex-col gap-2 md:col-span-6 lg:col-span-1 lg:contents">
        <div className="flex gap-2 md:col-span-3">
          <button
            type="button"
            onClick={() => setBreakfast(false)}
            className={cn(
              "h-11 flex-1 rounded-xl border text-[10px] font-semibold tracking-[0.12em] uppercase",
              !breakfast
                ? "border-forest-900 bg-forest-900 text-ivory"
                : "border-forest-800/15"
            )}
          >
            Without Breakfast
          </button>
          <button
            type="button"
            onClick={() => setBreakfast(true)}
            className={cn(
              "h-11 flex-1 rounded-xl border text-[10px] font-semibold tracking-[0.12em] uppercase",
              breakfast
                ? "border-gold-600 bg-gold-500 text-charcoal-950"
                : "border-forest-800/15"
            )}
          >
            With Breakfast
          </button>
        </div>
        <button
          type="submit"
          className="h-11 rounded-xl bg-gold-500 px-5 text-[10px] font-semibold tracking-[0.16em] text-charcoal-950 uppercase"
        >
          Check Availability
        </button>
      </div>
    </form>
  );
}
