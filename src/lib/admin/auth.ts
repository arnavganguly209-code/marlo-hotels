import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";

export const ADMIN_COOKIE = "marlo_hotel_admin_session";
export const ADMIN_USER_ID = "Marlohotel";
const DEFAULT_PASSWORD = "@marlohotels01#";
const PASSWORD_SETTING_KEY = "admin.passwordHash";
const SESSION_HOURS = 12;

type SignedPayload = {
  v: 1;
  uid: string;
  exp: number;
  iat: number;
};

function sessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ORBIT_SESSION_SECRET?.trim() ||
    "marlo-hotels-admin-session-v1"
  );
}

function sign(body: string) {
  return createHmac("sha256", sessionSecret()).update(body).digest("base64url");
}

function encodeSession(payload: SignedPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): SignedPayload | null {
  try {
    const [body, signature] = token.split(".");
    if (!body || !signature) return null;
    const expected = sign(body);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SignedPayload;
    if (payload.v !== 1 || payload.uid !== ADMIN_USER_ID || !payload.exp) {
      return null;
    }
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function scryptHash(password: string, salt: Buffer) {
  return scryptSync(password, salt, 64);
}

function formatHash(salt: Buffer, hash: Buffer) {
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function verifyScrypt(candidate: string, stored: string) {
  const [, saltB64, hashB64] = stored.split("$");
  if (!saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = scryptHash(candidate, Buffer.from(saltB64, "base64"));
  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}

export async function verifyAdminCredentials(userId: string, password: string) {
  if (userId !== ADMIN_USER_ID || !password) return false;

  const db = getDb();
  if (db) {
    try {
      const setting = await db.setting.findUnique({
        where: { key: PASSWORD_SETTING_KEY },
      });
      const stored = setting?.value;
      if (typeof stored === "string" && stored.startsWith("scrypt$")) {
        return verifyScrypt(password, stored);
      }
    } catch {
      // fall through to default
    }
  }

  const candidate = createHash("sha256").update(password).digest();
  const expected = createHash("sha256").update(DEFAULT_PASSWORD).digest();
  return (
    candidate.length === expected.length &&
    timingSafeEqual(candidate, expected)
  );
}

export async function rotateAdminPassword(newPassword: string) {
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  const db = getDb();
  if (!db) throw new Error("Database is not configured.");
  const salt = randomBytes(16);
  const value = formatHash(salt, scryptHash(newPassword, salt));
  await db.setting.upsert({
    where: { key: PASSWORD_SETTING_KEY },
    create: { key: PASSWORD_SETTING_KEY, value },
    update: { value },
  });
}

export function createAdminSessionCookie() {
  const now = Math.floor(Date.now() / 1000);
  const token = encodeSession({
    v: 1,
    uid: ADMIN_USER_ID,
    iat: now,
    exp: now + SESSION_HOURS * 3600,
  });
  return {
    name: ADMIN_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_HOURS * 3600,
    },
  };
}

export function clearAdminSessionCookie() {
  return {
    name: ADMIN_COOKIE,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");
  return session;
}

export function isAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
