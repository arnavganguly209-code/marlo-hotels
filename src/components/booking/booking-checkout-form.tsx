"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CountryAutocomplete } from "@/components/booking/country-autocomplete";
import { getRoomBySlugSync } from "@/lib/booking-client-rooms";
import {
  AIRPORT_PICKUP_OPTIONS,
  airportPickupCharge,
  airportPickupMaxGuests,
  airportPickupVehiclesForGuests,
} from "@/lib/booking-pricing";
import { formatCurrency } from "@/lib/utils";
import {
  HOTEL_ARRIVAL_TIMES,
  isKnownCountry,
} from "@/lib/world-countries";

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
  const [airportPickup, setAirportPickup] = useState(false);
  const [pickupVehicles, setPickupVehicles] = useState(1);
  const [flightNumber, setFlightNumber] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stayTotal = Number(params.get("total") || 0);

  const summary = useMemo(() => {
    const adults = Number(params.get("adults") || 2);
    const children = Number(params.get("children") || 1);
    const roomsCount = Number(params.get("rooms") || 1);
    const guests = adults + children;
    const suggestedVehicles = airportPickupVehiclesForGuests(guests);
    const checkIn = params.get("checkIn") || "";
    return {
      checkIn,
      checkOut: params.get("checkOut") || "",
      adults,
      children,
      rooms: roomsCount,
      guests,
      breakfast: params.get("breakfast") === "1",
      promo: params.get("promo") || "",
      roomName: params.get("roomName") || room?.name || "Room",
      stayTotal,
      suggestedVehicles,
    };
  }, [params, stayTotal, room?.name]);

  const vehicles = Math.max(pickupVehicles, airportPickup ? 1 : 0);
  const pickupFee = airportPickup ? airportPickupCharge(vehicles) : 0;
  const grandTotal = stayTotal + pickupFee;

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (
      !form.guestName.trim() ||
      !form.guestEmail.trim() ||
      !form.guestPhone.trim() ||
      !form.whatsapp.trim() ||
      !form.country.trim() ||
      !form.arrivalTime.trim()
    ) {
      setError("Please complete every required field.");
      return;
    }
    if (!isKnownCountry(form.country)) {
      setError("Please select a country from the list.");
      return;
    }
    if (
      !(HOTEL_ARRIVAL_TIMES as readonly string[]).includes(form.arrivalTime)
    ) {
      setError("Please select a hotel arrival time from 2:00 PM onward.");
      return;
    }
    if (!summary.checkIn || !summary.checkOut || !roomSlug) {
      setError("Missing stay details. Please return to booking and select a room.");
      return;
    }
    if (airportPickup) {
      if (!flightNumber.trim() || !pickupTime.trim()) {
        setError(
          "Please enter flight number and airport pickup time."
        );
        return;
      }
      if (!pickupDate.trim()) {
        setError("Please enter the airport pickup date.");
        return;
      }
      if (summary.guests > airportPickupMaxGuests(vehicles)) {
        setError(
          `Selected pickup covers up to ${airportPickupMaxGuests(vehicles)} guests. Select ${summary.suggestedVehicles} vehicle(s) for your party.`
        );
        return;
      }
    }

    const next = new URLSearchParams(params.toString());
    next.set("guestName", form.guestName.trim());
    next.set("guestEmail", form.guestEmail.trim());
    next.set("guestPhone", form.guestPhone.trim());
    next.set("whatsapp", form.whatsapp.trim());
    next.set("country", form.country.trim());
    next.set("arrivalTime", form.arrivalTime.trim());
    next.set("notes", form.notes.trim() || "None");
    next.set("roomName", summary.roomName);
    next.set("total", String(grandTotal));
    if (airportPickup) {
      next.set("airportPickup", "1");
      next.set("pickupVehicles", String(vehicles));
      next.set("pickupFee", String(pickupFee));
      next.set("flightNumber", flightNumber.trim());
      next.set("pickupDate", pickupDate.trim());
      next.set("pickupTime", pickupTime.trim());
      next.set("flightArrivalTime", pickupTime.trim());
      if (pickupNotes.trim()) next.set("pickupNotes", pickupNotes.trim());
      else next.delete("pickupNotes");
    } else {
      next.delete("airportPickup");
      next.delete("pickupVehicles");
      next.delete("pickupFee");
      next.delete("flightNumber");
      next.delete("pickupDate");
      next.delete("pickupTime");
      next.delete("flightArrivalTime");
      next.delete("pickupNotes");
    }
    router.push(`/booking/payment?${next.toString()}`);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-forest-800/10 bg-white p-6 md:p-8"
      >
        <h1 className="font-display text-3xl font-medium text-forest-950">
          Guest details
        </h1>
        <p className="text-sm text-charcoal-900/60">
          Tell us who is arriving — then continue to secure payment.
        </p>
        {(
          [
            ["guestName", "Full Name", "text"],
            ["guestEmail", "Email", "email"],
            ["guestPhone", "Phone", "tel"],
            ["whatsapp", "WhatsApp", "tel"],
          ] as const
        ).map(([key, label, type]) => (
          <label
            key={key}
            className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase"
          >
            {label}
            <input
              required
              type={type}
              value={form[key]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
            />
          </label>
        ))}

        <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
          Country
          <CountryAutocomplete
            required
            value={form.country}
            onChange={(country) =>
              setForm((current) => ({ ...current, country }))
            }
            className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
          />
        </label>

        <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
          Hotel Arrival Time
          <select
            required
            value={form.arrivalTime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                arrivalTime: event.target.value,
              }))
            }
            className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 bg-white px-4 text-sm normal-case tracking-normal"
          >
            <option value="">Select arrival time (from 2:00 PM)</option>
            {HOTEL_ARRIVAL_TIMES.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-forest-800/10 bg-cream-50/80 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={airportPickup}
              onChange={(event) => {
                const on = event.target.checked;
                setAirportPickup(on);
                if (on) {
                  setPickupVehicles(summary.suggestedVehicles);
                  if (!pickupDate && summary.checkIn) {
                    setPickupDate(summary.checkIn);
                  }
                }
              }}
              className="mt-1 size-4 accent-gold-600"
            />
            <span>
              <span className="block text-sm font-semibold text-forest-950">
                Airport pickup
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-charcoal-900/65">
                Optional transfer from Tribhuvan International Airport.
                1 vehicle — $12 — up to 3 guests · 2 vehicles — $20 — up to 8
                guests · 3 vehicles — $30 — up to 12 guests.
              </span>
            </span>
          </label>

          {airportPickup ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase sm:col-span-2">
                Vehicles
                <select
                  value={vehicles}
                  onChange={(event) =>
                    setPickupVehicles(Math.max(1, Number(event.target.value) || 1))
                  }
                  className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 bg-white px-4 text-sm normal-case tracking-normal"
                >
                  {AIRPORT_PICKUP_OPTIONS.map((option) => (
                    <option key={option.vehicles} value={option.vehicles}>
                      {option.vehicles} vehicle{option.vehicles > 1 ? "s" : ""} — $
                      {option.amount} (up to {option.maxGuests} guests)
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
                Flight number
                <input
                  required={airportPickup}
                  type="text"
                  value={flightNumber}
                  placeholder="e.g. RA213"
                  onChange={(event) => setFlightNumber(event.target.value)}
                  className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 bg-white px-4 text-sm normal-case tracking-normal"
                />
              </label>
              <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
                Airport pickup date
                <input
                  required={airportPickup}
                  type="date"
                  value={pickupDate}
                  onChange={(event) => setPickupDate(event.target.value)}
                  className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 bg-white px-4 text-sm normal-case tracking-normal"
                />
              </label>
              <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
                Airport pickup time
                <input
                  required={airportPickup}
                  type="text"
                  value={pickupTime}
                  placeholder="e.g. 10:30 AM"
                  onChange={(event) => setPickupTime(event.target.value)}
                  className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 bg-white px-4 text-sm normal-case tracking-normal"
                />
              </label>
              <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase sm:col-span-2">
                Pickup notes / instructions
                <textarea
                  rows={3}
                  value={pickupNotes}
                  placeholder="Optional — terminal, luggage, signage, etc."
                  onChange={(event) => setPickupNotes(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-forest-800/15 bg-white px-4 py-3 text-sm normal-case tracking-normal"
                />
              </label>
            </div>
          ) : null}
        </div>

        <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
          Special Request
          <textarea
            rows={4}
            value={form.notes}
            placeholder="Optional"
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
          Continue
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-forest-800/10 bg-cream-50 p-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
          Stay summary
        </p>
        <h2 className="font-display mt-2 text-2xl text-forest-950">
          {summary.roomName}
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
            <dt>Meal plan</dt>
            <dd>
              {summary.breakfast ? "With Breakfast" : "Without Breakfast"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Room stay</dt>
            <dd>{formatCurrency(stayTotal, room?.currency || "USD")}</dd>
          </div>
          {airportPickup ? (
            <div className="flex justify-between">
              <dt>
                Airport pickup ({vehicles} vehicle{vehicles > 1 ? "s" : ""})
              </dt>
              <dd>{formatCurrency(pickupFee, room?.currency || "USD")}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-forest-800/10 pt-3 text-base font-semibold text-forest-950">
            <dt>Total</dt>
            <dd>{formatCurrency(grandTotal, room?.currency || "USD")}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
