import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  clientIpFromRequest,
  consumeRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const limited = consumeRateLimit(
    `contact:${clientIpFromRequest(request)}`,
    8,
    15 * 60 * 1000
  );
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid submission", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = getDb();
  if (db) {
    await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        country: parsed.data.country || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
