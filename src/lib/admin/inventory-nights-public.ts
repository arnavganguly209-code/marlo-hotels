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

/** Inclusive day count from this UTC calendar date through the end of its month. */
export function inventoryUtcDaysThroughMonthEnd(fromIso: string | Date) {
  const d = inventoryUtcDate(fromIso);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const monthLen = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return monthLen - day + 1;
}

/** Max days in one grid load (≈2 years); scroll right to see all columns. */
export const INVENTORY_VIEW_MAX_DAYS = 730;

/**
 * Resolves `from` + `days` for the grid and bulk apply.
 *
 * - No `fromInput`: current UTC month from the 1st through month end (unchanged default).
 * - With `fromInput`: that exact UTC calendar day as the first column (not snapped to the 1st),
 *   so Apply only touches the visible nights. Default `days` without override = through month end.
 */
export function resolveInventoryViewRange(
  fromInput?: string,
  daysOverride?: number
): { from: string; days: number } {
  const trimmed = fromInput?.trim();

  let fromDate: Date;
  let defaultDays: number;

  if (trimmed) {
    fromDate = inventoryUtcDate(trimmed);
    defaultDays = inventoryUtcDaysThroughMonthEnd(fromDate);
  } else {
    const today = inventoryUtcDate(new Date());
    const y = today.getUTCFullYear();
    const m = today.getUTCMonth();
    fromDate = new Date(Date.UTC(y, m, 1));
    defaultDays = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  }

  const y = fromDate.getUTCFullYear();
  const mo = fromDate.getUTCMonth();
  const day = fromDate.getUTCDate();
  const from = `${y}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  if (
    typeof daysOverride === "number" &&
    Number.isFinite(daysOverride) &&
    daysOverride >= 1
  ) {
    return {
      from,
      days: Math.min(INVENTORY_VIEW_MAX_DAYS, Math.floor(daysOverride)),
    };
  }
  return {
    from,
    days: Math.min(INVENTORY_VIEW_MAX_DAYS, defaultDays),
  };
}
