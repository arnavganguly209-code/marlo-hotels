"use client";

import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { MediaField } from "@/components/orbit/media-picker";
import { withMediaCacheBust } from "@/lib/media-cache";
import { cn } from "@/lib/utils";

export type PageCoverValue = {
  src: string;
  alt: string;
  assetId?: string | null;
  title?: string;
  description?: string;
  eyebrow?: string;
};

/**
 * Large page-cover editor used across Orbit page studios.
 * Supports preview / replace / upload / permanent delete + optional copy fields.
 */
export function PageCoverEditor({
  label = "Page Cover",
  value,
  onChange,
  showCopy = true,
  className,
}: {
  label?: string;
  value: PageCoverValue;
  onChange: (next: PageCoverValue) => void;
  showCopy?: boolean;
  className?: string;
}) {
  const [deleting, setDeleting] = useState(false);

  async function hardDelete() {
    if (!window.confirm("Delete permanently?")) return;
    setDeleting(true);
    const assetId = value.assetId;
    onChange({
      ...value,
      src: "",
      assetId: null,
    });
    if (assetId) {
      await fetch(`/api/orbit/media/${assetId}?hard=1`, {
        method: "DELETE",
      }).catch(() => undefined);
    }
    setDeleting(false);
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-sm",
        className
      )}
    >
      <div className="border-b border-[#17362b]/8 px-5 py-4">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm text-[#62716b]">
          This is the cover guests see at the top of the public page.
        </p>
      </div>

      <div className="relative aspect-[21/9] min-h-[220px] bg-[#e8ebe6]">
        {value.src ? (
          <Image
            key={value.src}
            src={value.src}
            alt={value.alt || "Page cover"}
            fill
            sizes="1200px"
            className="object-cover"
            unoptimized={value.src.startsWith("/media/")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#eef2ee] via-[#e4ebe5] to-[#d7e0d9] px-6 text-center">
            <ImageIcon className="size-10 text-[#7d8c84]" />
            <p className="text-sm font-semibold text-[#3d5248]">
              No cover image
            </p>
            <p className="text-xs text-[#6d7c74]">
              Upload or replace to show a live preview
            </p>
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <MediaField
          label="Replace or upload cover"
          kind="IMAGE"
          value={{
            assetId: value.assetId,
            url: value.src,
            alt: value.alt,
            kind: "IMAGE",
          }}
          onChange={(next) =>
            onChange({
              ...value,
              assetId: next.assetId,
              src: withMediaCacheBust(next.url),
              alt: next.alt || value.alt || "Page cover",
            })
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
              Image Alt Text
            </span>
            <input
              value={value.alt}
              onChange={(event) =>
                onChange({ ...value, alt: event.target.value })
              }
              className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              disabled={deleting || (!value.src && !value.assetId)}
              onClick={() => void hardDelete()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase disabled:opacity-40"
            >
              <Trash2 className="size-3.5" />
              {deleting ? "Deleting…" : "Delete Cover"}
            </button>
          </div>
        </div>

        {showCopy ? (
          <div className="grid gap-3 border-t border-[#17362b]/8 pt-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
                Eyebrow
              </span>
              <input
                value={value.eyebrow || ""}
                onChange={(event) =>
                  onChange({ ...value, eyebrow: event.target.value })
                }
                className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
                Heading
              </span>
              <input
                value={value.title || ""}
                onChange={(event) =>
                  onChange({ ...value, title: event.target.value })
                }
                className="h-11 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.16em] text-[#52665c] uppercase">
                Description
              </span>
              <textarea
                rows={3}
                value={value.description || ""}
                onChange={(event) =>
                  onChange({ ...value, description: event.target.value })
                }
                className="w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Persist a cover image to a named media placement (and clear when empty). */
export async function syncPageCoverPlacement(options: {
  key: string;
  label: string;
  cover: PageCoverValue;
}) {
  await fetch("/api/orbit/media/placements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: options.key,
      label: options.label,
      assetId: options.cover.assetId || null,
      mediaType: "IMAGE",
      alt: options.cover.alt || options.label,
    }),
  }).catch(() => undefined);
}
