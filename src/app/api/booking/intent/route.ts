import { NextResponse } from "next/server";
import { createBookingIntent } from "@/lib/booking-intent";
import {
  clientIpFromRequest,
  consumeRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";

export async function GET(request: Request) {
  const limited = consumeRateLimit(
    `booking-intent:${clientIpFromRequest(request)}`,
    30,
    15 * 60 * 1000
  );
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSeconds);

  const { searchParams } = new URL(request.url);
  const roomSlug = searchParams.get("roomSlug")?.trim() || "";
  const checkIn = searchParams.get("checkIn")?.trim() || "";
  const checkOut = searchParams.get("checkOut")?.trim() || "";
  if (!roomSlug || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Stay details required" }, { status: 400 });
  }

  try {
    const intent = createBookingIntent({ roomSlug, checkIn, checkOut });
    return NextResponse.json(intent);
  } catch {
    return NextResponse.json(
      { error: "Could not start reservation" },
      { status: 503 }
    );
  }
}
