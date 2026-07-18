"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type CounterFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  tone?: "light" | "dark";
};

export function CounterField({
  label,
  value,
  min,
  max,
  onChange,
  tone = "light",
}: CounterFieldProps) {
  const isLight = tone === "light";

  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={cn(
          "text-sm font-light tracking-wide",
          isLight ? "text-cream-100" : "text-forest-950"
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "flex items-center gap-3 border px-2 py-1",
          isLight ? "border-ivory/25" : "border-forest-800/25"
        )}
      >
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={cn(
            "grid size-7 place-items-center transition-colors disabled:opacity-30",
            isLight
              ? "text-cream-100 hover:text-gold-400"
              : "text-forest-900 hover:text-gold-600"
          )}
        >
          <Minus className="size-3.5" />
        </button>
        <span
          aria-live="polite"
          className={cn(
            "w-5 text-center text-sm tabular-nums",
            isLight ? "text-ivory" : "text-forest-950"
          )}
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className={cn(
            "grid size-7 place-items-center transition-colors disabled:opacity-30",
            isLight
              ? "text-cream-100 hover:text-gold-400"
              : "text-forest-900 hover:text-gold-600"
          )}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
