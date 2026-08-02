"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import type {
  MarloRoomCategory,
  PhysicalRoomRow,
} from "@/lib/admin/physical-rooms-public";
import {
  OFFLINE_BOOKING_STATUSES,
  OFFLINE_PAYMENT_STATUSES,
} from "@/lib/admin/pms-public";

type Booking = {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  status: string;
  paymentStatus: string;
  physicalRoomNumber: string | null;
  totalAmount: number | null;
  room: { name: string; slug: string };
};

type FormState = {
  guestName: string;
  email: string;
  phone: string;
  country: string;
  roomCategorySlug: string;
  physicalRoomNumber: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  rooms: string;
  breakfast: boolean;
  totalAmount: string;
  paymentStatus: string;
  bookingStatus: string;
  notes: string;
  internalRemarks: string;
  createdBy: string;
};

const blank = (slug = ""): FormState => ({
  guestName: "",
  email: "",
  phone: "",
  country: "",
  roomCategorySlug: slug,
  physicalRoomNumber: "",
  checkIn: "",
  checkOut: "",
  adults: "1",
  children: "0",
  rooms: "1",
  breakfast: false,
  totalAmount: "",
  paymentStatus: "OFFLINE",
  bookingStatus: "CONFIRMED",
  notes: "",
  internalRemarks: "",
  createdBy: "",
});

