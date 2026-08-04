"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";

export type NewsletterRow = {
  id: string;
  email: string;
  createdAt: string;
};

export function AdminNewsletterManager({
  initialSubscribers,
}: {
  initialSubscribers: NewsletterRow[];
}) {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers.filter((item) => !q || item.email.toLowerCase().includes(q));
  }, [subscribers, query]);

  async function remove(id: string) {
    if (!confirm("Remove this subscriber?")) return;
    const response = await fetch(
      `/api/admin/newsletter?id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    if (response.ok) {
      setSubscribers((items) => items.filter((item) => item.id !== id));
    }
  }

  function exportCsv() {
    const header = ["Date", "Time", "Email"];
    const rows = visible.map((item) => {
      const created = new Date(item.createdAt);
      return [
        created.toISOString().slice(0, 10),
        created.toISOString().slice(11, 19),
        item.email,
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
    anchor.download = `marlo-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
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
            placeholder="Search email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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
              {["Date", "Time", "Email", ""].map((header) => (
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
                  <td className="px-3 py-3 text-ivory">{item.email}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => void remove(item.id)}
                      className="p-1.5 text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-10 text-center text-sm text-cream-200/50">
            No newsletter subscribers yet.
          </p>
        )}
      </div>
    </div>
  );
}
