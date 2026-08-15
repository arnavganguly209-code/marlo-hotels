"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig | null>(null);

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
      paymentMethod: "PAYPAL",
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
            Pay securely with PayPal Checkout. Your booking is confirmed only
            after payment is verified on our server.
          </p>
        </div>

        <div className="rounded-xl border border-gold-500/40 bg-cream-50 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gold-700 uppercase">
            Payment Method
          </p>
          <p className="mt-2 text-sm font-medium text-forest-950">PayPal</p>
          <p className="mt-0.5 text-xs font-light text-charcoal-900/55">
            Pay securely with PayPal Checkout
          </p>
        </div>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <div className="space-y-4 border-t border-forest-800/10 pt-5">
          <p className="text-sm font-light text-charcoal-900/60">
            You will be charged{" "}
            <span className="font-medium text-forest-950">
              {formatCurrency(grandTotal)}
            </span>{" "}
            USD.
          </p>
          {!paypalConfig ? (
            <p className="text-sm text-charcoal-900/55">
              Preparing PayPal Checkout…
            </p>
          ) : !paypalReady ? (
            <p className="text-sm text-red-700">
              PayPal is temporarily unavailable. Please try again shortly.
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
                  disabled={paypalBusy}
                  createOrder={async () => {
                    setError(null);
                    setPaypalBusy(true);
                    try {
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
          selected. PayPal is the only payment method for online reservations.
        </p>
      </aside>
    </div>
  );
}
