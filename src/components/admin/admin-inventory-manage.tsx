"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import type {
  InventoryManageCategory,
  InventoryManageDay,
  InventoryManageGrid,
} from "@/lib/admin/inventory-nights-public";
import {
  INVENTORY_VIEW_MAX_DAYS,
  inventoryUtcDaysInMonth as utcDaysInMonth,
  inventoryUtcDaysThroughMonthEnd as utcDaysThroughMonthEnd,
  inventoryUtcMonthStart as utcMonthStart,
} from "@/lib/admin/inventory-nights-public";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function shiftDate(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

function statusTone(available: number, inventory: number) {
  if (available <= 0 || inventory <= 0) return "closed";
  if (available <= 2) return "limited";
  return "open";
}

/** Replace one night in the grid without a full reload (keeps typing intact). */
function patchGridDay(
  grid: InventoryManageGrid,
  slug: string,
  day: InventoryManageDay
): InventoryManageGrid {
  return {
    ...grid,
    categories: grid.categories.map((category) =>
      category.slug === slug
        ? {
            ...category,
            days: category.days.map((item) =>
              item.date === day.date ? day : item
            ),
          }
        : category
    ),
  };
}

export function AdminInventoryManage({
  initialGrid,
}: {
  initialGrid: InventoryManageGrid;
}) {
  const [grid, setGrid] = useState(initialGrid);
  const [tab, setTab] = useState("all");
  const [from, setFrom] = useState(initialGrid.from);
  const [days, setDays] = useState(initialGrid.days);
  const [loading, setLoading] = useState(false);
  const [pendingCells, setPendingCells] = useState<Record<string, true>>({});
  const [bulkBusy, setBulkBusy] = useState<"" | "apply" | "clear">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  /** Empty = nothing typed yet, so Apply never writes an accidental 0. */
  const [bulkInventory, setBulkInventory] = useState("");
  const [bulkStartDate, setBulkStartDate] = useState("");
  const [bulkEndDate, setBulkEndDate] = useState("");

  const fromRef = useRef(from);
  const daysRef = useRef(days);
  fromRef.current = from;
  daysRef.current = days;

  const visible = useMemo(
    () =>
      tab === "all"
        ? grid.categories
        : grid.categories.filter((item) => item.slug === tab),
    [grid.categories, tab]
  );

  const month = Number(from.slice(5, 7));
  const year = Number(from.slice(0, 4));
  const closedCount = visible.reduce(
    (sum, category) =>
      sum + category.days.filter((day) => day.available <= 0).length,
    0
  );

  const load = useCallback(async (nextFrom?: string, nextDays?: number) => {
    const useFrom = nextFrom ?? fromRef.current;
    const useDays = nextDays ?? daysRef.current;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/inventory-manage?from=${encodeURIComponent(useFrom)}&days=${useDays}`,
        { credentials: "same-origin", cache: "no-store" }
      );
      const result = (await response.json()) as {
        grid?: InventoryManageGrid;
        error?: string;
      };
      if (!response.ok || !result.grid) {
        throw new Error(result.error || "Could not load inventory");
      }
      setGrid(result.grid);
      setFrom(result.grid.from);
      setDays(result.grid.days);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCell = useCallback(
    async (
      slug: string,
      date: string,
      patch: Record<string, number | null | undefined>
    ) => {
      const key = `${slug}:${date}`;
      setPendingCells((current) => ({ ...current, [key]: true }));
      setError("");
      try {
        const response = await fetch("/api/admin/inventory-manage", {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ slug, date, ...patch }),
        });
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
          day?: InventoryManageDay;
        };
        if (!response.ok) throw new Error(result.error || "Save failed");
        if (result.day) {
          const saved = result.day;
          setGrid((current) => patchGridDay(current, slug, saved));
        }
      } catch (cause) {
        setError(
          `${cause instanceof Error ? cause.message : "Save failed"} — the cell was reverted.`
        );
        // Re-read the truth so a failed cell never looks saved.
        void load();
      } finally {
        setPendingCells((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
      }
    },
    [load]
  );

  function resolveBulkDateRange():
    | { ok: true; startDate: string; endDate: string }
    | { ok: false; message: string } {
    const a = bulkStartDate.trim();
    const b = bulkEndDate.trim();
    if (!a && !b) {
      return {
        ok: true,
        startDate: from,
        endDate: shiftDate(from, days - 1),
      };
    }
    if (!a || !b) {
      return {
        ok: false,
        message:
          "Set both “Apply from” and “Apply to”, or leave both blank to use the visible range (Start + Days).",
      };
    }
    if (a > b) {
      return { ok: false, message: "Apply from must be on or before Apply to." };
    }
    return { ok: true, startDate: a, endDate: b };
  }

  const resolvedRange = resolveBulkDateRange();
  const rangeLabel = resolvedRange.ok
    ? `${resolvedRange.startDate} → ${resolvedRange.endDate}`
    : "invalid range";

  async function applyRange() {
    const range = resolveBulkDateRange();
    if (!range.ok) {
      setError(range.message);
      return;
    }
    const trimmed = bulkInventory.trim();
    if (trimmed === "") {
      setError("Type how many rooms to set before applying.");
      return;
    }
    const inventory = Math.max(0, Math.floor(Number(trimmed)));
    if (!Number.isFinite(inventory)) {
      setError("Enter a whole number of rooms (0 or more).");
      return;
    }

    setBulkBusy("apply");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/inventory-manage", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: tab === "all" ? "__ALL__" : tab,
          startDate: range.startDate,
          endDate: range.endDate,
          inventory,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        updated?: number;
        categories?: number;
      };
      if (!response.ok) throw new Error(result.error || "Could not apply");
      await load(fromRef.current, daysRef.current);
      setNotice(
        `Saved ${inventory} room${inventory === 1 ? "" : "s"} for ${
          result.categories ?? visible.length
        } categor${(result.categories ?? visible.length) === 1 ? "y" : "ies"} · ${rangeLabel}.`
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not apply");
    } finally {
      setBulkBusy("");
    }
  }

  async function clearOverridesInRange() {
    const range = resolveBulkDateRange();
    if (!range.ok) {
      setError(range.message);
      return;
    }
    setBulkBusy("clear");
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/inventory-manage", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: tab === "all" ? "__ALL__" : tab,
          startDate: range.startDate,
          endDate: range.endDate,
          clearOverrides: true,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        updated?: number;
      };
      if (!response.ok) throw new Error(result.error || "Could not clear");
      await load(fromRef.current, daysRef.current);
      setNotice(
        `Cleared ${result.updated ?? 0} night override${
          (result.updated ?? 0) === 1 ? "" : "s"
        } · ${rangeLabel}. Base room inventory applies again.`
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not clear");
    } finally {
      setBulkBusy("");
    }
  }

  function goMonth(delta: number) {
    const start = new Date(Date.UTC(year, month - 1 + delta, 1))
      .toISOString()
      .slice(0, 10);
    void load(start, utcDaysInMonth(start));
  }

  return (
    <div className="-mx-1 min-w-0 rounded-3xl bg-[#F6F1E8] text-[#2C241C] shadow-[0_20px_60px_-28px_rgba(0,0,0,0.45)]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DED0] px-6 py-5">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-[#3A3128]">
            Management Console
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-[#4A4238]">
            Every cell saves on its own — type a number and it is stored for that
            category and that night. Inventory − booked = available, and this is
            exactly what the website sells. Clear an inventory cell to fall back
            to the room&apos;s default from Admin → Rooms. A saved 0 stays 0.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E6DED0] bg-white px-3 py-1.5 text-xs text-[#4A4238]">
            <Bell className="size-3.5" /> {closedCount} closed
          </span>
          <span className="rounded-full bg-[#2F6B4F] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white">
            Secure session
          </span>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-[#E6DED0] px-6 py-4">
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full border border-[#E6DED0] bg-white"
          onClick={() => goMonth(-1)}
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="min-w-40 text-center text-lg font-semibold">
          {MONTHS[month - 1]} {year}
        </p>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-full border border-[#E6DED0] bg-white"
          onClick={() => goMonth(1)}
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
        <button
          type="button"
          className="rounded-full bg-[#2F6B4F] px-4 py-2 text-xs font-semibold text-white"
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            const start = utcMonthStart(today);
            void load(start, utcDaysInMonth(start));
          }}
        >
          Today
        </button>
        <label className="text-xs text-[#4A4238]">
          Month
          <select
            className="ml-2 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={month}
            onChange={(event) => {
              const start = `${year}-${String(event.target.value).padStart(2, "0")}-01`;
              void load(start, utcDaysInMonth(start));
            }}
          >
            {MONTHS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#4A4238]">
          Year
          <select
            className="ml-2 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={year}
            onChange={(event) => {
              const start = `${event.target.value}-${String(month).padStart(2, "0")}-01`;
              void load(start, utcDaysInMonth(start));
            }}
          >
            {Array.from({ length: 8 }, (_, i) => year - 2 + i).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#4A4238]">
          Start
          <input
            type="date"
            className="ml-2 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={from}
            onChange={(event) => {
              const picked = event.target.value;
              void load(picked, utcDaysThroughMonthEnd(picked));
            }}
          />
        </label>
        <label className="text-xs text-[#4A4238]">
          Days (scroll →)
          <input
            type="number"
            min={1}
            max={INVENTORY_VIEW_MAX_DAYS}
            title="First column date through that many nights. Bulk Apply uses this exact visible range."
            className="ml-2 w-20 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={days}
            onChange={(event) =>
              setDays(
                Math.min(
                  INVENTORY_VIEW_MAX_DAYS,
                  Math.max(1, Number(event.target.value) || 30)
                )
              )
            }
            onBlur={() => void load(fromRef.current, daysRef.current)}
          />
        </label>
        <span className="rounded-full border border-[#E6DED0] bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#4A4238] uppercase">
          Range view
        </span>
        {loading ? <Loader2 className="size-4 animate-spin text-[#2F6B4F]" /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <Tab
            active={tab === "all"}
            onClick={() => setTab("all")}
            label={`All rooms (${grid.categories.length})`}
          />
          {grid.categories.map((category) => (
            <Tab
              key={category.slug}
              active={tab === category.slug}
              onClick={() => setTab(category.slug)}
              label={category.name}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <Legend color="bg-emerald-500" label="Available" />
          <Legend color="bg-amber-400" label="Limited" />
          <Legend color="bg-red-500" label="Closed / 0" />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 px-6 pb-4">
        <label className="grid gap-1 text-[11px] font-medium text-[#4A4238]">
          {tab === "all"
            ? "Set inventory (all categories)"
            : "Set inventory (this category only)"}
          <input
            type="number"
            min={0}
            placeholder="e.g. 3"
            className="h-10 w-28 rounded-xl border border-[#E6DED0] bg-white px-3"
            value={bulkInventory}
            onChange={(event) => setBulkInventory(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2 rounded-xl border border-[#E6DED0] bg-white/80 px-3 py-2">
          <label className="grid gap-1 text-[10px] font-medium text-[#4A4238]">
            Apply from
            <input
              type="date"
              className="h-9 rounded-lg border border-[#E6DED0] bg-white px-2 text-xs"
              value={bulkStartDate}
              onChange={(e) => setBulkStartDate(e.target.value)}
              title="Optional: bulk apply/clear between these dates"
            />
          </label>
          <label className="grid gap-1 text-[10px] font-medium text-[#4A4238]">
            Apply to
            <input
              type="date"
              className="h-9 rounded-lg border border-[#E6DED0] bg-white px-2 text-xs"
              value={bulkEndDate}
              onChange={(e) => setBulkEndDate(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setBulkStartDate("");
              setBulkEndDate("");
            }}
            className="self-end rounded-lg border border-[#E6DED0] bg-[#FBF7F1] px-2 py-1.5 text-[10px] font-semibold text-[#4A4238]"
          >
            Use visible range
          </button>
        </div>
        <button
          type="button"
          disabled={bulkBusy !== ""}
          onClick={() => void applyRange()}
          className="h-10 rounded-xl bg-[#C4A36A] px-4 text-xs font-semibold text-[#2C241C] disabled:opacity-50"
        >
          {bulkBusy === "apply"
            ? "Saving…"
            : tab === "all"
              ? "Apply to all rooms"
              : "Apply to this category"}
        </button>
        <button
          type="button"
          disabled={bulkBusy !== ""}
          onClick={() => void clearOverridesInRange()}
          className="h-10 rounded-xl border border-[#D4C4B0] bg-white px-4 text-xs font-semibold text-[#4A4238] disabled:opacity-50"
        >
          {bulkBusy === "clear"
            ? "Clearing…"
            : tab === "all"
              ? "Clear overrides (all rooms)"
              : "Clear overrides (this category)"}
        </button>
        <p className="max-w-xl text-xs text-[#5C5248]">
          Bulk target: <strong>{rangeLabel}</strong>. Pick one category tab to
          change only that room type. Single cells still auto-save when you type.
          A value of 0 closes those nights on the website.
        </p>
      </div>

      {error ? (
        <p className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mx-6 mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </p>
      ) : null}

      <div className="overflow-x-auto overscroll-x-contain px-4 pb-8 [-webkit-overflow-scrolling:touch]">
        {visible.map((category) => (
          <CategoryTable
            key={category.slug}
            category={category}
            dates={grid.dates}
            pendingCells={pendingCells}
            onSave={saveCell}
          />
        ))}
        {!visible.length ? (
          <p className="px-4 py-16 text-center text-sm text-[#5C5248]">
            Publish rooms in Admin → Rooms first.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function Tab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm",
        active
          ? "bg-[#3A3128] text-white"
          : "border border-[#E6DED0] bg-white text-[#4A4238]"
      )}
    >
      {label}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#4A4238]">
      <span className={cn("size-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}

type FieldKey = "inventory" | "rate1Adult" | "rate2Adult" | "rate3Adult";

function CategoryTable({
  category,
  dates,
  pendingCells,
  onSave,
}: {
  category: InventoryManageCategory;
  dates: InventoryManageGrid["dates"];
  pendingCells: Record<string, true>;
  onSave: (
    slug: string,
    date: string,
    patch: Record<string, number | null | undefined>
  ) => void;
}) {
  const rows: {
    key: string;
    label: string;
    kind: "flag" | "inventory" | "booked" | "available" | "rate1" | "rate2" | "rate3";
  }[] = [
    { key: "flag", label: "Availability", kind: "flag" },
    { key: "inventory", label: "Inventory", kind: "inventory" },
    { key: "booked", label: "Booked", kind: "booked" },
    { key: "available", label: "Available", kind: "available" },
    { key: "rate1", label: "Rate (USD) 1 adult", kind: "rate1" },
    { key: "rate2", label: "Rate (USD) 2 adults", kind: "rate2" },
    { key: "rate3", label: "Rate (USD) 3 adults", kind: "rate3" },
  ];

  return (
    <section className="mb-8 rounded-2xl border border-[#E6DED0] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E6DED0] px-4 py-3">
        <span className="text-[#C4A36A]">▾</span>
        <h2 className="font-semibold">{category.name}</h2>
        <span className="text-sm text-[#5C5248]">base {category.baseInventory}</span>
      </div>
      <table className="min-w-max border-collapse text-center text-sm">
        <thead>
          <tr className="bg-[#FBF7F1] text-[11px] text-[#5C5248]">
            <th className="sticky left-0 z-20 min-w-44 bg-[#FBF7F1] px-4 py-3 text-left font-semibold tracking-wide uppercase shadow-[4px_0_8px_-2px_rgba(0,0,0,0.08)]">
              Room / Metric
            </th>
            {dates.map((item) => (
              <th key={item.date} className="min-w-[72px] px-2 py-2 font-medium">
                <div>
                  {item.date.slice(5, 7) === "01" || item.day === 1
                    ? MONTHS[Number(item.date.slice(5, 7)) - 1].slice(0, 3)
                    : ""}{" "}
                  {item.day}
                </div>
                <div className="text-[10px]">{item.weekday}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-t border-[#F0E8DC]">
              <th className="sticky left-0 z-20 bg-white px-4 py-2 text-left text-xs font-medium text-[#4A4238] shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]">
                {row.label}
              </th>
              {category.days.map((day) => {
                const tone = statusTone(day.available, day.inventory);
                if (row.kind === "flag") {
                  return (
                    <td
                      key={day.date}
                      className={cn(
                        "px-2 py-2",
                        tone === "closed"
                          ? "bg-red-50"
                          : tone === "limited"
                            ? "bg-amber-50"
                            : "bg-emerald-50"
                      )}
                    >
                      {tone === "closed" ? (
                        <X className="mx-auto size-4 text-red-500" />
                      ) : (
                        <Check className="mx-auto size-4 text-emerald-600" />
                      )}
                    </td>
                  );
                }
                if (row.kind === "booked") {
                  return (
                    <td key={day.date} className="px-2 py-2 text-[#4A4238]">
                      {day.booked}
                    </td>
                  );
                }
                if (row.kind === "available") {
                  return (
                    <td
                      key={day.date}
                      className={cn(
                        "px-2 py-2 font-semibold",
                        day.available <= 0 ? "bg-red-50 text-red-600" : "text-emerald-700"
                      )}
                    >
                      {day.available}
                    </td>
                  );
                }
                const field: FieldKey =
                  row.kind === "inventory"
                    ? "inventory"
                    : row.kind === "rate1"
                      ? "rate1Adult"
                      : row.kind === "rate2"
                        ? "rate2Adult"
                        : "rate3Adult";
                const value =
                  row.kind === "inventory"
                    ? day.inventory
                    : row.kind === "rate1"
                      ? day.rate1Adult
                      : row.kind === "rate2"
                        ? day.rate2Adult
                        : day.rate3Adult;
                const busy = Boolean(pendingCells[`${category.slug}:${day.date}`]);
                return (
                  <td
                    key={day.date}
                    className={cn(
                      "px-1 py-1",
                      row.kind === "inventory" && day.inventory <= 0
                        ? "bg-red-50"
                        : undefined
                    )}
                  >
                    <DebouncedNumberInput
                      slug={category.slug}
                      date={day.date}
                      field={field}
                      committed={value}
                      isInventory={row.kind === "inventory"}
                      busy={busy}
                      disabled={row.kind === "inventory" && day.blocked}
                      onCommit={onSave}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

const COMMIT_DELAY_MS = 500;

/**
 * Cell editor that keeps the user's text while a save is in flight.
 * - Stays editable during save (never swallows keystrokes).
 * - Commits after a short pause and on blur/Enter.
 * - Only adopts server values it did not just send.
 */
function DebouncedNumberInput({
  slug,
  date,
  field,
  committed,
  isInventory,
  busy,
  disabled,
  onCommit,
}: {
  slug: string;
  date: string;
  field: FieldKey;
  committed: number;
  isInventory: boolean;
  busy: boolean;
  disabled: boolean;
  onCommit: (
    slug: string,
    date: string,
    patch: Record<string, number | null | undefined>
  ) => void;
}) {
  const [text, setText] = useState(() => String(committed));
  /** Last value confirmed by (or sent to) the server. */
  const sentRef = useRef<number | "clear">(committed);
  const serverRef = useRef(committed);
  const timerRef = useRef<number | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  // Adopt external changes (bulk apply, reload, another tab).
  useEffect(() => {
    if (committed === serverRef.current) return;
    serverRef.current = committed;
    if (committed !== sentRef.current) {
      sentRef.current = committed;
      setText(String(committed));
    }
  }, [committed, slug, date, field]);

  useEffect(() => {
    setText(String(committed));
    sentRef.current = committed;
    serverRef.current = committed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, date, field]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!savedFlash) return;
    const timer = window.setTimeout(() => setSavedFlash(false), 900);
    return () => window.clearTimeout(timer);
  }, [savedFlash]);

  const commit = useCallback(
    (raw: string) => {
      if (disabled) return;
      if (isInventory && raw.trim() === "") {
        if (sentRef.current === "clear") return;
        sentRef.current = "clear";
        onCommit(slug, date, { inventory: null });
        setSavedFlash(true);
        return;
      }
      const parsed = Number(raw);
      if (raw.trim() === "" || !Number.isFinite(parsed)) return;
      const next = isInventory
        ? Math.max(0, Math.floor(parsed))
        : Number(parsed.toFixed(2));
      if (typeof sentRef.current === "number" && next === sentRef.current) return;
      sentRef.current = next;
      onCommit(slug, date, { [field]: next });
      setSavedFlash(true);
    },
    [disabled, field, isInventory, onCommit, slug, date]
  );

  const schedule = useCallback(
    (raw: string) => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        commit(raw);
      }, COMMIT_DELAY_MS);
    },
    [commit]
  );

  return (
    <span className="relative inline-flex items-center">
      <input
        type="number"
        min={0}
        step={isInventory ? 1 : 0.01}
        value={text}
        disabled={disabled}
        inputMode="numeric"
        onChange={(event) => {
          setText(event.target.value);
          schedule(event.target.value);
        }}
        onBlur={(event) => {
          if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          commit(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className={cn(
          "h-8 w-16 rounded-md border bg-transparent text-center tabular-nums outline-none hover:border-[#E6DED0] focus:border-[#C4A36A] focus:bg-white disabled:opacity-60",
          busy
            ? "border-[#C4A36A]"
            : savedFlash
              ? "border-emerald-400"
              : "border-transparent",
          isInventory && Number(text) === 0 ? "text-red-600" : undefined
        )}
      />
      {busy ? (
        <Loader2 className="pointer-events-none absolute -right-1 size-3 animate-spin text-[#C4A36A]" />
      ) : null}
    </span>
  );
}
