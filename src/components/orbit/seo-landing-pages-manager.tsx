"use client";

import {
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useToast } from "@/components/orbit/toast";
import { pathToPublicUrl } from "@/lib/seo-landing/types";

type Faq = { question: string; answer: string };

type PageRow = {
  id: string;
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  body: string;
  faqs: Faq[] | unknown;
  locationKey: string | null;
  categoryKey: string | null;
  facilityKey: string | null;
  roomFilter: string;
  canonicalUrl: string | null;
  robotsIndex: boolean;
  enabled: boolean;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  relatedPaths: string[] | unknown;
  updatedAt: string;
};

function asFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      return {
        question: String(row.question ?? ""),
        answer: String(row.answer ?? ""),
      };
    })
    .filter((item): item is Faq => Boolean(item?.question && item?.answer));
}

function asPaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

const emptyForm = {
  path: "hotels/",
  title: "",
  metaTitle: "",
  metaDescription: "",
  h1: "",
  intro: "",
  body: "",
  faqsText: "",
  locationKey: "",
  categoryKey: "",
  facilityKey: "",
  roomFilter: "all",
  canonicalUrl: "",
  robotsIndex: true,
  enabled: true,
  status: "DRAFT" as PageRow["status"],
  featuredImageUrl: "/images/brand/social-share.jpg",
  featuredImageAlt: "Marlo Hotels Kathmandu",
  relatedPathsText: "",
};

function faqsToText(faqs: Faq[]) {
  return faqs.map((f) => `${f.question} | ${f.answer}`).join("\n");
}

function textToFaqs(text: string): Faq[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...rest] = line.split("|");
      return {
        question: (question || "").trim(),
        answer: rest.join("|").trim(),
      };
    })
    .filter((f) => f.question && f.answer);
}

