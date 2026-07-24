"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarRange,
  type DateRange,
} from "@/components/booking/calendar-range";
import { Button } from "@/components/ui/button";
import { CounterField } from "@/components/ui/counter-field";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { siteConfig } from "@/lib/site";
import {
  cn,
  formatCurrency,
  formatDate,
  nightsBetween,
  toISODateString,
} from "@/lib/utils";
import type { Room } from "@/types/content";

const guestDetailsSchema = z.object({
  guestName: z.string().min(2, "Please tell us your name"),
  guestEmail: z.string().email("Please enter a valid email address"),
  guestPhone: z.string().min(5, "Please enter a phone number"),
  notes: z.string().optional(),
});

type GuestDetails = z.infer<typeof guestDetailsSchema>;

type BookingEngineProps = {
  rooms: Room[];
  initial: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    rooms?: number;
    promo?: string;
    room?: string;
  };
};

const steps = ["Dates & Guests", "Select Your Room", "Guest Details"] as const;

function parseDate(value?: string) {
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (iso) {
    const date = new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3])
    );
    date.setHours(0, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function BookingEngine({ rooms, initial }: BookingEngineProps) {
  const [step, setStep] = useState(0);
  const [range, setRange] = useState<DateRange>({
    from: parseDate(initial.checkIn),
    to: parseDate(initial.checkOut),
  });
  const [adults, setAdults] = useState(initial.adults ?? 2);
  const [children, setChildren] = useState(initial.children ?? 0);
  const [roomCount, setRoomCount] = useState(initial.rooms ?? 1);
  const [promo, setPromo] = useState(initial.promo ?? "");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    initial.room ?? null
  );
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GuestDetails>({ resolver: zodResolver(guestDetailsSchema) });

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.slug === selectedSlug) ?? null,
    [rooms, selectedSlug]
  );

  const nights =
    range.from && range.to
      ? nightsBetween(toISODateString(range.from), toISODateString(range.to))
      : 0;
  const estimate = selectedRoom ? nights * selectedRoom.priceFrom * roomCount : 0;

  const datesComplete = nights > 0;

  async function onConfirm(details: GuestDetails) {
    if (!range.from || !range.to || !selectedRoom) return;
    setStatus("sending");
    const response = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkIn: toISODateString(range.from),
        checkOut: toISODateString(range.to),
        adults,
        children,
        rooms: roomCount,
        roomSlug: selectedRoom.slug,
        promoCode: promo.trim() ? promo.trim().toUpperCase() : undefined,
        ...details,
      }),
    });
    if (!response.ok) {
      setStatus("error");
      return;
    }
    const payload = (await response.json()) as { reference: string };
    setReference(payload.reference);
  }

  /* ── Confirmation ─────────────────────────────────────────────── */
  if (reference && selectedRoom && range.from && range.to) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl rounded-xl bg-white p-10 text-center shadow-luxury md:p-14"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-forest-900 text-gold-400">
          <Check className="size-7" />
        </span>
        <p className="eyebrow mt-8">Request Received</p>
        <h2 className="font-display mt-4 text-4xl font-medium text-forest-950">
          Thank you — we are holding your dates
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed font-light text-charcoal-900/65">
          Your reservation request for the{" "}
          <strong className="font-medium">{selectedRoom.name}</strong>,{" "}
          {formatDate(range.from)} to {formatDate(range.to)}, has reached our
          reservations team. A confirmation with payment details will arrive
          by email shortly.
        </p>
        <p className="mt-8 inline-block rounded-full border border-gold-500/40 bg-cream-50 px-8 py-3 text-sm tracking-[0.2em] text-forest-900">
          Reference · <strong className="text-gold-600">{reference}</strong>
        </p>
        <p className="mt-8 text-xs font-light text-charcoal-900/50">
          Questions? Call {siteConfig.contact.reservations} — we answer around
          the clock.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-3">
      {/* Steps + content */}
      <div className="lg:col-span-2">
        {/* Stepper */}
        <ol className="flex items-center gap-2" aria-label="Booking steps">
          {steps.map((label, index) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => index < step && setStep(index)}
                disabled={index > step}
                className={cn(
                  "flex items-center gap-3 text-left",
                  index > step && "cursor-not-allowed opacity-45"
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border text-xs transition-all duration-500",
                    index < step
                      ? "border-gold-500 bg-gold-500 text-charcoal-950"
                      : index === step
                        ? "border-forest-900 bg-forest-900 text-gold-400"
                        : "border-forest-800/25 text-forest-900"
                  )}
                >
                  {index < step ? <Check className="size-4" /> : index + 1}
                </span>
                <span className="hidden text-[10px] font-medium tracking-[0.22em] text-forest-900 uppercase md:block">
                  {label}
                </span>
              </button>
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px flex-1 transition-colors duration-500",
                    index < step ? "bg-gold-500" : "bg-forest-800/15"
                  )}
                />
              ) : null}
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          {/* Step 1 — Dates & guests */}
          {step === 0 ? (
            <motion.div
              key="dates"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <CalendarRange value={range} onChange={setRange} />

              <div className="mt-8 grid gap-8 rounded-xl border border-forest-800/10 bg-white p-7 shadow-luxury-sm md:grid-cols-2">
                <div className="space-y-4">
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
                  <CounterField
                    label="Rooms"
                    tone="dark"
                    value={roomCount}
                    min={1}
                    max={siteConfig.booking.maxRooms}
                    onChange={setRoomCount}
                  />
                </div>
                <div>
                  <Label htmlFor="booking-promo" className="text-forest-900">
                    <span className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-gold-600" /> Promo Code
                    </span>
                  </Label>
                  <Input
                    id="booking-promo"
                    placeholder="Optional"
                    value={promo}
                    onChange={(event) => setPromo(event.target.value)}
                    className="border-forest-800/20 tracking-[0.2em] text-forest-950 uppercase placeholder:normal-case placeholder:tracking-wide"
                  />
                  {promo.trim() ? (
                    <p className="mt-3 text-xs font-light text-charcoal-900/60">
                      Code <strong>{promo.trim().toUpperCase()}</strong> will be
                      applied and its privileges confirmed with your
                      reservation.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  variant="forest"
                  size="lg"
                  disabled={!datesComplete}
                  onClick={() => setStep(1)}
                >
                  Choose Your Room
                  <ArrowRight />
                </Button>
              </div>
            </motion.div>
          ) : null}

          {/* Step 2 — Room selection */}
          {step === 1 ? (
            <motion.div
              key="rooms"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 space-y-6"
            >
              {rooms.map((room) => {
                const selected = room.slug === selectedSlug;
                return (
                  <article
                    key={room.slug}
                    className={cn(
                      "grid gap-6 overflow-hidden rounded-xl border bg-white transition-all duration-500 sm:grid-cols-[220px_1fr_auto]",
                      selected
                        ? "border-gold-500 shadow-luxury"
                        : "border-forest-800/10 shadow-luxury-sm hover:border-gold-500/40"
                    )}
                  >
                    <div className="relative min-h-40 bg-forest-950 sm:min-h-full">
                      {room.images[0]?.src ? (
                        <Image
                          src={room.images[0].src}
                          alt={room.images[0].alt || room.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 220px"
                          className="object-cover"
                          unoptimized={room.images[0].src.startsWith("/media/")}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest-900 to-forest-950">
                          <BedDouble className="size-8 text-gold-500/70" />
                        </div>
                      )}
                    </div>
                    <div className="px-6 py-5 sm:px-0">
                      <p className="text-[9px] font-medium tracking-[0.28em] text-gold-600 uppercase">
                        {room.category === "suite" ? "Suite" : "Room"} ·{" "}
                        {room.size} · {room.view}
                      </p>
                      <h3 className="font-display mt-2 text-2xl font-medium text-forest-950">
                        {room.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm font-light text-charcoal-900/60">
                        {room.shortDescription}
                      </p>
                      <p className="mt-3 flex items-center gap-2 text-xs font-light text-charcoal-900/55">
                        <Users className="size-3.5 text-gold-600" />
                        {room.occupancy}
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-4 px-6 pb-6 sm:flex-col sm:items-end sm:justify-center sm:py-6">
                      <p className="text-right">
                        <span className="block text-[9px] tracking-[0.26em] text-charcoal-900/45 uppercase">
                          From
                        </span>
                        <span className="font-display text-2xl font-medium text-forest-950">
                          {formatCurrency(room.priceFrom)}
                        </span>
                        <span className="block text-[11px] font-light text-charcoal-900/50">
                          per night
                        </span>
                      </p>
                      <Button
                        type="button"
                        variant={selected ? "gold" : "outline-dark"}
                        size="sm"
                        onClick={() => setSelectedSlug(room.slug)}
                      >
                        {selected ? (
                          <>
                            Selected <Check />
                          </>
                        ) : (
                          "Select"
                        )}
                      </Button>
                    </div>
                  </article>
                );
              })}

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep(0)}
                >
                  <ArrowLeft />
                  Dates
                </Button>
                <Button
                  type="button"
                  variant="forest"
                  size="lg"
                  disabled={!selectedRoom}
                  onClick={() => setStep(2)}
                >
                  Guest Details
                  <ArrowRight />
                </Button>
              </div>
            </motion.div>
          ) : null}

          {/* Step 3 — Guest details */}
          {step === 2 ? (
            <motion.form
              key="details"
              onSubmit={handleSubmit(onConfirm)}
              noValidate
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 rounded-xl border border-forest-800/10 bg-white p-8 shadow-luxury-sm md:p-10"
            >
              <h2 className="font-display text-3xl font-medium text-forest-950">
                Who shall we welcome?
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <Label htmlFor="guest-name" className="text-forest-900">
                    Full Name
                  </Label>
                  <Input
                    id="guest-name"
                    autoComplete="name"
                    placeholder="Alexandra Laurent"
                    className="border-forest-800/20 text-forest-950"
                    {...register("guestName")}
                  />
                  <FieldError message={errors.guestName?.message} />
                </div>
                <div>
                  <Label htmlFor="guest-email" className="text-forest-900">
                    Email
                  </Label>
                  <Input
                    id="guest-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="border-forest-800/20 text-forest-950"
                    {...register("guestEmail")}
                  />
                  <FieldError message={errors.guestEmail?.message} />
                </div>
              </div>
              <div className="mt-6">
                <Label htmlFor="guest-phone" className="text-forest-900">
                  Phone
                </Label>
                <Input
                  id="guest-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 000 0000"
                  className="border-forest-800/20 text-forest-950"
                  {...register("guestPhone")}
                />
                <FieldError message={errors.guestPhone?.message} />
              </div>
              <div className="mt-6">
                <Label htmlFor="guest-notes" className="text-forest-900">
                  Special Requests{" "}
                  <span className="normal-case opacity-50">(optional)</span>
                </Label>
                <Textarea
                  id="guest-notes"
                  placeholder="Anniversaries, allergies, arrival times — anything we should prepare for."
                  className="border-forest-800/20 text-forest-950"
                  {...register("notes")}
                />
              </div>

              {status === "error" ? (
                <p role="alert" className="mt-6 text-sm font-light text-red-500">
                  We could not process your request. Please try again, or call
                  us at {siteConfig.contact.reservations}.
                </p>
              ) : null}

              <div className="mt-9 flex justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft />
                  Rooms
                </Button>
                <Button
                  type="submit"
                  variant="gold"
                  size="lg"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Confirming…" : "Confirm Request"}
                  <Check />
                </Button>
              </div>
            </motion.form>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Summary sidebar */}
      <aside>
        <div className="lg:sticky lg:top-28">
          <div className="glass-dark shadow-luxury rounded-xl p-8">
            <p className="eyebrow">Your Stay</p>
            <dl className="mt-6 space-y-5 text-sm font-light text-cream-200/85">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <div>
                  <dt className="text-[9px] tracking-[0.28em] text-cream-200/50 uppercase">
                    Dates
                  </dt>
                  <dd className="mt-1">
                    {range.from && range.to
                      ? `${formatDate(range.from)} → ${formatDate(range.to)}`
                      : "Select your dates"}
                  </dd>
                  {nights > 0 ? (
                    <dd className="mt-0.5 text-xs text-gold-300">
                      {nights} night{nights > 1 ? "s" : ""}
                    </dd>
                  ) : null}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <div>
                  <dt className="text-[9px] tracking-[0.28em] text-cream-200/50 uppercase">
                    Guests
                  </dt>
                  <dd className="mt-1">
                    {adults} adult{adults > 1 ? "s" : ""}
                    {children > 0
                      ? `, ${children} child${children > 1 ? "ren" : ""}`
                      : ""}{" "}
                    · {roomCount} room{roomCount > 1 ? "s" : ""}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BedDouble className="mt-0.5 size-4 shrink-0 text-gold-400" />
                <div>
                  <dt className="text-[9px] tracking-[0.28em] text-cream-200/50 uppercase">
                    Room
                  </dt>
                  <dd className="mt-1">
                    {selectedRoom ? selectedRoom.name : "Not selected yet"}
                  </dd>
                </div>
              </div>
              {promo.trim() ? (
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-gold-400" />
                  <div>
                    <dt className="text-[9px] tracking-[0.28em] text-cream-200/50 uppercase">
                      Promo Code
                    </dt>
                    <dd className="mt-1 tracking-[0.2em] uppercase">
                      {promo.trim()}
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>

            {estimate > 0 ? (
              <div className="mt-7 border-t border-ivory/15 pt-6">
                <p className="flex items-baseline justify-between">
                  <span className="text-xs font-light tracking-wider text-cream-200/60 uppercase">
                    Estimated total
                  </span>
                  <span className="font-display text-3xl font-medium text-gold-400">
                    {formatCurrency(estimate)}
                  </span>
                </p>
                <p className="mt-2 text-[11px] font-light text-cream-200/50">
                  Taxes and service confirmed at reservation. No payment taken
                  today.
                </p>
              </div>
            ) : null}
          </div>

          <p className="mt-5 text-center text-xs font-light text-charcoal-900/55">
            Prefer to book by phone? {siteConfig.contact.reservations}
          </p>
        </div>
      </aside>
    </div>
  );
}
