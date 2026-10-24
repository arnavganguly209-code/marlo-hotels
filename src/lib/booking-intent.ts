import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const INTENT_TTL_MS = 30 * 60 * 1000;

type IntentPayload = {
  v: 1;
  exp: number;
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  n: string;
};

function intentSecret() {
  return (
    process.env.BOOKING_INTENT_SECRET?.trim() ||
    process.env.ORBIT_SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV === "production" ? "" : "marlo-booking-intent-dev")
  );
}

function sign(body: string) {
  const secret = intentSecret();
  if (!secret) {
    throw new Error("BOOKING_INTENT_SECRET is not configured");
  }
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createBookingIntent(input: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
}) {
  const payload: IntentPayload = {
    v: 1,
    exp: Date.now() + INTENT_TTL_MS,
    roomSlug: input.roomSlug,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    n: randomBytes(12).toString("hex"),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return { token: `${body}.${sign(body)}`, expiresAt: payload.exp };
}

export function verifyBookingIntent(
  token: string,
  input: { roomSlug: string; checkIn: string; checkOut: string }
): { ok: true; hash: string } | { ok: false; error: string } {
  const [body, signature] = token.split(".");
  if (!body || !signature) return { ok: false, error: "Invalid booking intent" };
  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return { ok: false, error: "Booking intent is not configured" };
  }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, error: "Invalid booking intent" };
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as IntentPayload;
    if (payload.v !== 1 || payload.exp < Date.now()) {
      return { ok: false, error: "Booking intent expired. Refresh and try again." };
    }
    if (
      payload.roomSlug !== input.roomSlug ||
      payload.checkIn !== input.checkIn ||
      payload.checkOut !== input.checkOut
    ) {
      return { ok: false, error: "Booking intent does not match this stay" };
    }
    return {
      ok: true,
      hash: createHash("sha256").update(token).digest("hex").slice(0, 32),
    };
  } catch {
    return { ok: false, error: "Invalid booking intent" };
  }
}
