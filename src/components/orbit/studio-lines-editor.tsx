"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  TextField,
  VisualCardStack,
} from "@/components/orbit/visual-card-stack";
import { parseLines, parseTitledLines } from "@/lib/orbit/page-studio";

function titledToCards(value: string) {
  return parseTitledLines(value).map((item) => ({
    title: item.title,
    description: item.description,
  }));
}

function cardsToTitled(cards: Record<string, unknown>[]) {
  return cards
    .map((card) => {
      const title = String(card.title || "").trim();
      const description = String(card.description || "").trim();
      if (!title && !description) return "";
      return description ? `${title} | ${description}` : title;
    })
    .filter(Boolean)
    .join("\n");
}

function linesToCards(value: string) {
  return parseLines(value).map((title) => ({ title, description: "" }));
}

function cardsToLines(cards: Record<string, unknown>[]) {
  return cards
    .map((card) => String(card.title || "").trim())
    .filter(Boolean)
    .join("\n");
}

/** Easy card editor for Title | Description lists (treatments, offers, journeys). */
export function StudioItemsEditor({
  value,
  onChange,
  title = "Cards on this section",
  addLabel = "Add card",
  titleLabel = "Card title",
  descriptionLabel = "Card description",
}: {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  addLabel?: string;
  titleLabel?: string;
  descriptionLabel?: string;
}) {
  return (
    <VisualCardStack
      title={title}
      addLabel={addLabel}
      items={titledToCards(value)}
      blankItem={() => ({ title: "", description: "" })}
      onChange={(items) => onChange(cardsToTitled(items))}
      renderCard={(item, _index, update) => (
        <div className="space-y-4">
          <TextField
            label={titleLabel}
            value={String(item.title || "")}
            onChange={(next) => update({ ...item, title: next })}
          />
          <TextField
            label={descriptionLabel}
            value={String(item.description || "")}
            onChange={(next) => update({ ...item, description: next })}
            multiline
          />
        </div>
      )}
    />
  );
}

/** Easy list editor for single-line features (facility names, why labels). */
export function StudioFeaturesEditor({
  value,
  onChange,
  title = "List items",
  addLabel = "Add item",
}: {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  addLabel?: string;
}) {
  return (
    <VisualCardStack
      title={title}
      addLabel={addLabel}
      items={linesToCards(value)}
      blankItem={() => ({ title: "", description: "" })}
      onChange={(items) => onChange(cardsToLines(items))}
      renderCard={(item, _index, update) => (
        <TextField
          label="Label"
          value={String(item.title || "")}
          onChange={(next) => update({ ...item, title: next })}
        />
      )}
    />
  );
}

/** Hours rows as cards: Label | Hours */
export function StudioHoursEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <VisualCardStack
      title="Opening hours"
      addLabel="Add hours row"
      items={titledToCards(value)}
      blankItem={() => ({ title: "", description: "" })}
      onChange={(items) => onChange(cardsToTitled(items))}
      renderCard={(item, _index, update) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Label (e.g. Breakfast)"
            value={String(item.title || "")}
            onChange={(next) => update({ ...item, title: next })}
          />
          <TextField
            label="Hours (e.g. 7:00 AM – 10:30 AM)"
            value={String(item.description || "")}
            onChange={(next) => update({ ...item, description: next })}
          />
        </div>
      )}
    />
  );
}

/** Compact empty-state helper when no cards yet */
export function EmptyCardsHint({
  onAdd,
  label = "Add your first card",
}: {
  onAdd: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#17362b]/20 bg-white px-4 py-10 text-sm text-[#62716b]"
    >
      <Plus className="size-4" /> {label}
    </button>
  );
}

export function ClearAllHint({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (!window.confirm("Clear all cards in this section?")) return;
        onClear();
      }}
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.14em] text-red-700 uppercase"
    >
      <Trash2 className="size-3.5" /> Clear all cards
    </button>
  );
}
