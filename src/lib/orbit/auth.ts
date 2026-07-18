import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";

export const ORBIT_COOKIE = "marlo_orbit_session";
export const ORBIT_SESSION_HOURS = 8;
export const ORBIT_IDLE_MINUTES = 30;
export const ORBIT_MAX_ATTEMPTS = 5;
export const ORBIT_ATTEMPT_WINDOW_MINUTES = 15;

export type OrbitSessionView = {
  id: string;
  expiresAt: Date;
  lastSeenAt: Date;
  revokedAt: Date | null;
  ipHash: string | null;
  userAgent: string | null;
};

type SignedPayload = {
  v: 1;
  id: string;
  exp: number;
  iat: number;
  seen: number;
  ip: string | null;
  ua: string | null;
};

type MemoryAttempt = { at: number; succeeded: boolean };

const memoryAttempts = new Map<string, MemoryAttempt[]>();

function sessionSecret() {
  const secret = process.env.ORBIT_SESSION_SECRET;
  if (!secret) {
    throw new Error("ORBIT_SESSION_SECRET is not configured");
  }
  return secret;
}

function hash(value: string) {
  return createHash("sha256")
    .update(`${sessionSecret()}:${value}`)
    .digest("hex");
}

function sign(body: string) {
  return createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

function encodeSession(payload: SignedPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SignedPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const actualBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (
    actualBuf.length !== expectedBuf.length ||
    !timingSafeEqual(actualBuf, expectedBuf)
  ) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SignedPayload;
    if (payload.v !== 1 || !payload.id || !payload.exp || !payload.seen) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function cookieSecure() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (siteUrl.startsWith("https://")) return true;
  if (siteUrl.startsWith("http://")) return false;
  return process.env.NODE_ENV === "production";
}

function setSessionCookie(token: string, maxAgeSeconds: number) {
  return cookies().then((cookieStore) => {
    cookieStore.set(ORBIT_COOKIE, token, {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: "strict",
      path: "/",
      maxAge: maxAgeSeconds,
    });
  });
}

export function isOrbitAuthConfigured() {
  return Boolean(
    process.env.ORBIT_ADMIN_PASSKEY?.trim() &&
      process.env.ORBIT_SESSION_SECRET?.trim()
  );
}

export function safePasskeyMatch(candidate: string) {
  const expected = process.env.ORBIT_ADMIN_PASSKEY;
  if (!expected || !candidate) return false;
  const candidateHash = createHash("sha256").update(candidate).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  if (candidateHash.length !== expectedHash.length) return false;
  return timingSafeEqual(candidateHash, expectedHash);
}

const PASSKEY_SETTING_KEY = "orbit.passkeyHash";

function scryptHash(passkey: string, salt: Buffer) {
  return scryptSync(passkey, salt, 64);
}

/**
 * Verifies the administrator passkey. A passkey rotated from the Orbit
 * Security module (stored as a scrypt hash in the Setting table) takes
 * precedence; the ORBIT_ADMIN_PASSKEY environment value is the initial
 * credential until the first rotation.
 */
export async function verifyPasskey(candidate: string) {
  if (!candidate) return false;
  const db = getDb();
  if (db) {
    try {
      const setting = await db.setting.findUnique({
        where: { key: PASSKEY_SETTING_KEY },
      });
      const stored = setting?.value;
      if (typeof stored === "string" && stored.startsWith("scrypt$")) {
        const [, saltB64, hashB64] = stored.split("$");
        const expected = Buffer.from(hashB64, "base64");
        const actual = scryptHash(candidate, Buffer.from(saltB64, "base64"));
        return (
          expected.length === actual.length && timingSafeEqual(expected, actual)
        );
      }
    } catch {
      // fall through to the environment passkey
    }
  }
  return safePasskeyMatch(candidate);
}

export async function rotatePasskey(newPasskey: string) {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not configured");
  const salt = randomBytes(16);
  const value = `scrypt$${salt.toString("base64")}$${scryptHash(
    newPasskey,
    salt
  ).toString("base64")}`;
  await db.setting.upsert({
    where: { key: PASSKEY_SETTING_KEY },
    create: { key: PASSKEY_SETTING_KEY, value },
    update: { value },
  });
}

export async function getRequestFingerprint() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  return {
    ipHash: hash(ip),
    userAgent: requestHeaders.get("user-agent")?.slice(0, 500) ?? null,
  };
}

export async function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function pruneMemoryAttempts(ipHash: string, windowStart: number) {
  const current = (memoryAttempts.get(ipHash) ?? []).filter(
    (attempt) => attempt.at >= windowStart
  );
  memoryAttempts.set(ipHash, current);
  return current;
}

