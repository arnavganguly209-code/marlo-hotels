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
import { DateField } from "@/components/ui/date-field";
import type { HeroEditorContent } from "@/lib/homepage-content";
import { buildRoomsSearchParams } from "@/lib/booking-pricing";
import { siteConfig } from "@/lib/site";
import { cn, toISODateString } from "@/lib/utils";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isDesktopViewport() {
  return typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
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
    top?: number;
    bottom?: number;
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
      const width = Math.max(rect.width, 288);
      let left = rect.left;
      if (left + width > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - width - 12);
      }
      // Desktop: open upward above the booking bar. Mobile: unchanged (down).
      if (isDesktopViewport()) {
        setMenuPos({
          bottom: window.innerHeight - rect.top + 10,
          left,
          width,
        });
      } else {
        setMenuPos({
          top: rect.bottom + 10,
          left,
          width,
        });
      }
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
    "flex items-center gap-2 text-[9px] font-medium tracking-[0.3em] uppercase text-gold-400 lg:text-[8px] lg:tracking-[0.26em]";

  const fieldUnderline =
    "mt-2.5 flex min-h-11 w-full items-center justify-between border-b border-ivory/25 pb-2 text-sm font-light text-ivory transition-colors focus-visible:border-gold-400 focus-visible:outline-none lg:mt-1 lg:min-h-8 lg:pb-1.5 lg:text-[13px]";

  const dropdown =
    mounted && guestsOpen && menuPos
      ? createPortal(
          <div
            id="orbit-guests-portal"
            role="dialog"
            aria-label="Guests and rooms"
            className="glass-dark shadow-luxury fixed z-[9999] max-h-[min(420px,calc(100dvh-1.5rem))] space-y-4 overflow-y-auto rounded-xl border border-white/10 p-5"
            style={{
              top: menuPos.top,
              bottom: menuPos.bottom,
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
        // Mobile / tablet — keep existing proportions
        "shadow-luxury relative z-30 grid grid-cols-1 gap-x-6 gap-y-5 overflow-visible rounded-2xl border border-white/10 bg-[rgb(10_24_20_/_0.78)] p-5 backdrop-blur-2xl sm:grid-cols-2 sm:p-6 md:p-7",
        // Desktop — slim luxury glass bar (≈40–50% shorter)
        "lg:grid-cols-[1fr_1fr_1.15fr_1fr_auto] lg:items-center lg:gap-x-5 lg:gap-y-0 lg:rounded-xl lg:border lg:border-gold-400/20 lg:bg-[rgb(10_24_20_/_0.62)] lg:p-3 lg:shadow-[0_18px_50px_-20px_rgb(0_0_0_/_0.55),inset_0_1px_0_0_rgb(255_255_255_/_0.08)] lg:backdrop-blur-2xl lg:backdrop-saturate-150",
        className
      )}
    >
      <DateField
        id="widget-check-in"
        desktopPlacement="above"
        label={
          <span className={labelClass}>
            <CalendarDays className="size-3.5 lg:size-3" /> {content.checkInLabel}
          </span>
        }
        value={checkIn}
        min={toISODateString(today)}
        required
        buttonClassName="lg:mt-1 lg:min-h-8 lg:pb-1.5 lg:text-[13px]"
        onChange={(next) => {
          setCheckIn(next);
          if (next >= checkOut) {
            setCheckOut(toISODateString(addDays(new Date(next), 1)));
          }
        }}
      />

      <DateField
        id="widget-check-out"
        desktopPlacement="above"
        label={
          <span className={labelClass}>
            <CalendarDays className="size-3.5 lg:size-3" /> {content.checkOutLabel}
          </span>
        }
        value={checkOut}
        min={toISODateString(addDays(new Date(checkIn), 1))}
        required
        buttonClassName="lg:mt-1 lg:min-h-8 lg:pb-1.5 lg:text-[13px]"
        onChange={setCheckOut}
      />

      <div ref={guestsRef} className="relative z-40 overflow-visible">
        <span className={labelClass}>
          <Users className="size-3.5 lg:size-3" /> {content.guestsLabel}
        </span>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setGuestsOpen((value) => !value)}
          aria-expanded={guestsOpen}
          aria-haspopup="dialog"
          className={fieldUnderline}
        >
          <span>
            {`${adults + children} Guest${adults + children === 1 ? "" : "s"} · ${rooms} Room${rooms === 1 ? "" : "s"}`}
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-gold-400 transition-transform duration-300 lg:size-3.5",
              guestsOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      <div>
        <label htmlFor="widget-promo" className={labelClass}>
          <Sparkles className="size-3.5 lg:size-3" /> {content.promoLabel}
        </label>
        <input
          id="widget-promo"
          type="text"
          placeholder={content.promoPlaceholder}
          value={promo}
          onChange={(event) => setPromo(event.target.value)}
          className="mt-2.5 min-h-11 w-full border-b border-ivory/25 bg-transparent pb-2 text-sm font-light tracking-widest text-ivory uppercase outline-none placeholder:normal-case placeholder:tracking-wide placeholder:text-cream-200/35 focus:border-gold-400 lg:mt-1 lg:min-h-8 lg:pb-1.5 lg:text-[13px]"
        />
      </div>

      <button
        type="submit"
        className="shadow-gold col-span-1 flex h-13 min-h-12 items-center justify-center gap-3 rounded-lg bg-gold-500 px-8 text-[11px] font-semibold tracking-[0.24em] text-charcoal-950 uppercase transition-all duration-500 hover:-translate-y-0.5 hover:bg-gold-400 focus-visible:ring-2 focus-visible:ring-gold-300 focus-visible:outline-none sm:col-span-2 lg:col-span-1 lg:h-10 lg:min-h-10 lg:gap-2 lg:rounded-md lg:px-6 lg:text-[10px] lg:tracking-[0.2em] lg:hover:translate-y-0"
      >
        <BedDouble className="size-4 lg:size-3.5" />
        {content.submitLabel}
      </button>
      {dropdown}
    </form>
  );
}