export function AdminOfflineBookingsManager({
  categories,
  initialBookings,
}: {
  categories: MarloRoomCategory[];
  initialBookings: Booking[];
  initialPhysicalRooms: PhysicalRoomRow[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [form, setForm] = useState(blank(categories[0]?.slug));
  const [rooms, setRooms] = useState<PhysicalRoomRow[]>([]);
  const [available, setAvailable] = useState<number | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!form.roomCategorySlug || !form.checkIn || !form.checkOut) {
      setRooms([]);
      setAvailable(null);
      return;
    }
    if (form.checkOut <= form.checkIn) {
      setRooms([]);
      setAvailable(0);
      setError("Check-out must be after check-in.");
      return;
    }

    let cancelled = false;
    setLoadingAvailability(true);
    setError("");
    fetch(
      `/api/admin/offline-bookings/availability?slug=${encodeURIComponent(form.roomCategorySlug)}&checkIn=${form.checkIn}&checkOut=${form.checkOut}`
    )
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Could not load availability");
          setRooms([]);
          setAvailable(0);
          return;
        }
        setRooms(data.rooms || []);
        setAvailable(typeof data.available === "number" ? data.available : 0);
        setForm((old) => ({
          ...old,
          physicalRoomNumber: (data.rooms || []).some(
            (room: PhysicalRoomRow) => room.number === old.physicalRoomNumber
          )
            ? old.physicalRoomNumber
            : "",
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load availability");
          setRooms([]);
          setAvailable(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.roomCategorySlug, form.checkIn, form.checkOut]);

  async function save() {
    setError("");
    if (
      !form.guestName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.country.trim() ||
      !form.roomCategorySlug ||
      !form.physicalRoomNumber ||
      !form.checkIn ||
      !form.checkOut
    ) {
      setError("Please complete all required fields, including room number.");
      return;
    }
    if (available !== null && available <= 0) {
      setError("No rooms available for the selected dates.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/offline-bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          adults: Number(form.adults),
          children: Number(form.children),
          rooms: Number(form.rooms),
          totalAmount: form.totalAmount ? Number(form.totalAmount) : null,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not create booking");
        return;
      }
      setBookings((items) => [result.booking, ...items]);
      setOpen(false);
      setForm(blank(categories[0]?.slug));
      setRooms([]);
      setAvailable(null);
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/offline-bookings/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (response.ok) {
      setBookings((items) =>
        items.map((item) => (item.id === id ? result.booking : item))
      );
    }
  }

  const input =
    "h-10 rounded-lg border border-white/12 bg-black/20 px-3 text-sm text-ivory outline-none focus:border-[#D9B46B]/50";

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setForm(blank(categories[0]?.slug));
            setAvailable(null);
            setRooms([]);
            setError("");
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#D9B46B] px-4 py-2.5 text-xs font-semibold text-[#0B1713]"
        >
          <Plus className="size-4" /> Create booking
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[.04] text-[10px] tracking-widest text-[#D9B46B] uppercase">
            <tr>
              {[
                "Reference",
                "Guest",
                "Room",
                "Check-in",
                "Room no.",
                "Payment",
                "Status",
              ].map((h) => (
                <th key={h} className="px-3 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {bookings.map((b) => (
              <tr key={b.id} className="text-cream-200/80">
                <td className="px-3 py-3 font-medium text-ivory">{b.reference}</td>
                <td className="px-3 py-3">
                  <div>{b.guestName}</div>
                  <div className="text-xs text-cream-200/45">{b.guestEmail}</div>
                </td>
                <td className="px-3 py-3">{b.room?.name || "—"}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {b.checkIn.slice(0, 10)}
                </td>
                <td className="px-3 py-3">{b.physicalRoomNumber || "—"}</td>
                <td className="px-3 py-3">{b.paymentStatus}</td>
                <td className="px-3 py-3">
                  <select
                    value={b.status}
                    onChange={(e) => void setStatus(b.id, e.target.value)}
                    className="rounded border border-white/15 bg-[#0B1713] p-1 text-xs"
                  >
                    {OFFLINE_BOOKING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length && (
          <p className="p-10 text-center text-sm text-cream-200/50">
            No offline bookings recorded.
          </p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4">
          <div className="mx-auto my-6 w-full max-w-3xl rounded-2xl border border-white/12 bg-[#0B1713] p-5">
            <div className="mb-4 flex justify-between">
              <h2 className="font-display text-xl text-ivory">
                Create offline booking
              </h2>
              <button type="button" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            {error && (
              <p className="mb-3 rounded bg-red-500/15 p-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["guestName", "Guest name", "text"],
                  ["email", "Email", "email"],
                  ["phone", "Phone", "tel"],
                  ["country", "Country", "text"],
                  ["checkIn", "Check-in", "date"],
                  ["checkOut", "Check-out", "date"],
                  ["adults", "Adults", "number"],
                  ["children", "Children", "number"],
                  ["rooms", "Number of rooms", "number"],
                  ["totalAmount", "Total amount", "number"],
                  ["createdBy", "Created by", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label
                  key={key}
                  className="grid gap-1 text-xs text-cream-200/60"
                >
                  {label}
                  <input
                    className={input}
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                </label>
              ))}

              <label className="grid gap-1 text-xs text-cream-200/60">
                Room category
                <select
                  className={input}
                  value={form.roomCategorySlug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      roomCategorySlug: e.target.value,
                      physicalRoomNumber: "",
                    })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                Physical room number
                <select
                  className={input}
                  value={form.physicalRoomNumber}
                  onChange={(e) =>
                    setForm({ ...form, physicalRoomNumber: e.target.value })
                  }
                  disabled={loadingAvailability || !form.checkIn || !form.checkOut}
                >
                  <option value="">
                    {loadingAvailability
                      ? "Checking availability…"
                      : "Select available room"}
                  </option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.number}>
                      {r.number}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                Payment status
                <select
                  className={input}
                  value={form.paymentStatus}
                  onChange={(e) =>
                    setForm({ ...form, paymentStatus: e.target.value })
                  }
                >
                  {OFFLINE_PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs text-cream-200/60">
                Booking status
                <select
                  className={input}
                  value={form.bookingStatus}
                  onChange={(e) =>
                    setForm({ ...form, bookingStatus: e.target.value })
                  }
                >
                  {OFFLINE_BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {available !== null && (
              <p
                className={`mt-3 text-sm ${
                  available > 0 ? "text-[#D9B46B]" : "text-red-200"
                }`}
              >
                {available > 0
                  ? `${available} room(s) available for these dates.`
                  : "No rooms available for the selected dates."}
              </p>
            )}

            <textarea
              className={`${input} mt-3 h-20 w-full py-2`}
              placeholder="Guest notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <textarea
              className={`${input} mt-3 h-20 w-full py-2`}
              placeholder="Internal remarks"
              value={form.internalRemarks}
              onChange={(e) =>
                setForm({ ...form, internalRemarks: e.target.value })
              }
            />
            <label className="mt-3 flex gap-2 text-sm text-cream-200/80">
              <input
                type="checkbox"
                checked={form.breakfast}
                onChange={(e) =>
                  setForm({ ...form, breakfast: e.target.checked })
                }
              />
              Breakfast included
            </label>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  saving ||
                  loadingAvailability ||
                  available === 0 ||
                  !form.physicalRoomNumber
                }
                className="rounded-lg bg-[#D9B46B] px-4 py-2 text-sm font-semibold text-[#0B1713] disabled:opacity-40"
                onClick={() => void save()}
              >
                {saving ? "Creating…" : "Create booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
