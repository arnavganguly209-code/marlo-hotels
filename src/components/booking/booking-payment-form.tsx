"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export function BookingPaymentForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    billingName: "",
    billingCountry: "",
    billingAddress: "",
  });

  const total = Number(params.get("total") || 0);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (
      !form.cardHolder.trim() ||
      !form.cardNumber.trim() ||
      !form.expiry.trim() ||
      !form.cvv.trim() ||
      !form.billingName.trim() ||
      !form.billingCountry.trim() ||
      !form.billingAddress.trim()
    ) {
      setError("Please complete every payment field.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: params.get("checkIn"),
          checkOut: params.get("checkOut"),
          adults: Number(params.get("adults") || 2),
          children: Number(params.get("children") || 0),
          rooms: Number(params.get("rooms") || 1),
          roomSlug: params.get("room"),
          promoCode: params.get("promo") || undefined,
          guestName: params.get("guestName"),
          guestEmail: params.get("guestEmail"),
          guestPhone: params.get("guestPhone"),
          whatsapp: params.get("whatsapp"),
          country: params.get("country"),
          arrivalTime: params.get("arrivalTime"),
          notes: params.get("notes"),
          breakfast: params.get("breakfast") === "1",
          totalAmount: total,
          billingName: form.billingName,
          billingCountry: form.billingCountry,
          billingAddress: form.billingAddress,
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
      router.push(
        `/booking/success?reference=${encodeURIComponent(result.reference)}&total=${total}`
      );
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-forest-800/10 bg-white p-6 md:p-8"
    >
      <h1 className="font-display text-3xl font-medium text-forest-950">
        Payment
      </h1>
      <p className="text-sm text-charcoal-900/60">
        Total amount{" "}
        <strong className="text-forest-950">{formatCurrency(total)}</strong>
      </p>
      {(
        [
          ["cardHolder", "Card Holder Name"],
          ["cardNumber", "Card Number"],
          ["expiry", "Expiry Date (MM/YY)"],
          ["cvv", "CVV"],
          ["billingName", "Billing Name"],
          ["billingCountry", "Billing Country"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
          {label}
          <input
            required
            value={form[key]}
            onChange={(event) =>
              setForm((current) => ({ ...current, [key]: event.target.value }))
            }
            className="mt-1.5 h-12 w-full rounded-xl border border-forest-800/15 px-4 text-sm normal-case tracking-normal"
          />
        </label>
      ))}
      <label className="block text-[10px] tracking-[0.16em] text-charcoal-900/50 uppercase">
        Billing Address
        <textarea
          required
          rows={3}
          value={form.billingAddress}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              billingAddress: event.target.value,
            }))
          }
          className="mt-1.5 w-full rounded-xl border border-forest-800/15 px-4 py-3 text-sm normal-case tracking-normal"
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="h-12 w-full rounded-xl bg-gold-500 text-[11px] font-semibold tracking-[0.2em] text-charcoal-950 uppercase disabled:opacity-50"
      >
        {saving ? "Processing…" : "Pay Now"}
      </button>
      <p className="text-center text-[11px] text-charcoal-900/45">
        Payment gateway ready — card details are collected for reservation processing.
      </p>
    </form>
  );
}
