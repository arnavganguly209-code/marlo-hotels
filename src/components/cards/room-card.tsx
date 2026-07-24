"use client";

import { ArrowRight, Expand, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Room } from "@/types/content";
import {
  BREAKFAST_PER_PERSON_PER_NIGHT,
  formatOccupancyLabel,
  quoteFromDates,
} from "@/lib/booking-pricing";
import { formatCurrency } from "@/lib/utils";

export function RoomCard({
  room,
  labels,
  search,
}: {
  room: Room;
  labels?: Record<string, string>;
  search?: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    rooms: number;
    breakfast: boolean;
    promo?: string;
  };
}) {
  const cover = room.images[0];
  const soldOut = room.inventory <= 0;
  const quote =
    search?.checkIn && search?.checkOut
      ? quoteFromDates({
          basePricePerNight: room.priceFrom,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          adults: search.adults,
          children: search.children,
          rooms: search.rooms,
          breakfast: search.breakfast,
          includedAdults: room.includedAdults,
          includedChildren: room.includedChildren,
          breakfastPerPersonPerNight:
            room.breakfastPrice || BREAKFAST_PER_PERSON_PER_NIGHT,
          extraAdultPerNight: room.extraAdultPrice,
          extraChildPerNight: room.extraChildPrice,
        })
      : null;

  const params = new URLSearchParams();
  if (search) {
    params.set("checkIn", search.checkIn);
    params.set("checkOut", search.checkOut);
    params.set("adults", String(search.adults));
    params.set("children", String(search.children));
    params.set("rooms", String(search.rooms));
    if (search.breakfast) params.set("breakfast", "1");
    if (search.promo) params.set("promo", search.promo);
  }
  const query = params.toString();
  const detailsHref = `/rooms/${room.slug}${query ? `?${query}` : ""}`;
  const bookHref = `/rooms/${room.slug}${query ? `?${query}` : ""}`;

  return (
    <article className="group shadow-luxury-sm hover:shadow-luxury relative flex h-full flex-col overflow-hidden rounded-xl bg-white transition-shadow duration-700">
      <div className="img-hover-frame relative aspect-[4/3] bg-forest-950">
        {cover?.src ? (
          <Image
            src={cover.src}
            alt={cover.alt || room.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            quality={100}
            unoptimized={cover.src.startsWith("/media/")}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-forest-900 to-forest-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/45 to-transparent" />
        <span className="glass-dark absolute top-4 left-4 rounded-full border border-white/15 px-4 py-1.5 text-[9px] font-medium tracking-[0.28em] text-gold-300 uppercase backdrop-blur-md">
          {soldOut
            ? "Sold Out"
            : room.category === "suite"
              ? labels?.suite ?? "Suite"
              : labels?.room ?? "Room"}
        </span>
        <span className="absolute right-4 bottom-4 rounded-xl border border-white/10 bg-charcoal-950/35 px-3 py-2 text-right backdrop-blur-md">
          <span className="block text-[9px] tracking-[0.28em] text-cream-200/80 uppercase">
            {quote
              ? `${quote.nights} night${quote.nights > 1 ? "s" : ""}`
              : labels?.from ?? "From"}
          </span>
          <span className="font-display text-2xl font-medium text-ivory">
            {formatCurrency(quote ? quote.total : room.priceFrom, room.currency)}
          </span>
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col p-7">
        <h3 className="font-display text-2xl font-medium text-forest-950">
          <Link href={detailsHref} className="hover:text-gold-700">
            {room.name}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed font-light text-charcoal-900/60">
          {room.shortDescription}
        </p>
        <p className="mt-3 flex items-center gap-2 text-xs font-light text-charcoal-900/70">
          <Users className="size-3.5 text-gold-600" />
          {formatOccupancyLabel(room.includedAdults, room.includedChildren)} included
        </p>
        <p className="mt-3 text-[10px] font-medium tracking-[0.16em] text-gold-700 uppercase">
          Without Breakfast
        </p>
        <p className="mt-1 text-xs font-light text-charcoal-900/55">
          Add Breakfast +
          {formatCurrency(room.breakfastPrice || 5, room.currency)} / person
        </p>
        {quote ? (
          <dl className="mt-4 space-y-1.5 rounded-xl bg-cream-50 px-4 py-3 text-xs text-charcoal-900/70">
            <div className="flex justify-between">
              <dt>
                {room.priceFrom} × {quote.nights}
              </dt>
              <dd>{formatCurrency(quote.roomSubtotal, room.currency)}</dd>
            </div>
            {quote.extraAdultCharge > 0 ? (
              <div className="flex justify-between">
                <dt>Extra adult (+{quote.extraAdults})</dt>
                <dd>+{formatCurrency(quote.extraAdultCharge, room.currency)}</dd>
              </div>
            ) : null}
            {quote.extraChildCharge > 0 ? (
              <div className="flex justify-between">
                <dt>Extra child (+{quote.extraChildren})</dt>
                <dd>+{formatCurrency(quote.extraChildCharge, room.currency)}</dd>
              </div>
            ) : null}
            {quote.breakfastCharge > 0 ? (
              <div className="flex justify-between">
                <dt>Breakfast</dt>
                <dd>+{formatCurrency(quote.breakfastCharge, room.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-forest-800/10 pt-2 font-medium text-forest-950">
              <dt>Total</dt>
              <dd>{formatCurrency(quote.total, room.currency)}</dd>
            </div>
          </dl>
        ) : null}
        <p className="mt-3 text-[10px] font-medium tracking-[0.2em] text-gold-700 uppercase">
          {soldOut ? "No rooms available" : `${room.inventory} available`}
        </p>

        <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-forest-800/10 pt-5 text-xs font-light text-charcoal-900/70">
          <div className="flex items-center gap-2">
            <Expand className="size-3.5 text-gold-600" />
            <dd>{room.size}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-3.5 text-gold-600" />
            <dd>{room.occupancy}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={bookHref}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-gold-500 px-4 text-[10px] font-semibold tracking-[0.18em] text-charcoal-950 uppercase transition hover:bg-gold-400"
          >
            {room.buttonText || "Book Now"}
          </Link>
          <Link
            href={detailsHref}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-forest-800/15 px-4 text-[10px] font-semibold tracking-[0.18em] text-forest-950 uppercase transition hover:border-gold-500"
          >
            {labels?.details ?? "View Details"}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