export function SeoLandingPagesManager({
  initialPages,
}: {
  initialPages: PageRow[];
}) {
  const { push } = useToast();
  const [pages, setPages] = useState(initialPages);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<(typeof emptyForm & { id?: string }) | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      pages.filter(
        (page) =>
          page.title.toLowerCase().includes(query.toLowerCase()) ||
          page.path.toLowerCase().includes(query.toLowerCase())
      ),
    [pages, query]
  );

  function edit(page: PageRow) {
    setForm({
      id: page.id,
      path: page.path,
      title: page.title,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      h1: page.h1,
      intro: page.intro,
      body: page.body || "",
      faqsText: faqsToText(asFaqs(page.faqs)),
      locationKey: page.locationKey || "",
      categoryKey: page.categoryKey || "",
      facilityKey: page.facilityKey || "",
      roomFilter: page.roomFilter || "all",
      canonicalUrl: page.canonicalUrl || "",
      robotsIndex: page.robotsIndex,
      enabled: page.enabled,
      status: page.status,
      featuredImageUrl: page.featuredImageUrl || "",
      featuredImageAlt: page.featuredImageAlt || "",
      relatedPathsText: asPaths(page.relatedPaths).join("\n"),
    });
    setError(null);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    const payload = {
      path: form.path.trim().replace(/^\/+/, "").toLowerCase(),
      title: form.title.trim(),
      metaTitle: form.metaTitle.trim(),
      metaDescription: form.metaDescription.trim(),
      h1: form.h1.trim(),
      intro: form.intro.trim(),
      body: form.body,
      faqs: textToFaqs(form.faqsText),
      locationKey: form.locationKey.trim() || null,
      categoryKey: form.categoryKey.trim() || null,
      facilityKey: form.facilityKey.trim() || null,
      roomFilter: form.roomFilter,
      canonicalUrl: form.canonicalUrl.trim() || null,
      robotsIndex: form.robotsIndex,
      enabled: form.enabled,
      status: form.status,
      featuredImageUrl: form.featuredImageUrl.trim() || null,
      featuredImageAlt: form.featuredImageAlt.trim() || null,
      relatedPaths: form.relatedPathsText
        .split("\n")
        .map((line) => line.trim().replace(/^\/+/, ""))
        .filter(Boolean),
    };

    const response = await fetch(
      form.id ? `/api/orbit/seo-pages/${form.id}` : "/api/orbit/seo-pages",
      {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = (await response.json()) as { page?: PageRow; error?: string };
    setSaving(false);
    if (!response.ok || !result.page) {
      setError(result.error || "Save failed");
      push("Save failed", "error");
      return;
    }
    setPages((prev) => {
      const next = prev.filter((item) => item.id !== result.page!.id);
      return [result.page!, ...next].sort((a, b) =>
        a.path.localeCompare(b.path)
      );
    });
    setForm(null);
    push("Saved Successfully", "success");
  }

  async function remove(page: PageRow) {
    if (!window.confirm(`Delete SEO page /${page.path}?`)) return;
    const response = await fetch(`/api/orbit/seo-pages/${page.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      push("Delete failed", "error");
      return;
    }
    setPages((prev) => prev.filter((item) => item.id !== page.id));
    push("Deleted", "success");
  }

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase">
            Orbit · SEO
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-[#10251e]">
            SEO Landing Pages
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#62716b]">
            Kathmandu / Thamel landing pages for Marlo Hotels only. Room results
            come from the live rooms catalogue — never invent hotels or
            distances.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
            <Link href="/orbit/seo" className="text-[#a67a30]">
              Sitewide SEO keywords →
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm })}
          className="orbit-gold-button flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[10px] font-semibold tracking-[0.2em] uppercase"
        >
          <Plus className="size-4" /> Add page
        </button>
      </div>

      <div className="orbit-panel mt-8 overflow-hidden rounded-2xl">
        <div className="border-b border-[#17362b]/8 p-5">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search path or title…"
            className="h-11 w-full max-w-md rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
          />
        </div>
        <div className="divide-y divide-[#17362b]/8">
          {filtered.map((page) => (
            <div
              key={page.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-[#10251e]">{page.title}</p>
                <p className="mt-1 text-xs text-[#62716b]">
                  /{page.path} · {page.status}
                  {!page.enabled ? " · disabled" : ""}
                  {!page.robotsIndex ? " · noindex" : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={pathToPublicUrl(page.path)}
                  target="_blank"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#17362b]/12 px-3 text-[10px] font-semibold tracking-[0.14em] uppercase"
                >
                  Preview <ExternalLink className="size-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => edit(page)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#17362b]/12 px-3 text-[10px] font-semibold tracking-[0.14em] uppercase"
                >
                  <Pencil className="size-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(page)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
          {!filtered.length ? (
            <p className="px-5 py-10 text-sm text-[#62716b]">
              No SEO landing pages yet. Add one, or run the seed script after
              migration.
            </p>
          ) : null}
        </div>
      </div>

      {form ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="flex h-full w-full max-w-xl flex-col bg-[#f7f5f0] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#17362b]/10 px-5 py-4">
              <h2 className="font-display text-xl text-[#10251e]">
                {form.id ? "Edit landing page" : "New landing page"}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="grid size-9 place-items-center rounded-full hover:bg-black/5"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {(
                [
                  ["path", "Path (hotels/...)", "text"],
                  ["title", "Admin title", "text"],
                  ["metaTitle", "SEO title", "text"],
                  ["metaDescription", "Meta description", "textarea"],
                  ["h1", "H1", "text"],
                  ["intro", "Introduction", "textarea"],
                  ["body", "Body content", "textarea"],
                  ["faqsText", "FAQs (Question | Answer per line)", "textarea"],
                  ["locationKey", "Location key", "text"],
                  ["categoryKey", "Category key", "text"],
                  ["facilityKey", "Facility key (only if verified)", "text"],
                  ["canonicalUrl", "Canonical URL (optional)", "text"],
                  ["featuredImageUrl", "Featured image URL", "text"],
                  ["featuredImageAlt", "Featured image alt", "text"],
                  [
                    "relatedPathsText",
                    "Related paths (one per line)",
                    "textarea",
                  ],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    {label}
                  </span>
                  {type === "textarea" ? (
                    <textarea
                      rows={key === "body" || key === "intro" ? 4 : 3}
                      value={String(form[key] ?? "")}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                      className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm"
                    />
                  ) : (
                    <input
                      value={String(form[key] ?? "")}
                      onChange={(event) =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
                    />
                  )}
                </label>
              ))}

              <label className="block">
                <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                  Room filter
                </span>
                <select
                  value={form.roomFilter}
                  onChange={(event) =>
                    setForm({ ...form, roomFilter: event.target.value })
                  }
                  className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
                >
                  <option value="all">All published rooms</option>
                  <option value="featured">Featured only</option>
                  <option value="suites">Suites</option>
                  <option value="rooms">Rooms</option>
                  <option value="luxury">Luxury (suites / higher)</option>
                  <option value="budget">Budget (lower half)</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                  Status
                </span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as PageRow["status"],
                    })
                  }
                  className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>

              <label className="flex items-center gap-3 text-sm text-[#203b30]">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) =>
                    setForm({ ...form, enabled: event.target.checked })
                  }
                />
                Enabled on website
              </label>
              <label className="flex items-center gap-3 text-sm text-[#203b30]">
                <input
                  type="checkbox"
                  checked={form.robotsIndex}
                  onChange={(event) =>
                    setForm({ ...form, robotsIndex: event.target.checked })
                  }
                />
                Allow search indexing (robots index)
              </label>

              {error ? (
                <p className="text-sm text-red-700">{error}</p>
              ) : null}
            </div>
            <div className="border-t border-[#17362b]/10 px-5 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="orbit-gold-button h-12 w-full rounded-xl text-[10px] font-semibold tracking-[0.2em] uppercase disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save page"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
