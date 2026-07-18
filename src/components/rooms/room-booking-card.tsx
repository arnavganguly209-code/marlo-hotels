"use client";

import { CalendarDays, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CounterField } from "@/components/ui/counter-field";
import { siteConfig } from "@/lib/site";
import { formatCurrency, nightsBetween, toISODateString } from "@/lib/utils";

type RoomBookingCardProps = {
  roomSlug: string;
  roomName: string;
  priceFrom: number;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function RoomBookingCard({
  roomSlug,
  roomName,
  priceFrom,
}: RoomBookingCardProps) {
  const router = useRouter();
  const today = new Date();
  const [checkIn, setCheckIn] = useState(toISODateString(addDays(today, 7)));
  const [checkOut, setCheckOut] = useState(toISODateString(addDays(today, 9)));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const nights = nightsBetween(checkIn, checkOut);
  const estimate = nights * priceFrom;

  function onReserve(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({
      room: roomSlug,
      checkIn,
      checkOut,
      adults: String(adults),
      children: String(children),
      rooms: "1",
    });
    router.push(`/booking?${params.toString()}`);
  }

  const dateFieldClass =
    "mt-2 w-full border-b border-forest-800/25 bg-transparent pb-2 text-sm font-light text-forest-950 outline-none focus:border-gold-500";

  return (
    <form
      onSubmit={onReserve}
      aria-label={`Reserve the ${roomName}`}
      className="glass-light shadow-luxury rounded-xl p-7 md:p-8"
    >
      <p className="text-[10px] font-medium tracking-[0.3em] text-gold-600 uppercase">
        From
      </p>
      <p className="font-display mt-1 text-4xl font-medium text-forest-950">
        {formatCurrency(priceFrom)}
        <span className="text-base font-light text-charcoal-900/55">
          {" "}
          / night
        </span>
      </p>

      <div className="mt-7 grid grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="room-check-in"
            className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.26em] text-forest-800 uppercase"
          >
            <CalendarDays className="size-3 text-gold-600" /> Check In
          </label>
          <input
            id="room-check-in"
            type="date"
            required
            min={toISODateString(today)}
            value={checkIn}
            onChange={(event) => {
              setCheckIn(event.target.value);
              if (event.target.value >= checkOut) {
                setCheckOut(
                  toISODateString(addDays(new Date(event.target.value), 1))
                );
              }
            }}
            className={dateFieldClass}
          />
        </div>
        <div>
          <label
            htmlFor="room-check-out"
            className="flex items-center gap-1.5 text-[9px] font-medium tracking-[0.26em] text-forest-800 uppercase"
          >
            <CalendarDays className="size-3 text-gold-600" /> Check Out
          </label>
          <input
            id="room-check-out"
            type="date"
            required
            min={toISODateString(addDays(new Date(checkIn), 1))}
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            className={dateFieldClass}
          />
        </div>
      </div>

      <div className="mt-6 space-y-4 border-y border-forest-800/15 py-5">
        <CounterField
          label="Adults"
          tone="dark"
          value={adults}
          min={1}
          max={siteConfig.booking.maxAdults}
          onChange={setAdults}
        />
        <CounterField
          label="Children"
          tone="dark"
          value={children}
          min={0}
          max={siteConfig.booking.maxChildren}
          onChange={setChildren}
        />
      </div>

      {nights > 0 ? (
        <p className="mt-5 flex items-baseline justify-between text-sm font-light text-charcoal-900/70">
          <span>
            {nights} night{nights > 1 ? "s" : ""} · estimated
          </span>
          <span className="font-display text-2xl font-medium text-forest-950">
            {formatCurrency(estimate)}
          </span>
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="lg" className="mt-6 w-full">
        Check Availability
      </Button>

      <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-light text-charcoal-900/55">
        <ShieldCheck className="size-3.5 text-gold-600" />
        Free cancellation until 48 hours before arrival
      </p>
    </form>
  );
}