export async function getRateLimitState(ipHash: string) {
  const windowStart = Date.now() - ORBIT_ATTEMPT_WINDOW_MINUTES * 60_000;
  const db = getDb();

  if (!db) {
    const attempts = pruneMemoryAttempts(ipHash, windowStart);
    const failedAttempts = attempts.filter((attempt) => !attempt.succeeded)
      .length;
    const blocked = failedAttempts >= ORBIT_MAX_ATTEMPTS;
    return {
      blocked,
      remaining: Math.max(0, ORBIT_MAX_ATTEMPTS - failedAttempts),
      retryAfterSeconds: blocked ? ORBIT_ATTEMPT_WINDOW_MINUTES * 60 : 0,
    };
  }

  const failedAttempts = await db.orbitLoginAttempt.count({
    where: {
      ipHash,
      succeeded: false,
      createdAt: { gte: new Date(windowStart) },
    },
  });

  const blocked = failedAttempts >= ORBIT_MAX_ATTEMPTS;
  return {
    blocked,
    remaining: Math.max(0, ORBIT_MAX_ATTEMPTS - failedAttempts),
    retryAfterSeconds: blocked ? ORBIT_ATTEMPT_WINDOW_MINUTES * 60 : 0,
  };
}

export async function recordLoginAttempt(
  ipHash: string,
  succeeded: boolean
) {
  const db = getDb();
  if (!db) {
    const windowStart = Date.now() - ORBIT_ATTEMPT_WINDOW_MINUTES * 60_000;
    const attempts = pruneMemoryAttempts(ipHash, windowStart);
    attempts.push({ at: Date.now(), succeeded });
    memoryAttempts.set(ipHash, attempts);
    return;
  }
  await db.orbitLoginAttempt.create({ data: { ipHash, succeeded } });
}

export async function createOrbitSession(
  ipHash: string,
  userAgent: string | null
) {
  if (!isOrbitAuthConfigured()) {
    throw new Error("Orbit authentication is not configured");
  }

  const now = Date.now();
  const id = randomBytes(16).toString("hex");
  const payload: SignedPayload = {
    v: 1,
    id,
    exp: now + ORBIT_SESSION_HOURS * 60 * 60_000,
    iat: now,
    seen: now,
    ip: ipHash,
    ua: userAgent,
  };
  const token = encodeSession(payload);

  const db = getDb();
  if (db) {
    await db.orbitSession.create({
      data: {
        id,
        tokenHash: hash(token),
        ipHash,
        userAgent,
        expiresAt: new Date(payload.exp),
        lastSeenAt: new Date(payload.seen),
      },
    });
  }

  await setSessionCookie(token, ORBIT_SESSION_HOURS * 60 * 60);
}

export async function getOrbitSession(): Promise<OrbitSessionView | null> {
  if (!process.env.ORBIT_SESSION_SECRET?.trim()) return null;

  const token = (await cookies()).get(ORBIT_COOKIE)?.value;
  if (!token) return null;

  const payload = decodeSession(token);
  if (!payload) return null;

  const now = Date.now();
  const idleCutoff = now - ORBIT_IDLE_MINUTES * 60_000;

  if (payload.exp <= now || payload.seen < idleCutoff) {
    await revokeOrbitSession();
    return null;
  }

  const db = getDb();
  if (db) {
    try {
      const stored = await db.orbitSession.findUnique({ where: { id: payload.id } });
      if (stored?.revokedAt) {
        await setSessionCookie("", 0);
        return null;
      }
      if (stored && now - stored.lastSeenAt.getTime() > 60_000) {
        await db.orbitSession.update({
          where: { id: stored.id },
          data: { lastSeenAt: new Date(now) },
        });
      }
    } catch {
      // Signed cookie remains authoritative when the database is offline.
    }
  }

  if (now - payload.seen > 60_000) {
    const refreshed: SignedPayload = { ...payload, seen: now };
    await setSessionCookie(
      encodeSession(refreshed),
      Math.max(1, Math.floor((payload.exp - now) / 1000))
    );
  }

  return {
    id: payload.id,
    expiresAt: new Date(payload.exp),
    lastSeenAt: new Date(payload.seen),
    revokedAt: null,
    ipHash: payload.ip,
    userAgent: payload.ua,
  };
}

export async function requireOrbitSession() {
  const session = await getOrbitSession();
  if (!session) redirect("/orbit?reason=session-expired");
  return session;
}

export async function revokeOrbitSession() {
  const db = getDb();
  const cookieStore = await cookies();
  const token = cookieStore.get(ORBIT_COOKIE)?.value;
  if (db && token) {
    const payload = decodeSession(token);
    if (payload) {
      await db.orbitSession.updateMany({
        where: { id: payload.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await db.orbitSession.updateMany({
        where: { tokenHash: hash(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  }
  cookieStore.set(ORBIT_COOKIE, "", {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function writeAuditLog(input: {
  action: string;
  module: string;
  entityId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const db = getDb();
  if (!db) return;
  const { ipHash } = await getRequestFingerprint();
  await db.orbitAuditLog.create({
    data: {
      action: input.action,
      module: input.module,
      entityId: input.entityId,
      summary: input.summary,
      metadata: input.metadata
        ? (input.metadata as Prisma.InputJsonValue)
        : undefined,
      ipHash,
    },
  });
}
