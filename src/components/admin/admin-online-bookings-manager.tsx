"use client";

import { useMemo, useState } from "react";
import { Eye, FileDown, Mail, Pencil, Printer, Trash2, X } from "lucide-react";
import { BOOKING_OPS_STATUSES, BOOKING_OPS_STATUS_LABELS, PAYMENT_OPS_STATUSES, paymentOpsLabel } from "@/lib/admin/booking-ops";

type Booking = {
  id: string; reference: string; status: string; paymentStatus: string; guestName: string; guestEmail: string; guestPhone: string;
  country: string | null; checkIn: string; checkOut: string; adults: number; children: number; rooms: number; breakfast: boolean;
  physicalRoomNumber: string | null; notes: string | null; internalRemarks: string | null; totalAmount: number | null; createdAt: string;
  room: { name: string; slug: string };
};

const date = (value: string) => new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
const money = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const nights = (b: Booking) => Math.max(0, Math.round((+new Date(b.checkOut) - +new Date(b.checkIn)) / 86_400_000));

export function AdminOnlineBookingsManager({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [notice, setNotice] = useState("");
  const input = "w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm text-ivory outline-none focus:border-[#D9B46B]/60";
  const visible = useMemo(() => bookings.filter((b) => {
    const text = `${b.reference} ${b.guestName} ${b.guestEmail} ${b.guestPhone}`.toLowerCase();
    return (!query || text.includes(query.toLowerCase())) && (statusFilter === "ALL" || b.status === statusFilter) && (paymentFilter === "ALL" || (paymentFilter === "PENDING" ? ["PENDING", "UNPAID"].includes(b.paymentStatus) : b.paymentStatus === paymentFilter));
  }), [bookings, query, statusFilter, paymentFilter]);
  const update = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/online-bookings/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const result = await res.json();
    if (!res.ok) { setNotice(result.error || "Could not update booking."); return null; }
    setBookings(items => items.map(b => b.id === id ? result.booking : b));
    setSelected(old => old?.id === id ? result.booking : old);
    setEditing(old => old?.id === id ? result.booking : old);
    if (result.email?.reason) setNotice(result.email.reason);
    return result.booking as Booking;
  };
  const remove = async (booking: Booking) => {
    if (!window.confirm(`Permanently delete ${booking.reference}?`)) return;
    const res = await fetch(`/api/admin/online-bookings/${booking.id}`, { method: "DELETE" });
    if (res.ok) { setBookings(items => items.filter(b => b.id !== booking.id)); setSelected(null); setNotice("Booking deleted."); }
  };
  const sendEmail = async (booking: Booking) => {
    const res = await fetch(`/api/admin/online-bookings/${booking.id}/email`, { method: "POST" });
    const result = await res.json();
    setNotice(result.sent ? "Confirmation email sent." : result.reason || result.error || "Email could not be sent.");
  };
  const saveEdit = async () => { if (editing) { await update(editing.id, editing); setEditing(null); } };

  return <div className="space-y-5">
    {notice && <div className="flex justify-between rounded-xl border border-[#D9B46B]/25 bg-[#D9B46B]/10 px-4 py-3 text-sm text-cream-100">{notice}<button onClick={() => setNotice("")}><X className="size-4" /></button></div>}
    <div className="grid gap-3 md:grid-cols-3">
      <input className={input} placeholder="Search ID, guest, email or phone…" value={query} onChange={e => setQuery(e.target.value)} />
      <select className={input} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All statuses</option>{BOOKING_OPS_STATUSES.map(s => <option key={s} value={s}>{BOOKING_OPS_STATUS_LABELS[s]}</option>)}</select>
      <select className={input} value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}><option value="ALL">All payments</option>{PAYMENT_OPS_STATUSES.map(s => <option key={s} value={s}>{paymentOpsLabel(s)}</option>)}</select>
    </div>
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-[1850px] text-left text-xs">
        <thead className="bg-white/[.04] text-[10px] tracking-widest text-[#D9B46B] uppercase"><tr>{["Booking ID","Guest","Email","Phone","Country","Room","Room #","Adults","Children","Check-in / out","Nights","Total","Payment","Status","Booking date","Special requests","Actions"].map(h => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-white/8">{visible.map(b => <tr key={b.id} className="align-top text-cream-200/80">
          <td className="px-3 py-3 font-semibold text-ivory">{b.reference}</td><td className="px-3 py-3">{b.guestName}</td><td className="px-3 py-3">{b.guestEmail}</td><td className="px-3 py-3">{b.guestPhone}</td><td className="px-3 py-3">{b.country || "—"}</td><td className="px-3 py-3">{b.room.name}</td><td className="px-3 py-3">{b.physicalRoomNumber || "—"}</td><td className="px-3 py-3">{b.adults}</td><td className="px-3 py-3">{b.children}</td><td className="px-3 py-3 whitespace-nowrap">{date(b.checkIn)}<br />{date(b.checkOut)}</td><td className="px-3 py-3">{nights(b)}</td><td className="px-3 py-3 whitespace-nowrap">{money(b.totalAmount)}</td>
          <td className="px-3 py-3"><select className="rounded border border-white/15 bg-[#0B1713] p-1" value={b.paymentStatus === "UNPAID" ? "PENDING" : b.paymentStatus} onChange={e => void update(b.id, { paymentStatus: e.target.value })}>{PAYMENT_OPS_STATUSES.map(s => <option key={s} value={s}>{paymentOpsLabel(s)}</option>)}</select></td>
          <td className="px-3 py-3"><select className="rounded border border-white/15 bg-[#0B1713] p-1" value={b.status} onChange={e => void update(b.id, { status: e.target.value })}>{BOOKING_OPS_STATUSES.map(s => <option key={s} value={s}>{BOOKING_OPS_STATUS_LABELS[s]}</option>)}</select></td><td className="px-3 py-3 whitespace-nowrap">{date(b.createdAt)}</td><td className="max-w-44 truncate px-3 py-3">{b.notes || "—"}</td>
          <td className="px-3 py-3"><div className="flex gap-1"><button title="View" onClick={() => setSelected(b)} className="p-1.5 hover:text-[#D9B46B]"><Eye className="size-4" /></button><button title="Edit" onClick={() => setEditing(b)} className="p-1.5 hover:text-[#D9B46B]"><Pencil className="size-4" /></button><a title="Print" href={`/admin/online-bookings/${b.id}/print`} target="_blank" className="p-1.5 hover:text-[#D9B46B]"><Printer className="size-4" /></a><a title="Download PDF" href={`/api/admin/online-bookings/${b.id}/pdf`} className="p-1.5 hover:text-[#D9B46B]"><FileDown className="size-4" /></a><button title="Send Email (Ready)" onClick={() => void sendEmail(b)} className="p-1.5 hover:text-[#D9B46B]"><Mail className="size-4" /></button><button title="Delete" onClick={() => void remove(b)} className="p-1.5 text-red-300 hover:text-red-200"><Trash2 className="size-4" /></button></div></td>
        </tr>)}</tbody>
      </table>
      {!visible.length && <p className="p-12 text-center text-sm text-cream-200/55">No online bookings match these filters.</p>}
    </div>
    {(selected || editing) && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4"><div className="mx-auto my-8 w-full max-w-2xl rounded-2xl border border-white/12 bg-[#0B1713] p-6">
      <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl text-ivory">{editing ? "Edit reservation" : "Reservation details"}</h2><button onClick={() => { setSelected(null); setEditing(null); }}><X /></button></div>
      {editing ? <div className="grid gap-3 sm:grid-cols-2">{([["guestName","Guest name"],["guestEmail","Email"],["guestPhone","Phone"],["country","Country"],["physicalRoomNumber","Room number"]] as const).map(([key,label]) => <label key={key} className="grid gap-1 text-xs text-cream-200/60">{label}<input className={input} value={editing[key] || ""} onChange={e => setEditing({ ...editing, [key]: e.target.value })} /></label>)}<label className="grid gap-1 text-xs text-cream-200/60">Status<select className={input} value={editing.status} onChange={e => setEditing({...editing,status:e.target.value})}>{BOOKING_OPS_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label><label className="grid gap-1 text-xs text-cream-200/60">Payment<select className={input} value={editing.paymentStatus === "UNPAID" ? "PENDING" : editing.paymentStatus} onChange={e => setEditing({...editing,paymentStatus:e.target.value})}>{PAYMENT_OPS_STATUSES.map(s => <option key={s}>{s}</option>)}</select></label><label className="sm:col-span-2 grid gap-1 text-xs text-cream-200/60">Special requests<textarea className={`${input} h-20`} value={editing.notes || ""} onChange={e => setEditing({...editing,notes:e.target.value})} /></label><label className="sm:col-span-2 grid gap-1 text-xs text-cream-200/60">Internal note<textarea className={`${input} h-20`} value={editing.internalRemarks || ""} onChange={e => setEditing({...editing,internalRemarks:e.target.value})} /></label><div className="sm:col-span-2 flex justify-end gap-2"><button className="rounded-lg border border-white/15 px-4 py-2 text-sm" onClick={() => setEditing(null)}>Cancel</button><button className="rounded-lg bg-[#D9B46B] px-4 py-2 text-sm font-semibold text-[#0B1713]" onClick={() => void saveEdit()}>Save changes</button></div></div> : selected && <div className="space-y-4 text-sm text-cream-200/80"><p><span className="text-[#D9B46B]">Booking ID</span><br />{selected.reference}</p><div className="grid grid-cols-2 gap-4"><p><span className="text-[#D9B46B]">Guest</span><br />{selected.guestName}<br />{selected.guestEmail}<br />{selected.guestPhone}</p><p><span className="text-[#D9B46B]">Stay</span><br />{selected.room.name}<br />{date(selected.checkIn)} – {date(selected.checkOut)}<br />{nights(selected)} nights</p></div><p><span className="text-[#D9B46B]">Special requests</span><br />{selected.notes || "None"}</p><label className="grid gap-1"><span className="text-[#D9B46B]">Add internal note</span><textarea className={`${input} h-20`} defaultValue={selected.internalRemarks || ""} onBlur={e => void update(selected.id, { internalRemarks: e.target.value })} /></label></div>}
    </div></div>}
  </div>;
}
