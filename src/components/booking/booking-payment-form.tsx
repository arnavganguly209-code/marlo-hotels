"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  PAYMENT_METHOD_PAYPAL,
  PAYMENT_METHOD_PAY_AT_HOTEL,
} from "@/lib/payment-method";
import { formatCurrency, formatDate } from "@/lib/utils";

type PayPalConfig = {
  clientId: string | null;
  environment: "sandbox" | "live";
  currency: string;
  configured: boolean;
};

function PayPalButtonsBusy() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  if (isRejected) {
    return (
      <p className="text-sm text-red-700">
        PayPal could not be loaded. Please refresh the page and try again.
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
  const [paypalBusy, setPaypalBusy] = useState(false);
  const [payAtHotelBusy, setPayAtHotelBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);
  const [method, setMethod] = useState<"PAYPAL" | "PAY_AT_HOTEL">("PAYPAL");
  const [intentToken, setIntentToken] = useState<string | null>(null);

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
      pickupDate: params.get("pickupDate") || "",
      pickupTime: params.get("pickupTime") || params.get("flightArrivalTime") || "",
      pickupNotes: params.get("pickupNotes") || "",
      total,
      taxes: Math.round(total * 0.1),
      mealPlanLabel: breakfast ? "With Breakfast" : "Without Breakfast",
    };
  }, [params]);

  const pickupFee = summary.airportPickup ? summary.pickupFee : 0;
  const roomPortion = Math.max(0, summary.total - pickupFee);
  const taxes = Math.round(roomPortion * 0.1);
  const staySubtotal = Math.max(0, roomPortion - taxes);
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

  useEffect(() => {
    if (method !== "PAY_AT_HOTEL") return;
    if (!summary.roomSlug || !summary.checkIn || !summary.checkOut) return;
    let cancelled = false;
    void (async () => {
      try {
        const query = new URLSearchParams({
          roomSlug: summary.roomSlug,
          checkIn: summary.checkIn,
          checkOut: summary.checkOut,
        });
        const response = await fetch(`/api/booking/intent?${query.toString()}`);
        const data = (await response.json()) as { token?: string };
        if (!cancelled) setIntentToken(data.token || null);
      } catch {
        if (!cancelled) setIntentToken(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [method, summary.roomSlug, summary.checkIn, summary.checkOut]);

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
        ? summary.pickupTime || summary.flightArrivalTime || undefined
        : undefined,
      pickupDate: summary.airportPickup
        ? summary.pickupDate || undefined
        : undefined,
      pickupTime: summary.airportPickup
        ? summary.pickupTime || undefined
        : undefined,
      pickupNotes: summary.airportPickup
        ? summary.pickupNotes || undefined
        : undefined,
    };
  }

  function goToSuccess(input: {
    reference: string;
    paymentStatus?: string;
    status?: string;
    paymentMethod: string;
    total?: number;
  }) {
    const success = new URLSearchParams({
      reference: input.reference,
      total: String(input.total ?? grandTotal),
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
      airportPickup: summary.airportPickup ? "1" : "0",
      pickupVehicles: String(summary.pickupVehicles || 0),
      pickupFee: String(summary.pickupFee || 0),
      flightNumber: summary.flightNumber || "",
      pickupDate: summary.pickupDate || "",
      pickupTime: summary.pickupTime || "",
      pickupNotes: summary.pickupNotes || "",
      notes: summary.notes || "",
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

  async function confirmPayAtHotel() {
    setError(null);
    setPayAtHotelBusy(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingPayload(),
          paymentMethod: PAYMENT_METHOD_PAY_AT_HOTEL,
          intentToken: intentToken || undefined,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        reference?: string;
        amount?: number;
        error?: string;
        message?: string;
        paymentStatus?: string;
        status?: string;
      };
      if (!response.ok || !result.ok || !result.reference) {
        throw new Error(
          result.message || result.error || "Could not complete Pay at Hotel booking"
        );
      }
      goToSuccess({
        reference: result.reference,
        paymentMethod: PAYMENT_METHOD_PAY_AT_HOTEL,
        paymentStatus: result.paymentStatus || "UNPAID",
        status: result.status || "PENDING",
        total: typeof result.amount === "number" ? result.amount : grandTotal,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not complete Pay at Hotel booking"
      );
      setPayAtHotelBusy(false);
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
            Choose PayPal to pay now, or Pay at Hotel to reserve and settle the
            balance on arrival. Online payment is confirmed only after PayPal
            capture is verified on our server.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMethod("PAYPAL")}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              method === "PAYPAL"
                ? "border-gold-500 bg-cream-50 shadow-luxury-sm"
                : "border-forest-800/15 bg-white hover:border-gold-500/50"
            }`}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
              Option 1
            </p>
            <p className="mt-2 text-sm font-medium text-forest-950">
              Pay Now with PayPal
            </p>
            <p className="mt-0.5 text-xs font-light text-charcoal-900/55">
              Secure PayPal Checkout. Booking confirmed after verified payment.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMethod("PAY_AT_HOTEL")}
            className={`rounded-xl border px-4 py-4 text-left transition ${
              method === "PAY_AT_HOTEL"
                ? "border-gold-500 bg-cream-50 shadow-luxury-sm"
                : "border-forest-800/15 bg-white hover:border-gold-500/50"
            }`}
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
              Option 2
            </p>
            <p className="mt-2 text-sm font-medium text-forest-950">
              Pay at Hotel
            </p>
            <p className="mt-0.5 text-xs font-light text-charcoal-900/55">
              Reserve now. Payment remains due at the hotel and is not taken online.
            </p>
          </button>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="space-y-4 border-t border-forest-800/10 pt-5">
          <p className="text-sm font-light text-charcoal-900/60">
            {method === "PAYPAL" ? (
              <>
                You will be charged{" "}
                <span className="font-medium text-forest-950">
                  {formatCurrency(grandTotal)}
                </span>{" "}
                USD now via PayPal.
              </>
            ) : (
              <>
                Amount due at the hotel:{" "}
                <span className="font-medium text-forest-950">
                  {formatCurrency(grandTotal)}
                </span>{" "}
                USD. No online charge will be taken.
              </>
            )}
          </p>
          {method === "PAY_AT_HOTEL" ? (
            <button
              type="button"
              disabled={payAtHotelBusy || !summary.roomSlug || !intentToken}
              onClick={() => void confirmPayAtHotel()}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-forest-900 px-5 text-[11px] font-semibold tracking-[0.18em] text-ivory uppercase transition hover:bg-forest-800 disabled:opacity-60"
            >
              {payAtHotelBusy ? "Confirming reservation…" : "Confirm Pay at Hotel"}
            </button>
          ) : !paypalConfig ? (
            <p className="text-sm text-charcoal-900/55">
              Preparing PayPal Checkout…
            </p>
          ) : !paypalReady ? (
            <p className="text-sm text-red-700">
              PayPal is temporarily unavailable. Please try again shortly.
            </p>
          ) : (
            <div className="paypal-checkout-frame relative z-0 w-full max-w-full rounded-xl border border-forest-800/20 bg-white p-4 shadow-[inset_0_0_0_1px_rgba(18,52,41,0.04)] sm:p-5">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-forest-900/70 uppercase">
                PayPal Checkout
              </p>
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
                    height: 48,
                    tagline: false,
                  }}
                  disabled={paypalBusy}
                  forceReRender={[
                    String(grandTotal),
                    summary.roomSlug,
                    summary.checkIn,
                    summary.checkOut,
                  ]}
                  createOrder={async () => {
                    setError(null);
                    setPaypalBusy(true);
                    try {
                      if (
                        !summary.roomSlug ||
                        !summary.checkIn ||
                        !summary.checkOut ||
                        !summary.guestEmail ||
                        !summary.guestName
                      ) {
                        throw new Error(
                          "Missing stay or guest details. Please return to checkout and try again."
                        );
                      }
                      const response = await fetch("/api/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bookingPayload()),
                      });
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
                      const response = await fetch("/api/paypal/capture-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId: data.orderID }),
                      });
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
                        paymentMethod: PAYMENT_METHOD_PAYPAL,
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
                      typeof data.orderID === "string"
                        ? data.orderID
                        : undefined;
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
          <div className="flex justify-between gap-4 border-t border-ivory/15 pt-3">
            <dt>Stay subtotal</dt>
            <dd className="text-ivory">{formatCurrency(staySubtotal)}</dd>
          </div>
          {summary.airportPickup ? (
            <div className="flex justify-between gap-4">
              <dt>
                Airport pickup ({summary.pickupVehicles} vehicle
                {summary.pickupVehicles > 1 ? "s" : ""})
              </dt>
              <dd className="text-right text-ivory">
                {formatCurrency(pickupFee)}
              </dd>
            </div>
          ) : null}
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
          selected. PayPal charges are captured only after server verification.
          Pay at Hotel reservations stay unpaid until you settle at the hotel.
        </p>
      </aside>
    </div>
  );
}
