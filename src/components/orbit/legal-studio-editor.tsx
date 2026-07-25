"use client";

import { Check, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  PageCoverEditor,
  syncPageCoverPlacement,
  type PageCoverValue,
} from "@/components/orbit/page-cover-editor";
import { useToast } from "@/components/orbit/toast";
import type { LegalPageContent, LegalSection } from "@/lib/legal-content";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const SECTION_META: {
  key: keyof LegalPageContent["sections"];
  label: string;
}[] = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "terms", label: "Terms & Conditions" },
  { key: "cancellation", label: "Cancellation Policy" },
  { key: "cookies", label: "Cookie Settings" },
];

export function LegalStudioEditor({
  initialContent,
}: {
  initialContent: LegalPageContent;
}) {
  const { push } = useToast();
  const [content, setContent] = useState(() => clone(initialContent));
  const [saved, setSaved] = useState(() => clone(initialContent));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  function updateCover(next: PageCoverValue) {
    setContent((current) => ({
      ...current,
      cover: {
        ...current.cover,
        src: next.src,
        alt: next.alt,
        assetId: next.assetId ?? null,
        eyebrow: next.eyebrow || "",
        title: next.title || "",
        description: next.description || "",
      },
    }));
    setDirty(true);
  }

  function updateSection(
    key: keyof LegalPageContent["sections"],
    patch: Partial<LegalSection>
  ) {
    setContent((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [key]: { ...current.sections[key], ...patch },
      },
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
          module: "legal",
          key: "page-content",
          title: "Legal Page",
          status: "PUBLISHED",
          data: content,
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (!response.ok) {
        push(result.error || "Save failed", "error");
        return;
      }
      await syncPageCoverPlacement({
        key: "page.legal.hero",
        label: "Legal Page Hero",
        cover: {
          src: content.cover.src,
          alt: content.cover.alt,
          assetId: content.cover.assetId,
        },
      });
      setSaved(clone(content));
      setDirty(false);
      push(result.message || "Saved Successfully · Published", "success");
    } catch {
      push("Network Error — could not save the legal page.", "error");
    } finally {
      setSaving(false);
    }
  }

  const coverValue: PageCoverValue = {
    src: content.cover.src,
    alt: content.cover.alt,
    assetId: content.cover.assetId,
    eyebrow: content.cover.eyebrow,
    title: content.cover.title,
    description: content.cover.description,
  };

  return (
    <div className="flex min-h-[calc(100svh-5rem)] flex-col bg-[#f6f7f4]">
      <header className="flex flex-col gap-4 border-b border-[#17362b]/10 bg-white px-6 py-5 sm:flex-row sm:items-center sm:justify-between xl:px-10">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[#a67a30] uppercase">
            Orbit · Website
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#10251e] xl:text-4xl">
            Legal
          </h1>
          <p className="mt-1 text-sm text-[#62716b]">
            Cover and every policy section shown on the public Legal page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/legal"
            target="_blank"
            className="flex h-11 items-center gap-2 rounded-xl border border-[#17362b]/12 bg-white px-4 text-[10px] font-semibold tracking-[0.14em] uppercase"
          >
            Live preview
          </Link>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => {
              setContent(clone(saved));
              setDirty(false);
            }}
            className="h-11 rounded-xl border border-[#17362b]/12 px-4 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={() => void save()}
            className="orbit-gold-button flex h-11 items-center gap-2 rounded-xl px-5 text-[10px] font-semibold tracking-[0.14em] uppercase disabled:opacity-50"
          >
            {saving ? (
              "Saving…"
            ) : dirty ? (
              <>
                <Save className="size-4" /> Save & Publish
              </>
            ) : (
              <>
                <Check className="size-4" /> Saved
              </>
            )}
          </button>
        </div>
      </header>

      <div className="orbit-scrollbar flex-1 overflow-y-auto px-4 py-8 sm:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          <PageCoverEditor
            label="Legal Cover"
            value={coverValue}
            onChange={updateCover}
          />

          {SECTION_META.map(({ key, label }) => (
            <section
              key={key}
              className="overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-sm"
            >
              <div className="border-b border-[#17362b]/8 px-5 py-4">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
                  {label}
                </p>
              </div>
              <div className="space-y-4 p-5">
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
                    Heading
                  </span>
                  <input
                    value={content.sections[key].heading}
                    onChange={(event) =>
                      updateSection(key, { heading: event.target.value })
                    }
                    className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
                    Body (leave a blank line between paragraphs)
                  </span>
                  <textarea
                    rows={10}
                    value={content.sections[key].body}
                    onChange={(event) =>
                      updateSection(key, { body: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm leading-relaxed"
                  />
                </label>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
