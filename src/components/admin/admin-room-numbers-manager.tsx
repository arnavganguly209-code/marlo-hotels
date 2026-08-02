"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type {
  MarloRoomCategory,
  PhysicalRoomRow,
  PhysicalRoomStatusValue,
} from "@/lib/admin/physical-rooms-public";
import { PHYSICAL_ROOM_STATUSES } from "@/lib/admin/physical-rooms-public";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<PhysicalRoomStatusValue, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
  OUT_OF_SERVICE: "Out of Service",
  CLEANING: "Cleaning",
  BLOCKED: "Blocked",
};

const STATUS_TONE: Record<PhysicalRoomStatusValue, string> = {
  AVAILABLE: "bg-emerald-500/15 text-emerald-300",
  OCCUPIED: "bg-sky-500/15 text-sky-300",
  MAINTENANCE: "bg-amber-500/15 text-amber-300",
  OUT_OF_SERVICE: "bg-red-500/15 text-red-300",
  CLEANING: "bg-violet-500/15 text-violet-300",
  BLOCKED: "bg-orange-500/15 text-orange-300",
};

type FormState = {
  id?: string;
  number: string;
  roomCategorySlug: string;
  status: PhysicalRoomStatusValue;
  notes: string;
};

function emptyForm(slug = ""): FormState {
  return {
    number: "",
    roomCategorySlug: slug,
    status: "AVAILABLE",
    notes: "",
  };
}

export function AdminRoomNumbersManager({
  categories,
  initialRooms,
}: {
  categories: MarloRoomCategory[];
  initialRooms: PhysicalRoomRow[];
}) {
  const [rooms, setRooms] = useState(initialRooms);
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug || "");
  const [form, setForm] = useState<FormState>(() =>
    emptyForm(categories[0]?.slug || "")
  );
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const activeCategory = categories.find((item) => item.slug === activeSlug);
  const filtered = useMemo(
    () =>
      rooms
        .filter((room) => room.roomCategorySlug === activeSlug)
        .sort((a, b) =>
          a.number.localeCompare(b.number, undefined, { numeric: true })
        ),
    [rooms, activeSlug]
  );

  function openCreate() {
    setForm(emptyForm(activeSlug));
    setError("");
    setOpen(true);
  }

  function openEdit(room: PhysicalRoomRow) {
    setForm({
      id: room.id,
      number: room.number,
      roomCategorySlug: room.roomCategorySlug,
      status: room.status,
      notes: room.notes,
    });
    setError("");
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      if (!form.number.trim()) throw new Error("Room number is required");
      if (!form.roomCategorySlug) throw new Error("Select a room category");

      const payload = {
        number: form.number.trim(),
        roomCategorySlug: form.roomCategorySlug,
        status: form.status,
        notes: form.notes.trim(),
      };

      const response = await fetch(
        form.id ? `/api/admin/room-numbers/${form.id}` : "/api/admin/room-numbers",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save room");

      const saved = result.room as PhysicalRoomRow;
      setRooms((current) => {
        const without = current.filter((item) => item.id !== saved.id);
        return [...without, saved];
      });
      setActiveSlug(saved.roomCategorySlug);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save room");
    } finally {
      setSaving(false);
    }
  }

  async function remove(room: PhysicalRoomRow) {
    if (!confirm(`Delete room ${room.number}?`)) return;
    const response = await fetch(`/api/admin/room-numbers/${room.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error || "Could not delete room");
      return;
    }
    setRooms((current) => current.filter((item) => item.id !== room.id));
  }

  if (!categories.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center text-sm text-cream-200/55">
        No Marlo Hotels room categories found. Publish rooms in Admin → Rooms
        first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="mb-2 block text-[10px] font-semibold tracking-[0.2em] text-[#D9B46B] uppercase">
            Room category
          </label>
          <select
            value={activeSlug}
            onChange={(event) => {
              setActiveSlug(event.target.value);
              setOpen(false);
            }}
            className="h-11 w-full max-w-md rounded-xl border border-white/12 bg-[#0F1F1A] px-4 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title} ({category.roomType})
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#D9B46B] px-5 text-[11px] font-semibold tracking-[0.14em] text-[#0B1713] uppercase"
        >
          <Plus className="size-4" /> Add room number
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#D9B46B] uppercase">
              Physical rooms
            </p>
            <h2 className="font-display mt-1 text-2xl text-ivory">
              {activeCategory?.title}
            </h2>
          </div>
          <p className="text-sm text-cream-200/60">
            {filtered.length} room{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        {filtered.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[10px] tracking-[0.18em] text-[#D9B46B] uppercase">
                <tr className="border-b border-white/10">
                  <th className="px-3 py-3 font-semibold">Number</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Notes</th>
                  <th className="px-3 py-3 font-semibold">Updated</th>
                  <th className="px-3 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filtered.map((room) => (
                  <tr key={room.id} className="text-cream-200/80">
                    <td className="px-3 py-3 font-semibold text-ivory">
                      {room.number}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase",
                          STATUS_TONE[room.status]
                        )}
                      >
                        {STATUS_LABEL[room.status]}
                      </span>
                    </td>
                    <td className="max-w-[280px] truncate px-3 py-3 text-cream-200/55">
                      {room.notes || "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-cream-200/45">
                      {new Date(room.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(room)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#D9B46B] uppercase"
                        >
                          <Pencil className="size-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(room)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-red-300 uppercase"
                        >
                          <Trash2 className="size-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-8 rounded-xl border border-dashed border-white/12 px-4 py-10 text-center text-sm text-cream-200/50">
            No physical room numbers yet for this category. Add the first room
            number to begin.
          </p>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-2xl border border-white/12 bg-[#0F1F1A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#D9B46B] uppercase">
                  {form.id ? "Edit room number" : "Add room number"}
                </p>
                <h3 className="font-display mt-1 text-xl text-ivory">
                  {activeCategory?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-white/12"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {error ? (
                <p className="rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <label className="grid gap-1.5 text-xs text-cream-200/65">
                Room number
                <input
                  value={form.number}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      number: event.target.value,
                    }))
                  }
                  placeholder="101"
                  className="h-11 rounded-xl border border-white/12 bg-black/20 px-4 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
                />
              </label>

              <label className="grid gap-1.5 text-xs text-cream-200/65">
                Room category
                <select
                  value={form.roomCategorySlug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      roomCategorySlug: event.target.value,
                    }))
                  }
                  className="h-11 rounded-xl border border-white/12 bg-black/20 px-4 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
                >
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-xs text-cream-200/65">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as PhysicalRoomStatusValue,
                    }))
                  }
                  className="h-11 rounded-xl border border-white/12 bg-black/20 px-4 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
                >
                  {PHYSICAL_ROOM_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-xs text-cream-200/65">
                Notes
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={3}
                  className="rounded-xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/10 px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 rounded-xl border border-white/12 px-4 text-[11px] font-semibold tracking-[0.14em] text-cream-200/70 uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#D9B46B] px-5 text-[11px] font-semibold tracking-[0.14em] text-[#0B1713] uppercase disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
