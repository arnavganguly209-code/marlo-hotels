import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin/auth";
import {
  clientIpFromRequest,
  consumeRateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";

const schema = z.object({
  userId: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

export async function POST(request: Request) {
  const limited = consumeRateLimit(
    `admin-login:${clientIpFromRequest(request)}`,
    8,
    15 * 60 * 1000
  );
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter your User ID and password." },
      { status: 400 }
    );
  }

  const valid = await verifyAdminCredentials(
    parsed.data.userId.trim(),
    parsed.data.password
  );

  if (!valid) {
    return NextResponse.json(
      { error: "Invalid User ID or password. Please try again." },
      { status: 401 }
    );
  }

  const session = createAdminSessionCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(session.name, session.value, session.options);
  return response;
}
