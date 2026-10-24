import "server-only";

import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";

/**
 * Booking ID format: MARLO-YYMMDD-XXXXXXXX
 * Random suffix avoids sequential guessing. Email/PDF only print the string.
 */
export async function generateMarloBookingId(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const prefix = `MARLO-${yy}${mm}${dd}-`;

  const db = getDb();
  for (let i = 0; i < 12; i += 1) {
    const reference = `${prefix}${randomBytes(4).toString("hex").toUpperCase()}`;
    if (!db) return reference;
    const clash = await db.booking.findUnique({
      where: { reference },
      select: { id: true },
    });
    if (!clash) return reference;
  }
  return `${prefix}${randomBytes(6).toString("hex").toUpperCase()}`;
}
