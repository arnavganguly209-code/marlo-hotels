"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

type PaymentMethod = "PAYPAL" | "CARD";

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

type PayPalConfig = {
  clientId: string | null;
  environment: "sandbox" | "live";
  currency: string;
  configured: boolean;
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

function PayPalButtonsBusy() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  if (isRejected) {
    return (
      <p className="text-sm text-red-700">
        PayPal could not be loaded. Please refresh or try Card payment.
      </p>
    );
  }
  if (isPending) {
    return (
      <p className="text-sm text-charcoal-900/55">Loading PayPal Checkout…</p>
    );
  }
  return null;
}

export function BookingPaymentForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [method, setMethod] = useState<PaymentMethod>("PAYPAL");
  const [saving, setSaving] = useState(false);
  const [paypalBusy, setPaypalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
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
    const children = Number(params.get("children") || 1);
    const rooms = Number(params.get("rooms") || 1);
    const breakfast = params.get("breakfast") === "1";
    const airportPickup = params.get("airportPickup") === "1";
    const pickupVehicles = Number(params.get("pickupVehicles") || 0);
    const pickupFee = Number(params.get("pickupFee") || 0);
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
      airportPickup,
      pickupVehicles,
      pickupFee,
      flightNumber: params.get("flightNumber") || "",
      flightArrivalTime: params.get("flightArrivalTime") || "",
      total,
      taxes: Math.round(total * 0.1),
      mealPlanLabel: breakfast ? "With Breakfast" : "Without Breakfast",
    };
  }, [params]);

  const taxes = summary.taxes;
  const staySubtotal = Math.max(0, summary.total - taxes);
  const grandTotal = summary.total;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/paypal/client-config");
        const data = (await response.json()) as PayPalConfig;
        if (!cancelled) setPaypalConfig(data);
      } catch {
        if (!cancelled) {
          setPaypalConfig({
            clientId: null,
            environment: "sandbox",
            currency: "USD",
            configured: false,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update<K extends keyof PaymentFormState>(
    key: K,
    value: PaymentFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function bookingPayload() {
    return {
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
      airportPickup: summary.airportPickup || undefined,
      pickupVehicles: summary.airportPickup
        ? summary.pickupVehicles || 1
        : undefined,
      flightNumber: summary.airportPickup
        ? summary.flightNumber || undefined
        : undefined,
      flightArrivalTime: summary.airportPickup
        ? summary.flightArrivalTime || undefined
        : undefined,
    };
  }

  function goToSuccess(input: {
    reference: string;
    paymentMethod: PaymentMethod;
    paymentStatus?: string;
    status?: string;
  }) {
    const success = new URLSearchParams({
      reference: input.reference,
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
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus || "",
      status: input.status || "",
    });
    router.push(`/booking/success?${success.toString()}`);
  }

  async function cancelPayPalCheckout(orderId?: string, bookingId?: string) {
    try {
      await fetch("/api/paypal/cancel-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, bookingId }),
      });
    } catch {
      /* ignore — guest already cancelled */
    }
  }

  async function onCardSubmit(event: React.FormEvent) {
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
          ...bookingPayload(),
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
      goToSuccess({
        reference: result.reference,
        paymentMethod: "CARD",
        paymentStatus: "UNPAID",
        status: "PENDING",
      });
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  const paypalReady =
    Boolean(paypalConfig?.configured && paypalConfig.clientId) &&
    Boolean(summary.roomSlug && summary.checkIn && summary.checkOut);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5 rounded-2xl border border-forest-800/10 bg-white p-6 shadow-luxury-sm md:p-8">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-gold-700 uppercase">
            Secure payment
          </p>
          <h1 className="font-display mt-2 text-3xl font-medium text-forest-950 md:text-4xl">
            Complete your reservation
          </h1>
          <p className="mt-3 text-sm font-light text-charcoal-900/60">
            Choose PayPal for immediate confirmation, or Card to request a
            reservation with our team.
          </p>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
            Payment Method
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                {
                  id: "PAYPAL" as const,
                  title: "PayPal",
                  hint: "Pay securely with PayPal Checkout",
                },
                {
                  id: "CARD" as const,
                  title: "Card",
                  hint: "Card details for reservation processing",
                },
              ] as const
            ).map((option) => {
              const selected = method === option.id;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                    selected
                      ? "border-gold-500 bg-cream-50"
                      : "border-forest-800/15 hover:border-forest-800/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-1"
                    checked={selected}
                    onChange={() => {
                      setMethod(option.id);
                      setError(null);
                    }}
                  />
                  <span>
                    <span className="block text-sm font-medium text-forest-950">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-xs font-light text-charcoal-900/55">
                      {option.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {method === "PAYPAL" ? (
          <div className="space-y-4 border-t border-forest-800/10 pt-5">
            <p className="text-sm font-light text-charcoal-900/60">
              You will be charged{" "}
              <span className="font-medium text-forest-950">
                {formatCurrency(grandTotal)}
              </span>{" "}
              USD. Your booking is confirmed only after PayPal payment is
              verified on our server.
            </p>
            {!paypalConfig ? (
              <p className="text-sm text-charcoal-900/55">
                Preparing PayPal Checkout…
              </p>
            ) : !paypalReady ? (
              <p className="text-sm text-red-700">
                PayPal is temporarily unavailable. Please choose Card or try
                again later.
              </p>
            ) : (
              <div className="relative z-0 w-full max-w-full overflow-hidden">
                <PayPalScriptProvider
                  options={{
                    clientId: paypalConfig.clientId!,
                    currency: "USD",
                    intent: "capture",
                    components: "buttons",
                    ...(paypalConfig.environment === "sandbox"
                      ? { "enable-funding": "paypal" }
                      : {}),
                  }}
                >
                  <PayPalButtonsBusy />
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      color: "gold",
                      shape: "rect",
                      label: "paypal",
                      height: 45,
                    }}
                    disabled={paypalBusy || saving}
                    createOrder={async () => {
                      setError(null);
                      setPaypalBusy(true);
                      try {
                        const response = await fetch(
                          "/api/paypal/create-order",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(bookingPayload()),
                          }
                        );
                        const result = (await response.json()) as {
                          orderId?: string;
                          bookingId?: string;
                          error?: string;
                          message?: string;
                        };
                        if (!response.ok || !result.orderId) {
                          throw new Error(
                            result.message ||
                              result.error ||
                              "Could not start PayPal checkout"
                          );
                        }
                        return result.orderId;
                      } catch (err) {
                        setPaypalBusy(false);
                        const message =
                          err instanceof Error
                            ? err.message
                            : "Could not start PayPal checkout";
                        setError(message);
                        throw err;
                      }
                    }}
                    onApprove={async (data) => {
                      setPaypalBusy(true);
                      setError(null);
                      try {
                        const response = await fetch(
                          "/api/paypal/capture-order",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ orderId: data.orderID }),
                          }
                        );
                        const result = (await response.json()) as {
                          ok?: boolean;
                          reference?: string;
                          error?: string;
                          message?: string;
                          paymentStatus?: string;
                          status?: string;
                        };
                        if (!response.ok || !result.ok || !result.reference) {
                          setError(
                            result.message ||
                              result.error ||
                              "PayPal payment could not be verified. Your reservation has not been confirmed."
                          );
                          setPaypalBusy(false);
                          return;
                        }
                        goToSuccess({
                          reference: result.reference,
                          paymentMethod: "PAYPAL",
                          paymentStatus: result.paymentStatus || "PAID",
                          status: result.status || "CONFIRMED",
                        });
                      } catch {
                        setError(
                          "Payment verification failed. Your reservation has not been confirmed."
                        );
                        setPaypalBusy(false);
                      }
                    }}
                    onCancel={async (data) => {
                      setPaypalBusy(false);
                      const cancelledOrderId =
                        typeof data.orderID === "string" ? data.orderID : undefined;
                      await cancelPayPalCheckout(cancelledOrderId);
                      setError(
                        "Payment was cancelled. Your reservation has not been confirmed."
                      );
                    }}
                    onError={async () => {
                      setPaypalBusy(false);
                      setError(
                        "PayPal payment failed. Your reservation has not been confirmed. You may try again."
                      );
                    }}
                  />
                </PayPalScriptProvider>
                {paypalBusy ? (
                  <p className="mt-3 text-sm text-charcoal-900/55">
                    Confirming payment with Marlo Hotels…
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={(event) => void onCardSubmit(event)}
            className="space-y-5 border-t border-forest-800/10 pt-5"
          >
            <p className="text-sm font-light text-charcoal-900/60">
              Card details are collected for reservation processing. No charge is
              taken until our team confirms availability.
            </p>

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
                    onChange={(event) =>
                      update("billingName", event.target.value)
                    }
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
                    onChange={(event) =>
                      update("billingCity", event.target.value)
                    }
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

            <button
              type="submit"
              disabled={saving}
              className="h-12 w-full rounded-xl bg-gold-500 text-[11px] font-semibold tracking-[0.2em] text-charcoal-950 uppercase transition hover:bg-gold-400 disabled:opacity-50"
            >
              {saving ? "Processing…" : "Pay Now"}
            </button>
          </form>
        )}
      </div>

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
          {summary.airportPickup ? (
            <div className="flex justify-between gap-4">
              <dt>Airport pickup</dt>
              <dd className="text-right text-ivory">
                {summary.pickupVehicles} vehicle
                {summary.pickupVehicles > 1 ? "s" : ""}
                {summary.flightNumber ? ` · ${summary.flightNumber}` : ""}
                {summary.flightArrivalTime
                  ? ` · ${summary.flightArrivalTime}`
                  : ""}
              </dd>
            </div>
          ) : null}
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
          selected. PayPal bookings are confirmed only after successful capture.
        </p>
      </aside>
    </div>
  );
}
