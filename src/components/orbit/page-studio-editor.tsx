"use client";

import {
  Check,
  ExternalLink,
  ImageIcon,
  RotateCcw,
  Save,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MediaField } from "@/components/orbit/media-picker";
import { useToast } from "@/components/orbit/toast";
import type { PageSectionDef } from "@/lib/orbit/page-studio";
import { withMediaCacheBust } from "@/lib/media-cache";
import { cn } from "@/lib/utils";

type SectionData = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: { assetId?: string | null; src: string; alt: string };
  seoTitle: string;
  seoDescription: string;
};

function emptySection(): SectionData {
  return {
    enabled: true,
    eyebrow: "",
    heading: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    image: { assetId: null, src: "", alt: "" },
    seoTitle: "",
    seoDescription: "",
  };
}

export function PageStudioEditor({
  moduleSlug,
  moduleLabel,
  sections,
  publicPath,
  initialDocument,
}: {
  moduleSlug: string;
  moduleLabel: string;
  sections: PageSectionDef[];
  publicPath: string;
  initialDocument?: Record<string, SectionData> | null;
}) {
  const { push } = useToast();
  const defaults = useMemo(() => {
    const doc: Record<string, SectionData> = {};
    for (const section of sections) {
      doc[section.key] = {
        ...emptySection(),
        heading: section.label,
        ...(initialDocument?.[section.key] || {}),
      };
    }
    return doc;
  }, [sections, initialDocument]);

  const [doc, setDoc] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [active, setActive] = useState(sections[0]?.key || "hero");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setDoc(defaults);
    setSaved(defaults);
  }, [defaults]);

  const activeMeta = sections.find((item) => item.key === active) || sections[0];
  const value = doc[active] || emptySection();

  function update(next: Partial<SectionData>) {
    setDoc((current) => ({
      ...current,
      [active]: { ...current[active], ...next },
    }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/orbit/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: moduleSlug,
          key: "page-studio",
          title: `${moduleLabel} Page`,
          status: "PUBLISHED",
          data: doc,
        }),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        push(result.error || "Save failed", "error");
        return;
      }
      setSaved(structuredClone(doc));
      setDirty(false);
      setLastSavedAt(new Date().toLocaleString());
      push(result.message || "Saved Successfully · Published", "success");
    } catch {
      push("Network Error", "error");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setDoc(structuredClone(saved));
    setDirty(false);
  }

  return (
    <div className="flex min-h-[calc(100svh-5rem)] w-full flex-col">
      <div className="flex flex-col gap-4 border-b border-[var(--orbit-border)] bg-[var(--orbit-bg-elevated)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:px-8">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[var(--orbit-gold-deep)] uppercase">
            Website · Page Studio
          </p>
          <h1 className="font-display mt-1 text-3xl font-semibold text-[var(--orbit-ink)]">
            {moduleLabel}
          </h1>
          <p className="mt-1 text-sm text-[var(--orbit-muted)]">
            {dirty
              ? "Unsaved changes"
              : lastSavedAt
                ? `Published · Last updated ${lastSavedAt}`
                : "Edit this page only — not mixed with Homepage."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={publicPath}
            target="_blank"
            className="flex h-11 items-center gap-2 rounded-xl border border-[var(--orbit-border)] bg-white px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
          >
            <ExternalLink className="size-4" /> View page
          </Link>
          <button
            type="button"
            onClick={discard}
            disabled={!dirty || saving}
            className="h-11 rounded-xl border border-[var(--orbit-border)] bg-white px-4 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!dirty || saving}
            className="orbit-gold-button flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save & Publish"}
          </button>
        </div>
      </div>

      {dirty ? (
        <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:mx-6">
          Unsaved Changes — live website updates only after Save & Publish.
        </div>
      ) : (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 sm:mx-6">
          <Check className="size-4" /> Saved Successfully / showing published content
        </div>
      )}

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 border-t border-[var(--orbit-border)] lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav className="orbit-scrollbar max-h-[40vh] space-y-2 overflow-y-auto border-b border-[var(--orbit-border)] bg-[var(--orbit-bg-elevated)] p-4 lg:max-h-none lg:border-r lg:border-b-0">
          {sections.map((section) => {
            const thumb = doc[section.key]?.image?.src;
            const enabled = doc[section.key]?.enabled !== false;
            const isActive = active === section.key;
            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setActive(section.key)}
                className={cn(
                  "orbit-section-card flex w-full gap-3 rounded-2xl p-3 text-left",
                  isActive && "ring-1 ring-[#c4943c]/40"
                )}
                data-active={isActive}
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-[#dfe5e0]">
                  {thumb ? (
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={thumb.startsWith("/media/")}
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <ImageIcon className="size-4 opacity-50" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{section.label}</p>
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        enabled ? "bg-emerald-400" : "bg-[#a8b0ac]"
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-[11px]",
                      isActive ? "text-[#ead39f]/75" : "text-[#7a8781]"
                    )}
                  >
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
          <Link
            href={`/orbit/${moduleSlug}?inventory=1`}
            className="mt-3 block rounded-xl border border-dashed border-[var(--orbit-border)] px-3 py-3 text-center text-[10px] font-semibold tracking-[0.14em] text-[var(--orbit-gold-deep)] uppercase"
          >
            Open {moduleLabel} inventory →
          </Link>
        </nav>

        <section className="min-w-0 bg-[var(--orbit-bg)] p-4 sm:p-6 xl:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.2em] text-[var(--orbit-gold-deep)] uppercase">
                Section editor
              </p>
              <h2 className="font-display mt-1 text-3xl font-semibold text-[var(--orbit-ink)]">
                {activeMeta?.label}
              </h2>
              <p className="mt-1 text-sm text-[var(--orbit-muted)]">
                {activeMeta?.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                update(saved[active] || emptySection());
                push("Section reset", "info");
              }}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-[var(--orbit-border)] bg-white px-3 text-[9px] font-semibold tracking-[0.12em] uppercase"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>

          <div className="orbit-panel max-w-4xl space-y-5 rounded-2xl p-6 sm:p-8">
            <label className="flex items-center justify-between rounded-xl border border-[var(--orbit-border)] bg-white px-4 py-3">
              <span className="text-sm font-semibold">Visible on website</span>
              <input
                type="checkbox"
                checked={value.enabled}
                onChange={(event) => update({ enabled: event.target.checked })}
              />
            </label>
            {(
              [
                ["eyebrow", "Eyebrow"],
                ["heading", "Heading"],
                ["description", "Description"],
                ["buttonText", "Button text"],
                ["buttonLink", "Button link"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                  {label}
                </span>
                {key === "description" ? (
                  <textarea
                    rows={4}
                    value={value[key]}
                    onChange={(event) => update({ [key]: event.target.value })}
                    className="w-full rounded-xl border border-[var(--orbit-border)] bg-white px-4 py-3 text-sm"
                  />
                ) : (
                  <input
                    value={value[key]}
                    onChange={(event) => update({ [key]: event.target.value })}
                    className="h-11 w-full rounded-xl border border-[var(--orbit-border)] bg-white px-4 text-sm"
                  />
                )}
              </label>
            ))}
            <MediaField
              label="Section image / video poster"
              kind="IMAGE"
              value={{
                assetId: value.image.assetId,
                url: value.image.src,
                alt: value.image.alt,
                kind: "IMAGE",
              }}
              onChange={(next) =>
                update({
                  image: {
                    assetId: next.assetId,
                    src: withMediaCacheBust(next.url),
                    alt: next.alt,
                  },
                })
              }
            />
            {active === "seo" || activeMeta?.key === "seo" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    SEO title
                  </span>
                  <input
                    value={value.seoTitle}
                    onChange={(event) => update({ seoTitle: event.target.value })}
                    className="h-11 w-full rounded-xl border border-[var(--orbit-border)] bg-white px-4 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[9px] font-semibold tracking-[0.16em] text-[#4e6258] uppercase">
                    SEO description
                  </span>
                  <textarea
                    rows={3}
                    value={value.seoDescription}
                    onChange={(event) =>
                      update({ seoDescription: event.target.value })
                    }
                    className="w-full rounded-xl border border-[var(--orbit-border)] bg-white px-4 py-3 text-sm"
                  />
                </label>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
