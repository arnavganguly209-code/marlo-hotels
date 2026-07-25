import "server-only";

import { getDb } from "@/lib/db";

/**
 * Booking ID format: MARLO-YYMMDD-XXXX
 * Example: MARLO-250725-0001
 */
export async function generateMarloBookingId(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dayKey = `${yy}${mm}${dd}`;
  const prefix = `MARLO-${dayKey}-`;

  const db = getDb();
  if (!db) {
    const random = String(Math.floor(Math.random() * 9000) + 1000);
    return `${prefix}${random}`;
  }

  const existing = await db.booking.count({
    where: { reference: { startsWith: prefix } },
  });
  let attempt = existing + 1;
  for (let i = 0; i < 100; i += 1) {
    const reference = `${prefix}${String(attempt).padStart(4, "0")}`;
    const clash = await db.booking.findUnique({
      where: { reference },
      select: { id: true },
    });
    if (!clash) return reference;
    attempt += 1;
  }
  return `${prefix}${String(Date.now()).slice(-4)}`;
}
