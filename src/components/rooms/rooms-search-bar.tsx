"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateField } from "@/components/ui/date-field";
import { buildRoomsSearchParams } from "@/lib/booking-pricing";
import {
  maxChildrenAllowed,
  type RoomCapacity,
} from "@/lib/booking-occupancy";
import { toISODateString } from "@/lib/utils";
import { cn } from "@/lib/utils";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function RoomsSearchBar({
  initial,
  actionPath = "/rooms",
  submitLabel = "Check Availability",
  occupancy = [],
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
  actionPath?: string;
  submitLabel?: string;
  /** Live room capacities from the Rooms module. */
  occupancy?: RoomCapacity[];
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
  const [children, setChildren] = useState(initial?.children ?? 1);
  const [rooms, setRooms] = useState(initial?.rooms ?? 1);
  const [breakfast, setBreakfast] = useState(Boolean(initial?.breakfast));
  const [promo, setPromo] = useState(initial?.promo ?? "");

  const childCap = occupancy.length
    ? maxChildrenAllowed(occupancy, rooms)
    : rooms * 2;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    router.push(
      `${actionPath}?${buildRoomsSearchParams(
        {
          checkIn,
          checkOut,
          adults,
          children,
          rooms,
          promo,
          breakfast,
        },
        occupancy
      )}`
    );
  }

  const fieldLabel =
    "text-[10px] font-semibold tracking-[0.16em] text-forest-900/75 uppercase";

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 overflow-visible rounded-2xl border border-forest-800/10 bg-white p-4 md:grid-cols-[repeat(6,minmax(0,1fr))_auto] md:items-end"
    >
      <DateField
        id="rooms-check-in"
        tone="light"
        label={<span className={fieldLabel}>Check In</span>}
        value={checkIn}
        min={toISODateString(today)}
        required
        onChange={(next) => {
          setCheckIn(next);
          if (next >= checkOut) {
            setCheckOut(toISODateString(addDays(new Date(next), 1)));
          }
        }}
        className="min-w-0"
        buttonClassName="mt-1.5"
      />
      <DateField
        id="rooms-check-out"
        tone="light"
        label={<span className={fieldLabel}>Check Out</span>}
        value={checkOut}
        min={toISODateString(addDays(new Date(checkIn), 1))}
        required
        onChange={setCheckOut}
        className="min-w-0"
        buttonClassName="mt-1.5"
      />
      <label className={fieldLabel}>
        Adults
        <input
          type="number"
          min={1}
          max={8}
          value={adults}
          onChange={(event) => setAdults(Math.max(1, Number(event.target.value) || 1))}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className={fieldLabel}>
        Children
        <input
          type="number"
          min={0}
          max={Math.max(0, childCap)}
          value={children}
          onChange={(event) => {
            const next = Math.max(0, Number(event.target.value) || 0);
            setChildren(Math.min(next, Math.max(0, childCap)));
          }}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className={fieldLabel}>
        Rooms
        <input
          type="number"
          min={1}
          max={5}
          value={rooms}
          onChange={(event) =>
            setRooms(Math.max(1, Number(event.target.value) || 1))
          }
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm"
        />
      </label>
      <label className={cn(fieldLabel, "flex flex-col")}>
        Breakfast
        <select
          value={breakfast ? "1" : "0"}
          onChange={(event) => setBreakfast(event.target.value === "1")}
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm normal-case tracking-normal"
        >
          <option value="0">Without Breakfast</option>
          <option value="1">With Breakfast</option>
        </select>
      </label>
      <label className={cn(fieldLabel, "md:col-span-1")}>
        Promo
        <input
          type="text"
          value={promo}
          onChange={(event) => setPromo(event.target.value)}
          placeholder="Optional"
          className="mt-1.5 h-11 w-full rounded-xl border border-forest-800/15 px-3 text-sm normal-case tracking-normal"
        />
      </label>
      <button
        type="submit"
        className="h-11 rounded-xl bg-gold-500 px-5 text-[10px] font-semibold tracking-[0.18em] text-charcoal-950 uppercase transition hover:bg-gold-400 md:h-11"
      >
        {submitLabel}
      </button>
    </form>
  );
}
