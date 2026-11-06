"use client";

import { useMemo, useState } from "react";
import { Bell, Check, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import type {
  InventoryManageCategory,
  InventoryManageGrid,
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
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [bulkInventory, setBulkInventory] = useState(0);

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

  async function load(nextFrom = from, nextDays = days) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/inventory-manage?from=${nextFrom}&days=${nextDays}`,
        { credentials: "same-origin" }
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
  }

  async function saveCell(
    slug: string,
    date: string,
    patch: Record<string, number>
  ) {
    const key = `${slug}:${date}:${Object.keys(patch).join(",")}`;
    setSaving(key);
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
      };
      if (!response.ok) throw new Error(result.error || "Save failed");
      await load(from, days);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Save failed");
    } finally {
      setSaving("");
    }
  }

  async function applyRange() {
    const endDate = shiftDate(from, days - 1);
    setSaving("bulk");
    setError("");
    try {
      const response = await fetch("/api/admin/inventory-manage", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: tab === "all" ? "__ALL__" : tab,
          startDate: from,
          endDate,
          inventory: bulkInventory,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "Could not apply");
      await load(from, days);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not apply");
    } finally {
      setSaving("");
    }
  }

  function goMonth(delta: number) {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1))
      .toISOString()
      .slice(0, 10);
    void load(next, days);
  }

  return (
    <div className="-mx-1 overflow-hidden rounded-3xl bg-[#F6F1E8] text-[#2C241C] shadow-[0_20px_60px_-28px_rgba(0,0,0,0.45)]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6DED0] px-6 py-5">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-[#3A3128]">
            Management Console
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-[#6F6458]">
            Date-wise allotment and occupancy rates. Inventory − booked =
            available. Website checkout charges the 1 / 2 / 3 adult rate for
            that night, plus extra-child charges after included children.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E6DED0] bg-white px-3 py-1.5 text-xs text-[#6F6458]">
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
          onClick={() => void load(new Date().toISOString().slice(0, 10), days)}
        >
          Today
        </button>
        <label className="text-xs text-[#6F6458]">
          Month
          <select
            className="ml-2 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={month}
            onChange={(event) =>
              void load(`${year}-${String(event.target.value).padStart(2, "0")}-01`, days)
            }
          >
            {MONTHS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#6F6458]">
          Year
          <select
            className="ml-2 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={year}
            onChange={(event) =>
              void load(`${event.target.value}-${String(month).padStart(2, "0")}-01`, days)
            }
          >
            {[year - 1, year, year + 1, year + 2].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-[#6F6458]">
          Start
          <input
            type="date"
            className="ml-2 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={from}
            onChange={(event) => void load(event.target.value, days)}
          />
        </label>
        <label className="text-xs text-[#6F6458]">
          Days
          <input
            type="number"
            min={7}
            max={62}
            className="ml-2 w-16 rounded-full border border-[#E6DED0] bg-white px-3 py-2"
            value={days}
            onChange={(event) => setDays(Math.max(7, Number(event.target.value) || 30))}
            onBlur={() => void load(from, days)}
          />
        </label>
        <span className="rounded-full border border-[#E6DED0] bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#6F6458] uppercase">
          Month view
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
        <label className="grid gap-1 text-[11px] font-medium text-[#6F6458]">
          Set inventory for visible dates
          <input
            type="number"
            min={0}
            className="h-10 w-28 rounded-xl border border-[#E6DED0] bg-white px-3"
            value={bulkInventory}
            onChange={(event) =>
              setBulkInventory(Math.max(0, Math.floor(Number(event.target.value) || 0)))
            }
          />
        </label>
        <button
          type="button"
          disabled={saving === "bulk"}
          onClick={() => void applyRange()}
          className="h-10 rounded-xl bg-[#C4A36A] px-4 text-xs font-semibold text-[#2C241C] disabled:opacity-50"
        >
          {saving === "bulk" ? "Saving…" : tab === "all" ? "Apply to all rooms" : "Apply to this room"}
        </button>
        <p className="text-xs text-[#8A7C6E]">
          Set 0 to hide these dates on the website. The number you keep is how
          many rooms can be booked.
        </p>
      </div>

      {error ? (
        <p className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto px-4 pb-8">
        {visible.map((category) => (
          <CategoryTable
            key={category.slug}
            category={category}
            dates={grid.dates}
            saving={saving}
            onSave={saveCell}
          />
        ))}
        {!visible.length ? (
          <p className="px-4 py-16 text-center text-sm text-[#8A7C6E]">
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
          : "border border-[#E6DED0] bg-white text-[#6F6458]"
      )}
    >
      {label}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[#6F6458]">
      <span className={cn("size-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}

function CategoryTable({
  category,
  dates,
  saving,
  onSave,
}: {
  category: InventoryManageCategory;
  dates: InventoryManageGrid["dates"];
  saving: string;
  onSave: (slug: string, date: string, patch: Record<string, number>) => void;
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
    <section className="mb-8 overflow-hidden rounded-2xl border border-[#E6DED0] bg-white">
      <div className="flex items-center gap-2 border-b border-[#E6DED0] px-4 py-3">
        <span className="text-[#C4A36A]">▾</span>
        <h2 className="font-semibold">{category.name}</h2>
        <span className="text-sm text-[#8A7C6E]">base {category.baseInventory}</span>
      </div>
      <table className="min-w-max border-collapse text-center text-sm">
        <thead>
          <tr className="bg-[#FBF7F1] text-[11px] text-[#8A7C6E]">
            <th className="sticky left-0 z-10 min-w-44 bg-[#FBF7F1] px-4 py-3 text-left font-semibold tracking-wide uppercase">
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
              <th className="sticky left-0 z-10 bg-white px-4 py-2 text-left text-xs font-medium text-[#6F6458]">
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
                    <td key={day.date} className="px-2 py-2 text-[#6F6458]">
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
                const field =
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
                const busy = saving.startsWith(`${category.slug}:${day.date}`);
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
                    <input
                      key={`${category.slug}-${day.date}-${field}-${value}`}
                      type="number"
                      min={0}
                      step={row.kind === "inventory" ? 1 : 0.01}
                      defaultValue={value}
                      disabled={busy || (row.kind === "inventory" && day.blocked)}
                      className="h-8 w-16 rounded-md border border-transparent bg-transparent text-center outline-none hover:border-[#E6DED0] focus:border-[#C4A36A] focus:bg-white disabled:opacity-60"
                      onBlur={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isFinite(next) || next === value) return;
                        onSave(category.slug, day.date, { [field]: next });
                      }}
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
