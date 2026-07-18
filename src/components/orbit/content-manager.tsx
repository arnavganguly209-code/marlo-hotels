"use client";

import {
  Copy,
  ExternalLink,
  FilePlus2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MediaField } from "@/components/orbit/media-picker";
import { RichTextEditor } from "@/components/orbit/rich-text-editor";
import { useToast } from "@/components/orbit/toast";
import { fieldsForModule, type OrbitField } from "@/lib/orbit/fields";
import type { OrbitModule } from "@/lib/orbit/modules";
import { cn } from "@/lib/utils";

type Entry = {
  id: string;
  module: string;
  key: string;
  title: string;
  slug: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  data: Record<string, unknown>;
  seo: Record<string, unknown> | null;
  scheduledAt: string | null;
  updatedAt: string;
};

type FormState = {
  id?: string;
  title: string;
  slug: string;
  status: Entry["status"];
  scheduledAt: string;
  data: Record<string, unknown>;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  status: "DRAFT",
  scheduledAt: "",
  data: {},
};

export function ContentManager({
  module,
  initialEntries,
}: {
  module: OrbitModule;
  initialEntries: Entry[];
}) {
  const fields = fieldsForModule(module.slug);
  const { push } = useToast();
  const [entries, setEntries] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const filtered = useMemo(
    () =>
      entries.filter(
        (entry) =>
          (status === "ALL" || entry.status === status) &&
          (entry.title.toLowerCase().includes(query.toLowerCase()) ||
            entry.slug?.toLowerCase().includes(query.toLowerCase()))
      ),
    [entries, query, status]
  );

  function edit(entry: Entry) {
    setForm({
      id: entry.id,
      title: entry.title,
      slug: entry.slug ?? "",
      status: entry.status,
      scheduledAt: entry.scheduledAt?.slice(0, 16) ?? "",
      data: { ...entry.data },
    });
    setDirty(false);
    setError(null);
  }

  async function save() {
    if (!form?.title.trim()) {
      setError("A title is required.");
      push("Validation Error", "error");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      module: module.slug,
      title: form.title.trim(),
      slug: form.slug.trim() || null,
      status: form.status,
      scheduledAt: form.scheduledAt
        ? new Date(form.scheduledAt).toISOString()
        : null,
      data: form.data,
      seo: null,
    };

    // Keep homepage hero placement in sync when saving a Hero section.
    if (
      module.slug === "homepage" &&
      form.data.section === "Hero" &&
      typeof form.data.mediaAssetId === "string"
    ) {
      await fetch("/api/orbit/media/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "home.hero",
          label: "Homepage Hero",
          assetId: form.data.mediaAssetId,
          mediaType:
            form.data.mediaType === "VIDEO" || form.data.heroVideoUrl
              ? "VIDEO"
              : "IMAGE",
          alt: form.data.imageAlt || null,
          focalX: Number(form.data.focalX ?? 50),
          focalY: Number(form.data.focalY ?? 45),
          videoAutoplay: form.data.videoAutoplay !== false,
          videoLoop: form.data.videoLoop !== false,
          videoMuted: form.data.videoMuted !== false,
          posterUrl: form.data.posterUrl || null,
        }),
      });
    }

    const response = await fetch(
      form.id ? `/api/orbit/content/${form.id}` : "/api/orbit/content",
      {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = (await response.json()) as { entry?: Entry; error?: string };
    setSaving(false);
    if (!response.ok || !result.entry) {
      setError(result.error ?? "The record could not be saved.");
      push(result.error ?? "Server Error", "error");
      return;
    }
    setEntries((current) =>
      form.id
        ? current.map((entry) =>
            entry.id === result.entry?.id ? result.entry : entry
          )
        : [result.entry!, ...current]
    );
    setDirty(false);
    setForm(null);
    push("Changes Saved", "success");
  }

  async function remove(entry: Entry) {
    if (!window.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/orbit/content/${entry.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setEntries((current) => current.filter((item) => item.id !== entry.id));
    }
  }

  async function duplicate(entry: Entry) {
    const response = await fetch(`/api/orbit/content/${entry.id}`, {
      method: "POST",
    });
    const result = (await response.json()) as { entry?: Entry };
    if (response.ok && result.entry) {
      setEntries((current) => [result.entry!, ...current]);
    }
  }

  return (
    <div className="p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            {module.group} management
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold text-[#10251e]">
            {module.label}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#62716b]">
            {module.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm({ ...emptyForm, data: {} })}
          className="orbit-gold-button flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-[10px] font-semibold tracking-[0.2em] uppercase"
        >
          <Plus className="size-4" /> Add {module.singular}
        </button>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {module.capabilities.map((capability) => (
          <span
            key={capability}
            className="rounded-full border border-[#17362b]/9 bg-white/70 px-3 py-1.5 text-[10px] font-medium text-[#5e7168]"
          >
            {capability}
          </span>
        ))}
      </div>

      <section className="orbit-panel mt-7 overflow-hidden rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-[#17362b]/8 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#52665c]/40" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${module.label.toLowerCase()}…`}
              className="h-11 w-full rounded-xl border border-[#17362b]/10 bg-[#f8f8f4] pr-4 pl-10 text-xs text-[#1b342a] outline-none focus:border-[#c4943c]/45"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["ALL", "DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"].map(
              (option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[9px] font-semibold tracking-[0.13em] transition",
                    status === option
                      ? "bg-[#123429] text-[#e4c784]"
                      : "bg-[#f2f3ef] text-[#64736c] hover:text-[#a67a30]"
                  )}
                >
                  {option}
                </button>
              )
            )}
          </div>
        </div>

        {filtered.length ? (
          <div className="divide-y divide-[#17362b]/7">
            {filtered.map((entry) => (
              <article
                key={entry.id}
                className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-[#fafaf7] sm:flex-row sm:items-center"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#edf2ee] text-[#a67a30]">
                  <FilePlus2 className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-[#1b342a]">
                      {entry.title}
                    </h3>
                    <StatusPill status={entry.status} />
                  </div>
                  <p className="mt-1 truncate text-[11px] text-[#7a8781]">
                    {entry.slug ? `/${entry.slug}` : "No public slug"} · Updated{" "}
                    {new Date(entry.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {entry.slug ? (
                    <Link
                      href={`/${entry.slug}`}
                      target="_blank"
                      aria-label={`Preview ${entry.title}`}
                      className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-[#edf2ee] hover:text-[#a67a30]"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  ) : null}
                  <button type="button" onClick={() => duplicate(entry)} aria-label={`Duplicate ${entry.title}`} className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-[#edf2ee] hover:text-[#a67a30]">
                    <Copy className="size-4" />
                  </button>
                  <button type="button" onClick={() => edit(entry)} aria-label={`Edit ${entry.title}`} className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-[#edf2ee] hover:text-[#a67a30]">
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" onClick={() => remove(entry)} aria-label={`Delete ${entry.title}`} className="grid size-9 place-items-center rounded-lg text-[#53675e] transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <MoreHorizontal className="mx-auto size-8 text-[#aab2ae]" />
            <h3 className="font-display mt-4 text-xl font-semibold text-[#243b32]">
              No {module.label.toLowerCase()} found
            </h3>
            <p className="mt-2 text-sm text-[#7a8781]">
              {entries.length
                ? "Adjust the search or status filter."
                : `Create the first ${module.singular} to begin.`}
            </p>
          </div>
        )}
      </section>

      {form ? (
        <EditorDrawer
          module={module}
          fields={fields}
          form={form}
          setForm={(next) => {
            setForm(next);
            setDirty(true);
          }}
          saving={saving}
          error={error}
          dirty={dirty}
          onSave={save}
          onClose={() => {
            if (
              dirty &&
              !window.confirm("You have unsaved changes. Discard them?")
            ) {
              return;
            }
            setForm(null);
            setDirty(false);
          }}
          onReset={() => {
            if (form.id) {
              const entry = entries.find((item) => item.id === form.id);
              if (entry) edit(entry);
            } else {
              setForm({ ...emptyForm, data: {} });
              setDirty(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function EditorDrawer({
  module,
  fields,
  form,
  setForm,
  saving,
  error,
  dirty,
  onSave,
  onClose,
  onReset,
}: {
  module: OrbitModule;
  fields: OrbitField[];
  form: FormState;
  setForm: (form: FormState | null) => void;
  saving: boolean;
  error: string | null;
  dirty: boolean;
  onSave: () => void;
  onClose: () => void;
  onReset: () => void;
}) {
  const updateData = (key: string, value: unknown) =>
    setForm({ ...form, data: { ...form.data, [key]: value } });

  const visibleFields = fields.filter((field) => field.key !== "mediaAssetId");

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-[#06100c]/55 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close editor"
        onClick={onClose}
        className="absolute inset-0"
      />
      <aside className="relative h-full w-full max-w-3xl overflow-y-auto bg-[#f8f7f2] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#17362b]/9 bg-[#f8f7f2]/95 px-6 py-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-[9px] font-semibold tracking-[0.25em] text-[#a67a30] uppercase">
              {form.id ? "Edit" : "Create"} {module.singular}
              {dirty ? " · Unsaved" : ""}
            </p>
            <h2 className="font-display mt-1 text-2xl font-semibold text-[#10251e]">
              {form.title || `New ${module.singular}`}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-[#17362b]/10 text-[#53675e] hover:border-[#c4943c]/40 hover:text-[#a67a30]">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-7 p-6 sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <OrbitInput label="Internal title" required value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <OrbitInput label="Public slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} />
            <label>
              <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
                Status
              </span>
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Entry["status"] })} className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50">
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            {form.status === "SCHEDULED" ? (
              <OrbitInput label="Publish date" type="datetime-local" value={form.scheduledAt} onChange={(value) => setForm({ ...form, scheduledAt: value })} />
            ) : null}
          </div>

          <div className="h-px bg-[#17362b]/8" />

          {visibleFields.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={form.data[field.key]}
              formData={form.data}
              onChange={(value) => updateData(field.key, value)}
              onMediaSelect={(next) =>
                setForm({
                  ...form,
                  data: {
                    ...form.data,
                    [field.key]: next.url,
                    imageAlt:
                      field.key === "imageUrl"
                        ? next.alt
                        : form.data.imageAlt,
                    mediaAssetId: next.assetId,
                    mediaType: next.kind,
                  },
                })
              }
            />
          ))}

          {error ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#17362b]/8 pt-7">
            <button type="button" onClick={onReset} className="h-12 rounded-xl border border-[#17362b]/12 px-6 text-[10px] font-semibold tracking-[0.18em] text-[#4f645a] uppercase">
              Reset
            </button>
            <button type="button" onClick={onClose} className="h-12 rounded-xl border border-[#17362b]/12 px-6 text-[10px] font-semibold tracking-[0.18em] text-[#4f645a] uppercase">
              Cancel
            </button>
            <button type="button" onClick={onSave} disabled={saving} className="orbit-gold-button h-12 rounded-xl px-7 text-[10px] font-semibold tracking-[0.18em] uppercase disabled:opacity-50">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function FieldControl({
  field,
  value,
  formData,
  onChange,
  onMediaSelect,
}: {
  field: OrbitField;
  value: unknown;
  formData: Record<string, unknown>;
  onChange: (value: unknown) => void;
  onMediaSelect: (next: {
    assetId: string;
    url: string;
    alt: string;
    kind: "IMAGE" | "VIDEO";
  }) => void;
}) {
  const stringValue = typeof value === "string" ? value : "";
  if (field.type === "media" || field.type === "media-video") {
    return (
      <MediaField
        label={field.label}
        required={field.required}
        help={field.help}
        kind={field.type === "media-video" ? "VIDEO" : "IMAGE"}
        value={{
          assetId:
            typeof formData.mediaAssetId === "string"
              ? formData.mediaAssetId
              : null,
          url: stringValue || null,
          alt:
            typeof formData.imageAlt === "string" ? formData.imageAlt : null,
          kind:
            formData.mediaType === "VIDEO"
              ? "VIDEO"
              : field.type === "media-video"
                ? "VIDEO"
                : "IMAGE",
        }}
        onChange={onMediaSelect}
      />
    );
  }
  if (field.type === "richtext") {
    return (
      <label className="block">
        <FieldLabel field={field} />
        <RichTextEditor value={stringValue} onChange={onChange} />
      </label>
    );
  }
  if (field.type === "toggle") {
    const checked = value === true;
    return (
      <label className="flex items-center justify-between rounded-xl border border-[#17362b]/10 bg-white px-5 py-4">
        <span>
          <span className="block text-sm font-semibold text-[#294138]">{field.label}</span>
          {field.help ? <span className="mt-1 block text-xs text-[#7b8982]">{field.help}</span> : null}
        </span>
        <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cn("relative h-7 w-12 rounded-full transition", checked ? "bg-[#1d5a46]" : "bg-[#ccd2ce]")}>
          <span className={cn("absolute top-1 size-5 rounded-full bg-white shadow transition", checked ? "left-6" : "left-1")} />
        </button>
      </label>
    );
  }
  if (field.type === "textarea") {
    return (
      <label className="block">
        <FieldLabel field={field} />
        <textarea value={stringValue} onChange={(event) => onChange(event.target.value)} rows={5} required={field.required} className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm leading-relaxed text-[#203b30] outline-none focus:border-[#c4943c]/50" />
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <label className="block">
        <FieldLabel field={field} />
        <select value={stringValue} onChange={(event) => onChange(event.target.value)} required={field.required} className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50">
          <option value="">Select…</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }
  return (
    <label className="block">
      <FieldLabel field={field} />
      <input type={field.type === "datetime" ? "datetime-local" : field.type} value={field.type === "number" && typeof value === "number" ? value : stringValue} onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)} required={field.required} className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50" />
    </label>
  );
}

function FieldLabel({ field }: { field: OrbitField }) {
  return (
    <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
      {field.label} {field.required ? <span className="text-[#a67a30]">*</span> : null}
    </span>
  );
}

function OrbitInput({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label} {required ? <span className="text-[#a67a30]">*</span> : null}
      </span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#203b30] outline-none focus:border-[#c4943c]/50" />
    </label>
  );
}

function StatusPill({ status }: { status: Entry["status"] }) {
  const classes = {
    DRAFT: "bg-[#eef0ed] text-[#62716b]",
    SCHEDULED: "bg-blue-50 text-blue-700",
    PUBLISHED: "bg-emerald-50 text-emerald-700",
    ARCHIVED: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[8px] font-semibold tracking-[0.13em]", classes[status])}>
      {status}
    </span>
  );
}
