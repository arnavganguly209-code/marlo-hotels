export type InventoryManageDay = {
  date: string;
  weekday: string;
  day: number;
  inventory: number;
  booked: number;
  available: number;
  blocked: boolean;
  rate1Adult: number;
  rate2Adult: number;
  rate3Adult: number;
  inventoryOverridden: boolean;
  rateOverridden: boolean;
};

export type InventoryManageCategory = {
  slug: string;
  name: string;
  roomType: "Room" | "Suite";
  baseInventory: number;
  days: InventoryManageDay[];
};

export type InventoryManageGrid = {
  from: string;
  days: number;
  dates: { date: string; weekday: string; day: number }[];
  categories: InventoryManageCategory[];
};

/** UTC date-only normalization (YYYY-MM-DD in UTC). */
export function inventoryUtcDate(value: string | Date) {
  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
    );
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) {
    const parsed = new Date(value);
    return new Date(
      Date.UTC(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate()
      )
    );
  }
  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
}

export function inventoryDateKey(value: string | Date) {
  return inventoryUtcDate(value).toISOString().slice(0, 10);
}

/** Calendar length in UTC (28–31) for the month containing this date. */
export function inventoryUtcDaysInMonth(fromIso: string | Date) {
  const d = inventoryUtcDate(fromIso);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** First day of the UTC month (YYYY-MM-01). */
export function inventoryUtcMonthStart(fromIso: string | Date) {
  const d = inventoryUtcDate(fromIso);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

/**
 * Default grid: full calendar month (e.g. Nov 1–30). Optional `days` caps at 62.
 */
export function resolveInventoryViewRange(
  fromInput?: string,
  daysOverride?: number
): { from: string; days: number } {
  const anchor = fromInput?.trim()
    ? inventoryUtcDate(fromInput)
    : inventoryUtcDate(new Date());
  const y = anchor.getUTCFullYear();
  const m = anchor.getUTCMonth() + 1;
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const monthLen = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (
    typeof daysOverride === "number" &&
    Number.isFinite(daysOverride) &&
    daysOverride >= 1
  ) {
    return { from, days: Math.min(62, Math.floor(daysOverride)) };
  }
  return { from, days: monthLen };
}
