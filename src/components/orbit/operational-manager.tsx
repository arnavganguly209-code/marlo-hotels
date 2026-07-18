"use client";

import {
  Archive,
  Download,
  Mail,
  Search,
  ShieldX,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

export type OperationalRow = {
  id: string;
  primary: string;
  secondary: string;
  values: Record<string, string>;
  status?: string;
  createdAt: string;
};

export function OperationalManager({
  title,
  eyebrow,
  description,
  apiModule,
  rows: initialRows,
  columns,
  statusOptions,
  canDelete = true,
  readOnly = false,
  replyField,
}: {
  title: string;
  eyebrow: string;
  description: string;
  apiModule: string;
  rows: OperationalRow[];
  columns: { key: string; label: string }[];
  statusOptions?: string[];
  canDelete?: boolean;
  readOnly?: boolean;
  replyField?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        [row.primary, row.secondary, ...Object.values(row.values)]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query, rows]
  );

  function exportCsv() {
    const headers = ["Primary", "Secondary", ...columns.map((column) => column.label), "Status", "Created"];
    const lines = [
      headers,
      ...filtered.map((row) => [
        row.primary,
        row.secondary,
        ...columns.map((column) => row.values[column.key] ?? ""),
        row.status ?? "",
        row.createdAt,
      ]),
    ].map((line) =>
      line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
    );
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `marlo-${apiModule}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function updateStatus(row: OperationalRow, status: string) {
    setPending(row.id);
    const response = await fetch(`/api/orbit/operations/${apiModule}/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending(null);
    if (response.ok) {
      setRows((current) =>
        current.map((item) => (item.id === row.id ? { ...item, status } : item))
      );
    }
  }

  async function remove(row: OperationalRow) {
    if (!window.confirm(`Delete “${row.primary}”? This action is audited.`)) return;
    setPending(row.id);
    const response = await fetch(`/api/orbit/operations/${apiModule}/${row.id}`, {
      method: "DELETE",
    });
    setPending(null);
    if (response.ok) setRows((current) => current.filter((item) => item.id !== row.id));
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">{eyebrow}</p>
          <h2 className="font-display mt-2 text-4xl font-semibold text-[#10251e]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#62716b]">{description}</p>
        </div>
        <button type="button" onClick={exportCsv} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#17362b]/12 bg-white px-5 text-[10px] font-semibold tracking-[0.17em] text-[#294138] uppercase transition hover:border-[#c4943c]/40 hover:text-[#a67a30]">
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      <section className="orbit-panel mt-8 overflow-hidden rounded-2xl">
        <div className="border-b border-[#17362b]/8 p-5">
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#52665c]/40" />
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="h-11 w-full rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] pr-4 pl-10 text-xs text-[#1b342a] outline-none focus:border-[#c4943c]/45" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="bg-[#f3f3ee] text-[9px] tracking-[0.2em] text-[#738078] uppercase">
                <th className="px-6 py-3 font-semibold">Record</th>
                {columns.map((column) => <th key={column.key} className="px-5 py-3 font-semibold">{column.label}</th>)}
                {statusOptions ? <th className="px-5 py-3 font-semibold">Status</th> : null}
                <th className="px-5 py-3 font-semibold">Created</th>
                {!readOnly ? <th className="px-5 py-3 text-right font-semibold">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#17362b]/7">
              {filtered.length ? filtered.map((row) => (
                <tr key={row.id} className={`text-xs text-[#344b42] ${pending === row.id ? "opacity-50" : ""}`}>
                  <td className="px-6 py-4">
                    <p className="max-w-56 truncate font-semibold text-[#142820]">{row.primary}</p>
                    <p className="mt-0.5 max-w-64 truncate text-[11px] text-[#78847e]">{row.secondary}</p>
                  </td>
                  {columns.map((column) => <td key={column.key} className="max-w-52 truncate px-5 py-4">{row.values[column.key] || "—"}</td>)}
                  {statusOptions ? (
                    <td className="px-5 py-4">
                      <select value={row.status} disabled={pending === row.id} onChange={(event) => updateStatus(row, event.target.value)} className="rounded-lg border border-[#17362b]/10 bg-[#f4f6f3] px-2.5 py-2 text-[9px] font-semibold tracking-[0.1em] text-[#315345] uppercase outline-none">
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  ) : null}
                  <td className="px-5 py-4 text-[#78847e]">{new Date(row.createdAt).toLocaleDateString()}</td>
                  {!readOnly ? (
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {replyField && row.values[replyField] ? (
                          <a href={`mailto:${row.values[replyField]}`} aria-label={`Reply to ${row.primary}`} className="grid size-9 place-items-center rounded-lg text-[#53675e] hover:bg-[#edf2ee] hover:text-[#a67a30]">
                            <Mail className="size-4" />
                          </a>
                        ) : null}
                        {apiModule === "security" ? (
                          <button type="button" onClick={() => updateStatus(row, "REVOKED")} aria-label="Revoke session" className="grid size-9 place-items-center rounded-lg text-[#53675e] hover:bg-amber-50 hover:text-amber-700">
                            <ShieldX className="size-4" />
                          </button>
                        ) : null}
                        {statusOptions?.includes("ARCHIVED") && row.status !== "ARCHIVED" ? (
                          <button type="button" onClick={() => updateStatus(row, "ARCHIVED")} aria-label={`Archive ${row.primary}`} className="grid size-9 place-items-center rounded-lg text-[#53675e] hover:bg-[#edf2ee] hover:text-[#a67a30]">
                            <Archive className="size-4" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button type="button" onClick={() => remove(row)} aria-label={`Delete ${row.primary}`} className="grid size-9 place-items-center rounded-lg text-[#53675e] hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="size-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              )) : (
                <tr><td colSpan={columns.length + 4} className="px-6 py-20 text-center text-sm text-[#78847e]">No matching records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
