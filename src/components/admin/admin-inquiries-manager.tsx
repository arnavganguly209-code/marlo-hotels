"use client";

import { useMemo, useState } from "react";
import { Eye, Search, Trash2, X } from "lucide-react";

export type InquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

const STATUSES = ["UNREAD", "READ", "REPLIED", "ARCHIVED"] as const;

export function AdminInquiriesManager({
  initialMessages,
  emptyLabel = "No submissions yet.",
}: {
  initialMessages: InquiryRow[];
  emptyLabel?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<InquiryRow | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((item) => {
      const hay = `${item.name} ${item.email} ${item.phone || ""} ${item.country || ""} ${item.subject} ${item.message}`.toLowerCase();
      return (
        (!q || hay.includes(q)) &&
        (status === "ALL" || item.status === status)
      );
    });
  }, [messages, query, status]);

  async function setMessageStatus(id: string, next: string) {
    const response = await fetch("/api/admin/inquiries", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    const result = await response.json();
    if (response.ok && result.message) {
      setMessages((items) =>
        items.map((item) => (item.id === id ? result.message : item))
      );
      setSelected((current) =>
        current?.id === id ? result.message : current
      );
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this submission permanently?")) return;
    const response = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setMessages((items) => items.filter((item) => item.id !== id));
      setSelected(null);
    }
  }

  function exportCsv() {
    const header = [
      "Date",
      "Time",
      "Name",
      "Email",
      "Phone",
      "Country",
      "Subject",
      "Message",
      "Status",
    ];
    const rows = visible.map((item) => {
      const created = new Date(item.createdAt);
      return [
        created.toISOString().slice(0, 10),
        created.toISOString().slice(11, 19),
        item.name,
        item.email,
        item.phone || "",
        item.country || "",
        item.subject,
        item.message.replace(/\s+/g, " ").trim(),
        item.status,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",");
    });
    const blob = new Blob([[header.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `marlo-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const input =
    "h-10 rounded-lg border border-white/12 bg-black/20 px-3 text-sm text-ivory outline-none focus:border-[#D9B46B]/50";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-3 left-3 size-4 text-[#D9B46B]" />
          <input
            className={`${input} w-full pl-9`}
            placeholder="Search name, email, subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className={input}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-lg border border-[#D9B46B]/40 px-4 text-xs font-semibold tracking-wider text-[#D9B46B] uppercase"
        >
          Export
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[.04] text-[10px] tracking-widest text-[#D9B46B] uppercase">
            <tr>
              {[
                "Date",
                "Time",
                "Name",
                "Email",
                "Phone",
                "Country",
                "Subject",
                "Status",
                "",
              ].map((header) => (
                <th key={header || "actions"} className="px-3 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {visible.map((item) => {
              const created = new Date(item.createdAt);
              return (
                <tr key={item.id} className="text-cream-200/80">
                  <td className="px-3 py-3 whitespace-nowrap">
                    {created.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {created.toISOString().slice(11, 16)}
                  </td>
                  <td className="px-3 py-3 text-ivory">{item.name}</td>
                  <td className="px-3 py-3">{item.email}</td>
                  <td className="px-3 py-3">{item.phone || "—"}</td>
                  <td className="px-3 py-3">{item.country || "—"}</td>
                  <td className="max-w-56 truncate px-3 py-3">{item.subject}</td>
                  <td className="px-3 py-3">
                    <select
                      className="rounded border border-white/15 bg-[#0B1713] p-1 text-xs"
                      value={item.status}
                      onChange={(e) =>
                        void setMessageStatus(item.id, e.target.value)
                      }
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="View"
                        onClick={() => setSelected(item)}
                        className="p-1.5 text-[#D9B46B]"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => void remove(item.id)}
                        className="p-1.5 text-red-300"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-10 text-center text-sm text-cream-200/50">
            {emptyLabel}
          </p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/12 bg-[#0B1713] p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.22em] text-[#D9B46B] uppercase">
                  Submission details
                </p>
                <h2 className="font-display mt-1 text-2xl text-ivory">
                  {selected.subject}
                </h2>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                <X className="text-cream-200" />
              </button>
            </div>
            <dl className="grid gap-3 text-sm text-cream-200/80 sm:grid-cols-2">
              <div>
                <dt className="text-[#D9B46B]">Name</dt>
                <dd>{selected.name}</dd>
              </div>
              <div>
                <dt className="text-[#D9B46B]">Email</dt>
                <dd>{selected.email}</dd>
              </div>
              <div>
                <dt className="text-[#D9B46B]">Phone</dt>
                <dd>{selected.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-[#D9B46B]">Country</dt>
                <dd>{selected.country || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[#D9B46B]">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap">{selected.message}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
