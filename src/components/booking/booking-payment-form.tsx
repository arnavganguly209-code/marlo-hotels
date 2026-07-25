"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

type PaymentFormState = {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  billingName: string;
  billingAddress: string;
  billingCountry: string;
  billingCity: string;
  billingPostalCode: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string) {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function BookingPaymentForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentFormState>({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    billingName: "",
    billingAddress: "",
    billingCountry: "",
    billingCity: "",
    billingPostalCode: "",
  });

  const summary = useMemo(() => {
    const total = Number(params.get("total") || 0);
    const adults = Number(params.get("adults") || 2);
    const children = Number(params.get("children") || 0);
    const rooms = Number(params.get("rooms") || 1);
    const breakfast = params.get("breakfast") === "1";
    return {
      roomName: params.get("roomName") || params.get("room") || "Room",
      roomSlug: params.get("room") || "",
      checkIn: params.get("checkIn") || "",
      checkOut: params.get("checkOut") || "",
      adults,
      children,
      rooms,
      breakfast,
      promo: params.get("promo") || "",
      guestName: params.get("guestName") || "",
      guestEmail: params.get("guestEmail") || "",
      guestPhone: params.get("guestPhone") || "",
      whatsapp: params.get("whatsapp") || "",
      country: params.get("country") || "",
      arrivalTime: params.get("arrivalTime") || "",
      notes: params.get("notes") || "",
      total,
      taxes: Math.round(total * 0.1),
      mealPlanLabel: breakfast ? "With Breakfast" : "Without Breakfast",
    };
  }, [params]);

  const taxes = summary.taxes;
  const staySubtotal = Math.max(0, summary.total - taxes);
  const grandTotal = summary.total;

  function update<K extends keyof PaymentFormState>(
    key: K,
    value: PaymentFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (
      !form.cardHolder.trim() ||
      onlyDigits(form.cardNumber).length < 12 ||
      !/^\d{2}\/\d{2}$/.test(form.expiry.trim()) ||
      onlyDigits(form.cvv).length < 3 ||
      !form.billingName.trim() ||
      !form.billingAddress.trim() ||
      !form.billingCountry.trim() ||
      !form.billingCity.trim() ||
      !form.billingPostalCode.trim()
    ) {
      setError("Please complete every payment and billing field.");
      return;
    }
    if (!summary.roomSlug || !summary.checkIn || !summary.checkOut) {
      setError("Missing stay details. Please restart from booking.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: summary.checkIn,
          checkOut: summary.checkOut,
          adults: summary.adults,
          children: summary.children,
          rooms: summary.rooms,
          roomSlug: summary.roomSlug,
          promoCode: summary.promo || undefined,
          guestName: summary.guestName,
          guestEmail: summary.guestEmail,
          guestPhone: summary.guestPhone,
          whatsapp: summary.whatsapp,
          country: summary.country,
          arrivalTime: summary.arrivalTime,
          notes: summary.notes || "None",
          breakfast: summary.breakfast,
          totalAmount: grandTotal,
          billingName: form.billingName.trim(),
          billingCountry: form.billingCountry.trim(),
          billingAddress: `${form.billingAddress.trim()}, ${form.billingCity.trim()}, ${form.billingPostalCode.trim()}`,
          billingCity: form.billingCity.trim(),
          billingPostalCode: form.billingPostalCode.trim(),
          paymentIntent: "CARD_PENDING",
        }),
      });
      const result = (await response.json()) as {
        reference?: string;
        error?: string;
        message?: string;
      };
      if (!response.ok || !result.reference) {
        setError(result.message || result.error || "Booking failed");
        setSaving(false);
        return;
      }
      const success = new URLSearchParams({
        reference: result.reference,
        total: String(grandTotal),
        roomName: summary.roomName,
        room: summary.roomSlug,
        checkIn: summary.checkIn,
        checkOut: summary.checkOut,
        adults: String(summary.adults),
        children: String(summary.children),
        rooms: String(summary.rooms),
        breakfast: summary.breakfast ? "1" : "0",
        guestName: summary.guestName,
        arrivalTime: summary.arrivalTime,
        mealPlan: summary.mealPlanLabel,
      });
      router.push(`/booking/success?${success.toString()}`);
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="space-y-5 rounded-2xl border border-forest-800/10 bg-white p-6 shadow-luxury-sm md:p-8"
      >
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-gold-700 uppercase">
            Secure payment
          </p>
          <h1 className="font-display mt-2 text-3xl font-medium text-forest-950 md:text-4xl">
            Complete your reservation
          </h1>
          <p className="mt-3 text-sm font-light text-charcoal-900/60">
            Card details are collected for reservation processing. No charge is
            taken until our team confirms availability.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase md:col-span-2">
            Card Holder Name
            <input
              required
              value={form.cardHolder}
              onChange={(event) => update("cardHolder", event.target.value)}
              className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
            />
          </label>
          <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase md:col-span-2">
            Card Number
            <input
              required
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="XXXX XXXX XXXX XXXX"
              value={form.cardNumber}
              onChange={(event) =>
                update("cardNumber", formatCardNumber(event.target.value))
              }
              className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
            />
          </label>
          <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
            Expiry
            <input
              required
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={form.expiry}
              onChange={(event) =>
                update("expiry", formatExpiry(event.target.value))
              }
              className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
            />
          </label>
          <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
            CVV
            <input
              required
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="***"
              value={form.cvv}
              onChange={(event) =>
                update("cvv", onlyDigits(event.target.value).slice(0, 4))
              }
              className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
            />
          </label>
        </div>

        <div className="border-t border-forest-800/10 pt-5">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
            Billing details
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase md:col-span-2">
              Billing Name
              <input
                required
                value={form.billingName}
                onChange={(event) => update("billingName", event.target.value)}
                className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
              />
            </label>
            <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase md:col-span-2">
              Billing Address
              <textarea
                required
                rows={3}
                value={form.billingAddress}
                onChange={(event) =>
                  update("billingAddress", event.target.value)
                }
                className="mt-1.5 w-full rounded-xl border border-forest-800/15 px-4 py-3 text-sm normal-case tracking-normal"
              />
            </label>
            <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
              Billing Country
              <input
                required
                value={form.billingCountry}
                onChange={(event) =>
                  update("billingCountry", event.target.value)
                }
                className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
              />
            </label>
            <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
              Billing City
              <input
                required
                value={form.billingCity}
                onChange={(event) => update("billingCity", event.target.value)}
                className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
              />
            </label>
            <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase md:col-span-2">
              Postal Code
              <input
                required
                value={form.billingPostalCode}
                onChange={(event) =>
                  update("billingPostalCode", event.target.value)
                }
                className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
              />
            </label>
          </div>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="h-12 w-full rounded-xl bg-gold-500 text-[11px] font-semibold tracking-[0.2em] text-charcoal-950 uppercase transition hover:bg-gold-400 disabled:opacity-50"
        >
          {saving ? "Processing…" : "Pay Now"}
        </button>
      </form>

      <aside className="h-fit rounded-2xl border border-forest-800/10 bg-forest-950 p-6 text-cream-100 shadow-luxury md:p-8">
        <p className="text-[10px] font-semibold tracking-[0.28em] text-gold-400 uppercase">
          Booking summary
        </p>
        <h2 className="font-display mt-3 text-2xl font-medium text-ivory">
          {summary.roomName}
        </h2>
        <dl className="mt-6 space-y-3 text-sm font-light text-cream-200/80">
          <div className="flex justify-between gap-4">
            <dt>Guest</dt>
            <dd className="text-right text-ivory">{summary.guestName || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Dates</dt>
            <dd className="text-right text-ivory">
              {summary.checkIn && summary.checkOut
                ? `${formatDate(summary.checkIn)} → ${formatDate(summary.checkOut)}`
                : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Guests</dt>
            <dd className="text-right text-ivory">
              {summary.adults} adults
              {summary.children > 0 ? ` · ${summary.children} children` : ""} ·{" "}
              {summary.rooms} room{summary.rooms > 1 ? "s" : ""}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Meal plan</dt>
            <dd className="text-right text-ivory">{summary.mealPlanLabel}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-ivory/15 pt-3">
            <dt>Stay subtotal</dt>
            <dd className="text-ivory">{formatCurrency(staySubtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Taxes & service</dt>
            <dd className="text-ivory">{formatCurrency(taxes)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Extra guest charges</dt>
            <dd className="text-ivory">Included when applicable</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-ivory/15 pt-3 text-base font-medium text-gold-400">
            <dt>Grand total</dt>
            <dd>{formatCurrency(grandTotal)}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[11px] leading-relaxed text-cream-200/50">
          Extra guest charges and meal plan are included in the stay total when
          selected. Final confirmation is issued by reservations.
        </p>
      </aside>
    </div>
  );
}
