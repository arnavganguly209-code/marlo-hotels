"use client";

import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";
import type { InventoryCategoryRow } from "@/lib/admin/physical-rooms-public";
import { cn } from "@/lib/utils";

export function AdminInventoryManager({
  initialRows,
}: {
  initialRows: InventoryCategoryRow[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function syncAll() {
    setSyncingAll(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/inventory", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Sync failed");
      setRows(result.rows as InventoryCategoryRow[]);
      setMessage(result.message || "Inventory synced.");
      setSavedSlug("all");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sync failed");
    } finally {
      setSyncingAll(false);
    }
  }

  async function saveRow(slug: string) {
    setSavingSlug(slug);
    setError("");
    setMessage("");
    try {
      // Full sync keeps every category aligned with room numbers.
      const response = await fetch("/api/admin/inventory", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save");
      setRows(result.rows as InventoryCategoryRow[]);
      setSavedSlug(slug);
      setMessage("Inventory updated from room numbers.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save");
    } finally {
      setSavingSlug(null);
    }
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center text-sm text-cream-200/55">
        No Marlo Hotels room categories found. Publish rooms in Admin → Rooms
        first, then add room numbers.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-cream-200/60">
          Totals sync automatically from Room Numbers. Save refreshes sellable
          inventory for the public booking catalogue.
        </p>
        <button
          type="button"
          disabled={syncingAll}
          onClick={() => void syncAll()}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D9B46B]/40 px-5 text-[11px] font-semibold tracking-[0.14em] text-[#D9B46B] uppercase disabled:opacity-60"
        >
          {syncingAll ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Sync all
        </button>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4">
        {rows.map((row) => {
          const saving = savingSlug === row.slug;
          const saved = savedSlug === row.slug || savedSlug === "all";
          return (
            <article
              key={row.slug}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#D9B46B] uppercase">
                    {row.roomType}
                  </p>
                  <h2 className="font-display mt-1 text-2xl text-ivory">
                    {row.name}
                  </h2>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveRow(row.slug)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#D9B46B] px-4 text-[10px] font-semibold tracking-[0.14em] text-[#0B1713] uppercase disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : saved ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  {saving ? "Saving…" : saved ? "Saved" : "Save"}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <Stat label="Total Physical Rooms" value={row.total} accent />
                <Stat label="Occupied Today" value={row.occupied} />
                <Stat label="Available Today" value={row.available} />
                <Stat label="Blocked Rooms" value={row.blocked} />
                <Stat label="Maintenance Rooms" value={row.maintenance} />
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-cream-200/45">
                <span>Cleaning: {row.cleaning}</span>
                <span>Out of Service: {row.outOfService}</span>
                <span>Sellable capacity: {row.sellableInventory}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-4",
        accent
          ? "border-[#D9B46B]/35 bg-[#D9B46B]/08"
          : "border-white/10 bg-black/15"
      )}
    >
      <p className="text-[10px] font-semibold tracking-[0.16em] text-cream-200/45 uppercase">
        {label}
      </p>
      <p
        className={cn(
          "font-display mt-2 text-3xl",
          accent ? "text-[#D9B46B]" : "text-ivory"
        )}
      >
        {value}
      </p>
    </div>
  );
}
