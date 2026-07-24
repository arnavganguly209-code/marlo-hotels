"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { withMediaCacheBust } from "@/lib/media-cache";
import type { EditableImage } from "@/lib/homepage-content";
import { cn } from "@/lib/utils";

/** Shared visual card shell used by Dining / Attractions / Offers editors. */
export function VisualCardStack({
  title,
  addLabel,
  items,
  onChange,
  blankItem,
  renderCard,
}: {
  title: string;
  addLabel: string;
  items: Record<string, unknown>[];
  onChange: (items: Record<string, unknown>[]) => void;
  blankItem: () => Record<string, unknown>;
  renderCard: (
    item: Record<string, unknown>,
    index: number,
    update: (next: Record<string, unknown>) => void
  ) => React.ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const dragIndex = useRef<number | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#4e6258] uppercase">
          {title}
        </p>
        <button
          type="button"
          onClick={() => {
            onChange([...items, blankItem()]);
            setOpenIndex(items.length);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#17362b]/12 bg-white px-4 py-2.5 text-[10px] font-semibold tracking-[0.14em] uppercase"
        >
          <Plus className="size-3.5" /> {addLabel}
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const name =
            String(item.name || item.title || item.heading || "") ||
            `${title} ${index + 1}`;
          const isOpen = openIndex === index;
          return (
            <article
              key={`${name}-${index}`}
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                const from = dragIndex.current;
                if (from === null || from === index) return;
                const next = [...items];
                const [moved] = next.splice(from, 1);
                next.splice(index, 0, moved);
                onChange(next);
                setOpenIndex(index);
                dragIndex.current = null;
              }}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white shadow-sm transition",
                isOpen ? "border-[#123429]/35" : "border-[#17362b]/10"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left"
              >
                <GripVertical className="size-4 shrink-0 text-[#8b9892]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[#243c32]">
                    Card {index + 1} · {name}
                  </span>
                </span>
                <span className="text-[9px] font-semibold tracking-[0.14em] text-[#8b9892] uppercase">
                  {isOpen ? "Collapse" : "Edit"}
                </span>
              </button>
              {isOpen ? (
                <div className="space-y-5 border-t border-[#17362b]/8 bg-[#fafaf7] p-5">
                  {renderCard(item, index, (next) =>
                    onChange(
                      items.map((current, itemIndex) =>
                        itemIndex === index ? next : current
                      )
                    )
                  )}
                  <div className="flex flex-wrap justify-end gap-2 border-t border-[#17362b]/8 pt-4">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        if (index === 0) return;
                        const next = [...items];
                        const [moved] = next.splice(index, 1);
                        next.splice(index - 1, 0, moved);
                        onChange(next);
                        setOpenIndex(index - 1);
                      }}
                      className="rounded-lg border border-[#17362b]/12 bg-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase disabled:opacity-35"
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      disabled={index >= items.length - 1}
                      onClick={() => {
                        if (index >= items.length - 1) return;
                        const next = [...items];
                        const [moved] = next.splice(index, 1);
                        next.splice(index + 1, 0, moved);
                        onChange(next);
                        setOpenIndex(index + 1);
                      }}
                      className="rounded-lg border border-[#17362b]/12 bg-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] uppercase disabled:opacity-35"
                    >
                      Move down
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(items.filter((_, itemIndex) => itemIndex !== index));
                        setOpenIndex(Math.max(0, index - 1));
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-semibold tracking-[0.12em] text-red-700 uppercase"
                    >
                      <Trash2 className="size-3.5" /> Delete Card
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function emptyEditableImage(alt = ""): EditableImage {
  return {
    assetId: null,
    src: "",
    alt,
    title: alt,
    focalX: 50,
    focalY: 50,
  };
}

export function fieldClass() {
  return "h-12 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 text-sm text-[#243c32] outline-none focus:border-[#c4943c]/50";
}

export function TextField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-semibold tracking-[0.2em] text-[#4e6258] uppercase">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="min-h-28 w-full rounded-xl border border-[#17362b]/12 bg-white px-4 py-3 text-sm text-[#243c32] outline-none focus:border-[#c4943c]/50"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass()}
        />
      )}
    </label>
  );
}

export function bustImage(src: string) {
  return src ? withMediaCacheBust(src) : "";
}
