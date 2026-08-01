"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type CounterFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** light = on dark glass surfaces; dark = on white/cream cards */
  tone?: "light" | "dark";
};

export function CounterField({
  label,
  value,
  min,
  max,
  onChange,
  tone = "dark",
}: CounterFieldProps) {
  const isLight = tone === "light";

  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={cn(
          "text-sm font-semibold tracking-[0.04em]",
          isLight ? "text-[#F8F4EC]" : "text-forest-950"
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-2.5 py-1.5",
          isLight ? "border-white/35" : "border-forest-800/25 bg-cream-50/80"
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
              ? "text-[#F8F4EC] hover:text-gold-400"
              : "text-forest-950 hover:text-gold-700"
          )}
        >
          <Minus className="size-3.5 stroke-[2.5]" />
        </button>
        <span
          aria-live="polite"
          className={cn(
            "w-6 text-center text-sm font-semibold tabular-nums",
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
              ? "text-[#F8F4EC] hover:text-gold-400"
              : "text-forest-950 hover:text-gold-700"
          )}
        >
          <Plus className="size-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
