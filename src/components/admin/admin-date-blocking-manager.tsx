"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  DATE_BLOCK_REASONS,
  DATE_BLOCK_REASON_LABELS,
  type DateBlockReasonValue,
} from "@/lib/admin/pms-public";
import type {
  MarloRoomCategory,
  PhysicalRoomRow,
} from "@/lib/admin/physical-rooms-public";

type Block = {
  id: string;
  roomCategorySlug: string;
  roomCategoryName: string;
  physicalRoomNumber: string | null;
  startDate: string;
  endDate: string;
  reason: DateBlockReasonValue;
  notes: string;
  status: "ACTIVE" | "CANCELLED";
  createdBy: string | null;
};

type FormState = {
  roomCategorySlug: string;
  physicalRoomNumber: string;
  startDate: string;
  endDate: string;
  reason: DateBlockReasonValue;
  notes: string;
  createdBy: string;
};

const dateOnly = (value: string) => value.slice(0, 10);

const empty = (slug = ""): FormState => ({
  roomCategorySlug: slug,
  physicalRoomNumber: "",
  startDate: "",
  endDate: "",
  reason: "MAINTENANCE",
  notes: "",
  createdBy: "",
});

export function AdminDateBlockingManager({
  initialCategories,
  initialBlocks,
  initialPhysicalRooms,
}: {
  initialCategories: MarloRoomCategory[];
  initialBlocks: Block[];
  initialPhysicalRooms: PhysicalRoomRow[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [form, setForm] = useState(empty(initialCategories[0]?.slug));
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rooms = useMemo(
    () =>
      initialPhysicalRooms.filter(
        (room) => room.roomCategorySlug === form.roomCategorySlug
      ),
    [initialPhysicalRooms, form.roomCategorySlug]
  );

  const close = () => {
    setOpen(false);
    setEditing(null);
    setError("");
  };

  async function save() {
    setError("");
    if (!form.roomCategorySlug || !form.startDate || !form.endDate) {
      setError("Category and dates are required.");
      return;
    }
    if (form.endDate < form.startDate) {
      setError("End date must be on or after start date.");
      return;
    }

    setSaving(true);
    try {
      const endpoint = editing
        ? `/api/admin/date-blocks/${editing}`
        : "/api/admin/date-blocks";
      const response = await fetch(endpoint, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not save date block");
        return;
      }
      const block = result.block as Block;
      setBlocks((items) => [
        block,
        ...items.filter((item) => item.id !== block.id),
      ]);
      close();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Cancel this date block?")) return;
    const response = await fetch(`/api/admin/date-blocks/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setBlocks((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: "CANCELLED" } : item
        )
      );
    }
  }

  const field =
    "h-10 rounded-lg border border-white/12 bg-black/20 px-3 text-sm text-ivory outline-none focus:border-[#D9B46B]/50";

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setForm(empty(initialCategories[0]?.slug));
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D9B46B] px-4 py-2.5 text-xs font-semibold text-[#0B1713]"
        >
          <Plus className="size-4" /> Create block
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[.04] text-[10px] tracking-widest text-[#D9B46B] uppercase">
            <tr>
              {[
                "Room Category",
                "Room Number",
                "Start Date",
                "End Date",
                "Reason",
                "Status",
                "Notes",
                "Created By",
                "",
              ].map((h) => (
                <th key={h || "actions"} className="px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {blocks.map((block) => (
              <tr
                key={block.id}
                className={`text-cream-200/80 ${
                  block.status === "CANCELLED" ? "opacity-45" : ""
                }`}
              >
                <td className="px-3 py-3">{block.roomCategoryName}</td>
                <td className="px-3 py-3">
                  {block.physicalRoomNumber || "All rooms"}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {dateOnly(block.startDate)}
                </td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {dateOnly(block.endDate)}
                </td>
                <td className="px-3 py-3">
                  {DATE_BLOCK_REASON_LABELS[block.reason]}
                </td>
                <td className="px-3 py-3">{block.status}</td>
                <td className="max-w-48 truncate px-3 py-3">
                  {block.notes || "—"}
                </td>
                <td className="px-3 py-3">{block.createdBy || "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => {
                        setEditing(block.id);
                        setForm({
                          roomCategorySlug: block.roomCategorySlug,
                          physicalRoomNumber: block.physicalRoomNumber || "",
                          startDate: dateOnly(block.startDate),
                          endDate: dateOnly(block.endDate),
                          reason: block.reason,
                          notes: block.notes,
                          createdBy: block.createdBy || "",
                        });
                        setOpen(true);
                      }}
                    >
                      <Pencil className="size-4 text-[#D9B46B]" />
                    </button>
                    {block.status === "ACTIVE" && (
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => void remove(block.id)}
                      >
                        <Trash2 className="size-4 text-red-300" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!blocks.length && (
          <p className="p-10 text-center text-sm text-cream-200/50">
            No date blocks recorded.
          </p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/12 bg-[#0B1713] p-5">
            <div className="mb-4 flex justify-between">
              <h2 className="font-display text-xl text-ivory">
                {editing ? "Edit date block" : "Create date block"}
              </h2>
              <button type="button" onClick={close}>
                <X />
              </button>
            </div>

            {error && (
              <p className="mb-3 rounded-lg bg-red-500/15 p-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs text-cream-200/60">
                Room category
                <select
                  className={field}
                  value={form.roomCategorySlug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      roomCategorySlug: e.target.value,
                      physicalRoomNumber: "",
                    })
                  }
                >
                  {initialCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                Physical room number (optional)
                <select
                  className={field}
                  value={form.physicalRoomNumber}
                  onChange={(e) =>
                    setForm({ ...form, physicalRoomNumber: e.target.value })
                  }
                >
                  <option value="">Entire category</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.number}>
                      {r.number}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                Start date
                <input
                  className={field}
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                />
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                End date
                <input
                  className={field}
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm({ ...form, endDate: e.target.value })
                  }
                />
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                Reason
                <select
                  className={field}
                  value={form.reason}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      reason: e.target.value as DateBlockReasonValue,
                    })
                  }
                >
                  {DATE_BLOCK_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {DATE_BLOCK_REASON_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                Created by
                <input
                  className={field}
                  placeholder="Staff name"
                  value={form.createdBy}
                  onChange={(e) =>
                    setForm({ ...form, createdBy: e.target.value })
                  }
                />
              </label>
            </div>

            <label className="mt-3 grid gap-1 text-xs text-cream-200/60">
              Notes
              <textarea
                className={`${field} h-24 w-full py-2`}
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm"
                onClick={close}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                className="rounded-lg bg-[#D9B46B] px-4 py-2 text-sm font-semibold text-[#0B1713] disabled:opacity-40"
                onClick={() => void save()}
              >
                {saving ? "Saving…" : "Save block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
