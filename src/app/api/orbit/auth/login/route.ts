import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertSameOrigin,
  createOrbitSession,
  getRateLimitState,
  getRequestFingerprint,
  isOrbitAuthConfigured,
  recordLoginAttempt,
  verifyPasskey,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { orbitLog } from "@/lib/orbit/logger";

const loginSchema = z.object({
  passkey: z.string().min(1).max(512),
});

export async function POST(request: Request) {
  try {
    if (!(await assertSameOrigin(request))) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter your Orbit passkey." }, { status: 400 });
    }

    if (!isOrbitAuthConfigured()) {
      orbitLog(
        "error",
        "Orbit login rejected — ORBIT_ADMIN_PASSKEY or ORBIT_SESSION_SECRET missing in runtime env"
      );
      return NextResponse.json(
        { error: "Orbit is not configured. Check the server environment." },
        { status: 503 }
      );
    }

    const { ipHash, userAgent } = await getRequestFingerprint();
    const rateLimit = await getRateLimitState(ipHash);
    if (rateLimit.blocked) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const valid = await verifyPasskey(parsed.data.passkey);
    await recordLoginAttempt(ipHash, valid);
    if (!valid) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        module: "security",
        summary: "Rejected Orbit login attempt",
      });
      return NextResponse.json(
        {
          error: "The passkey is not valid.",
          remainingAttempts: Math.max(0, rateLimit.remaining - 1),
        },
        { status: 401 }
      );
    }

    await createOrbitSession(ipHash, userAgent);
    await writeAuditLog({
      action: "LOGIN_SUCCEEDED",
      module: "security",
      summary: "Orbit administrator signed in",
    });
    orbitLog("info", "Orbit administrator signed in");
    return NextResponse.json({ ok: true });
  } catch (error) {
    orbitLog("error", "Orbit login route failed", error);
    return NextResponse.json(
      { error: "Unable to complete Orbit sign-in. Check server logs." },
      { status: 500 }
    );
  }
}
