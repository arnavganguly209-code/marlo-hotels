import "server-only";

import { siteConfig } from "@/lib/site";

export type PayPalEnvironment = "sandbox" | "live";

type PayPalTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type PayPalAmount = {
  currency_code: string;
  value: string;
};

export type PayPalOrder = {
  id: string;
  status: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    amount?: PayPalAmount;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount?: PayPalAmount;
        create_time?: string;
      }>;
    };
  }>;
};

function envName(): PayPalEnvironment {
  const raw = (process.env.PAYPAL_ENVIRONMENT || "sandbox").trim().toLowerCase();
  return raw === "live" || raw === "production" ? "live" : "sandbox";
}

export function paypalApiBase() {
  return envName() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function paypalClientId() {
  return process.env.PAYPAL_CLIENT_ID?.trim() || "";
}

function paypalClientSecret() {
  return process.env.PAYPAL_CLIENT_SECRET?.trim() || "";
}

export function paypalConfigured() {
  return Boolean(paypalClientId() && paypalClientSecret());
}

export function paypalPublicConfig() {
  return {
    clientId: paypalClientId(),
    environment: envName(),
    currency: "USD",
    configured: paypalConfigured(),
  };
}

function moneyValue(amount: number) {
  return amount.toFixed(2);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken() {
  const clientId = paypalClientId();
  const secret = paypalClientSecret();
  if (!clientId || !secret) {
    throw new Error("PayPal is not configured on the server");
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value;
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  let response: Response;
  try {
    response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new Error("Could not reach PayPal to start checkout");
  }
  const data = (await response.json().catch(() => ({}))) as PayPalTokenResponse;
  if (!response.ok || !data.access_token) {
    console.error("[paypal] OAuth failed", {
      status: response.status,
      error: data.error || data.error_description || "unknown",
    });
    throw new Error("Could not authenticate with PayPal");
  }

  cachedToken = {
    value: data.access_token,
    expiresAt: now + Math.max(60, Number(data.expires_in || 300)) * 1000,
  };
  return cachedToken.value;
}

function paypalErrorMessage(
  data: {
    message?: string;
    name?: string;
    details?: Array<{ issue?: string; description?: string }>;
  },
  status: number
) {
  const detail = data.details?.[0];
  return (
    detail?.description ||
    detail?.issue ||
    data.message ||
    `PayPal request failed (${status})`
  );
}

async function paypalFetch<T>(
  path: string,
  init?: RequestInit & { idempotencyKey?: string }
): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.idempotencyKey) {
    headers["PayPal-Request-Id"] = init.idempotencyKey;
  }

  let response: Response;
  try {
    response = await fetch(`${paypalApiBase()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");
    throw new Error(
      timedOut
        ? "PayPal did not respond in time. Please try again."
        : "Could not reach PayPal. Please try again."
    );
  }

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    name?: string;
    details?: Array<{ issue?: string; description?: string }>;
  };
  if (!response.ok) {
    console.error("[paypal] API error", {
      path,
      status: response.status,
      name: data.name,
      message: data.message,
      issue: data.details?.[0]?.issue,
    });
    throw new Error(paypalErrorMessage(data, response.status));
  }
  return data;
}

export async function createPayPalOrder(input: {
  amount: number;
  currency?: string;
  bookingId: string;
  reference: string;
  description: string;
  softDescriptor?: string;
}) {
  const currency = (input.currency || "USD").toUpperCase();
  const value = moneyValue(input.amount);
  const order = await paypalFetch<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    idempotencyKey: `create-${input.bookingId}-${value}`,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.reference.slice(0, 256),
          custom_id: input.bookingId.slice(0, 127),
          description: input.description
        .replace(/[^\x20-\x7E]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 127),
          soft_descriptor: (input.softDescriptor || "MARLO HOTELS").slice(0, 22),
          amount: {
            currency_code: currency,
            value,
          },
        },
      ],
      application_context: {
        brand_name: "Marlo Hotels",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${siteConfig.url}/booking/success`,
        cancel_url: `${siteConfig.url}/booking/payment`,
      },
    }),
  });
  return order;
}

export async function capturePayPalOrder(orderId: string) {
  return paypalFetch<PayPalOrder>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    idempotencyKey: `capture-${orderId}`,
    body: JSON.stringify({}),
  });
}

export async function getPayPalOrder(orderId: string) {
  return paypalFetch<PayPalOrder>(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}`
  );
}

export function extractCapture(order: PayPalOrder) {
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return {
    orderId: order.id,
    orderStatus: order.status,
    bookingId: unit?.custom_id || null,
    reference: unit?.reference_id || null,
    captureId: capture?.id || null,
    captureStatus: capture?.status || null,
    amount: Number(capture?.amount?.value || unit?.amount?.value || NaN),
    currency: (
      capture?.amount?.currency_code ||
      unit?.amount?.currency_code ||
      "USD"
    ).toUpperCase(),
    paidAt: capture?.create_time ? new Date(capture.create_time) : new Date(),
  };
}

export function amountsMatch(expected: number, actual: number) {
  return Math.abs(expected - actual) < 0.01;
}
