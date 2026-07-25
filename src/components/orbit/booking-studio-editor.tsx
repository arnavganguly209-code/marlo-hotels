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
import type { BookingPageContent } from "@/lib/booking-page-content";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function BookingStudioEditor({
  initialContent,
}: {
  initialContent: BookingPageContent;
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

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/orbit/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "booking",
          key: "page-content",
          title: "Booking Page",
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
        key: "page.booking.hero",
        label: "Booking Page Hero",
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
      push("Network Error — could not save the booking page.", "error");
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
            Booking
          </h1>
          <p className="mt-1 text-sm text-[#62716b]">
            Cover and introduction shown at the top of the public Booking
            page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/booking"
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
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <div className="rounded-2xl border border-[#a67a30]/25 bg-[#fbf3e2] px-5 py-4 text-sm text-[#6a4c1c]">
            Room inventory is edited under Rooms. This page controls the
            Booking cover and introduction.
          </div>
          <PageCoverEditor
            label="Booking Cover"
            value={coverValue}
            onChange={updateCover}
          />
        </div>
      </div>
    </div>
  );
}
