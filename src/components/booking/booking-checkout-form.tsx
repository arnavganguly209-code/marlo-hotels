"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getRoomBySlugSync } from "@/lib/booking-client-rooms";
import {
  AIRPORT_PICKUP_MAX_PER_VEHICLE,
  AIRPORT_PICKUP_PER_VEHICLE,
  airportPickupCharge,
  airportPickupVehiclesForGuests,
} from "@/lib/booking-pricing";
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
  const [airportPickup, setAirportPickup] = useState(false);
  const [pickupVehicles, setPickupVehicles] = useState(1);
  const [flightNumber, setFlightNumber] = useState("");
  const [flightArrivalTime, setFlightArrivalTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const stayTotal = Number(params.get("total") || 0);

  const summary = useMemo(() => {
    const adults = Number(params.get("adults") || 2);
    const children = Number(params.get("children") || 1);
    const roomsCount = Number(params.get("rooms") || 1);
    const guests = adults + children;
    const suggestedVehicles = airportPickupVehiclesForGuests(guests);
    return {
      checkIn: params.get("checkIn") || "",
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
    if (!summary.checkIn || !summary.checkOut || !roomSlug) {
      setError("Missing stay details. Please return to booking and select a room.");
      return;
    }
    if (airportPickup) {
      if (!flightNumber.trim() || !flightArrivalTime.trim()) {
        setError("Please enter flight number and Kathmandu arrival time for airport pickup.");
        return;
      }
      if (vehicles * AIRPORT_PICKUP_MAX_PER_VEHICLE < summary.guests) {
        setError(
          `Each vehicle holds max ${AIRPORT_PICKUP_MAX_PER_VEHICLE} guests. Select ${summary.suggestedVehicles} vehicle(s) for your party.`
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
      next.set("flightArrivalTime", flightArrivalTime.trim());
    } else {
      next.delete("airportPickup");
      next.delete("pickupVehicles");
      next.delete("pickupFee");
      next.delete("flightNumber");
      next.delete("flightArrivalTime");
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
            ["country", "Country", "text"],
            ["arrivalTime", "Hotel Arrival Time", "text"],
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
                }
              }}
              className="mt-1 size-4 accent-gold-600"
            />
            <span>
              <span className="block text-sm font-semibold text-forest-950">
                Airport pickup — ${AIRPORT_PICKUP_PER_VEHICLE} / vehicle
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-charcoal-900/65">
                Optional. Max {AIRPORT_PICKUP_MAX_PER_VEHICLE} guests per vehicle
                (one car). More than {AIRPORT_PICKUP_MAX_PER_VEHICLE} guests need
                another vehicle — e.g. 5–8 guests = ${AIRPORT_PICKUP_PER_VEHICLE * 2}.
                You can skip this.
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
                  {[1, 2, 3].map((count) => (
                    <option key={count} value={count}>
                      {count} vehicle{count > 1 ? "s" : ""} — $
                      {airportPickupCharge(count)} (up to{" "}
                      {count * AIRPORT_PICKUP_MAX_PER_VEHICLE} guests)
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
                Flight arrival in Kathmandu
                <input
                  required={airportPickup}
                  type="text"
                  value={flightArrivalTime}
                  placeholder="e.g. 14:40"
                  onChange={(event) => setFlightArrivalTime(event.target.value)}
                  className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 bg-white px-4 text-sm normal-case tracking-normal"
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
