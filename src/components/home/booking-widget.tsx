"use client";

import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Sparkles,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CounterField } from "@/components/ui/counter-field";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { buildRoomsSearchParams } from "@/lib/booking-pricing";
import { siteConfig } from "@/lib/site";
import { cn, toISODateString } from "@/lib/utils";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function BookingWidget({
  className,
  content,
}: {
  className?: string;
  content: HeroEditorContent["booking"];
}) {
  const router = useRouter();
  const today = new Date();
  const [checkIn, setCheckIn] = useState(toISODateString(addDays(today, 7)));
  const [checkOut, setCheckOut] = useState(toISODateString(addDays(today, 9)));
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [promo, setPromo] = useState("");
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const guestsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!guestsOpen || !buttonRef.current) {
      setMenuPos(null);
      return;
    }
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({
        top: rect.bottom + 10,
        left: rect.left,
        width: Math.max(rect.width, 288),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [guestsOpen]);

  useEffect(() => {
    if (!guestsOpen) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (guestsRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      const portal = document.getElementById("orbit-guests-portal");
      if (portal?.contains(target)) return;
      setGuestsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGuestsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [guestsOpen]);

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(
      `/rooms?${buildRoomsSearchParams({
        checkIn,
        checkOut,
        adults,
        children,
        rooms,
        promo,
      })}`
    );
  }

  const labelClass =
    "flex items-center gap-2 text-[9px] font-medium tracking-[0.3em] uppercase text-gold-400";

  const dropdown =
    mounted && guestsOpen && menuPos
      ? createPortal(
          <div
            id="orbit-guests-portal"
            className="glass-dark shadow-luxury fixed z-[9999] space-y-4 rounded-xl border border-white/10 p-5"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
          >
            <CounterField
              label={content.adultsLabel}
              value={adults}
              min={1}
              max={siteConfig.booking.maxAdults}
              onChange={setAdults}
            />
            <CounterField
              label={content.childrenLabel}
              value={children}
              min={0}
              max={siteConfig.booking.maxChildren}
              onChange={setChildren}
            />
            <CounterField
              label={content.roomsLabel}
              value={rooms}
              min={1}
              max={siteConfig.booking.maxRooms}
              onChange={setRooms}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <form
      onSubmit={onSearch}
      aria-label="Check availability"
      className={cn(
        "shadow-luxury relative z-30 grid grid-cols-2 gap-x-6 gap-y-5 overflow-visible rounded-2xl border border-white/10 bg-[rgb(10_24_20_/_0.72)] p-6 backdrop-blur-2xl md:p-7 lg:grid-cols-[1fr_1fr_1.2fr_1fr_auto] lg:items-end",
        className
      )}
    >
      <div>
        <label htmlFor="widget-check-in" className={labelClass}>
          <CalendarDays className="size-3.5" /> {content.checkInLabel}
        </label>
        <input
          id="widget-check-in"
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
          className="mt-2.5 w-full border-b border-ivory/25 bg-transparent pb-2 text-sm font-light text-ivory outline-none [color-scheme:dark] focus:border-gold-400"
        />
      </div>

      <div>
        <label htmlFor="widget-check-out" className={labelClass}>
          <CalendarDays className="size-3.5" /> {content.checkOutLabel}
        </label>
        <input
          id="widget-check-out"
          type="date"
          required
          min={toISODateString(addDays(new Date(checkIn), 1))}
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          className="mt-2.5 w-full border-b border-ivory/25 bg-transparent pb-2 text-sm font-light text-ivory outline-none [color-scheme:dark] focus:border-gold-400"
        />
      </div>

      <div ref={guestsRef} className="relative z-40 overflow-visible">
        <span className={labelClass}>
          <Users className="size-3.5" /> {content.guestsLabel}
        </span>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setGuestsOpen((value) => !value)}
          aria-expanded={guestsOpen}
          aria-haspopup="dialog"
          className="mt-2.5 flex w-full items-center justify-between border-b border-ivory/25 pb-2 text-sm font-light text-ivory transition-colors focus:border-gold-400"
        >
          <span>
            {adults + children} Guest{adults + children > 1 ? "s" : ""}
            <span className="mx-1.5 text-gold-500">·</span>
            {rooms} Room{rooms > 1 ? "s" : ""}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-gold-400 transition-transform duration-300",
              guestsOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      <div>
        <label htmlFor="widget-promo" className={labelClass}>
          <Sparkles className="size-3.5" /> {content.promoLabel}
        </label>
        <input
          id="widget-promo"
          type="text"
          placeholder={content.promoPlaceholder}
          value={promo}
          onChange={(event) => setPromo(event.target.value)}
          className="mt-2.5 w-full border-b border-ivory/25 bg-transparent pb-2 text-sm font-light tracking-widest text-ivory uppercase outline-none placeholder:normal-case placeholder:tracking-wide placeholder:text-cream-200/35 focus:border-gold-400"
        />
      </div>

      <button
        type="submit"
        className="shadow-gold col-span-2 flex h-13 items-center justify-center gap-3 rounded-lg bg-gold-500 px-8 text-[11px] font-semibold tracking-[0.24em] text-charcoal-950 uppercase transition-all duration-500 hover:-translate-y-0.5 hover:bg-gold-400 lg:col-span-1"
      >
        <BedDouble className="size-4" />
        {content.submitLabel}
      </button>
      {dropdown}
    </form>
  );
}
