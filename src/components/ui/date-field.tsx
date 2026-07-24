"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn, toISODateString } from "@/lib/utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseISODate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return startOfDay(new Date(y, m - 1, d));
}

function monthDays(month: Date): (Date | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const padding = (first.getDay() + 6) % 7;
  const total = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  return [
    ...Array.from({ length: padding }, () => null),
    ...Array.from(
      { length: total },
      (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)
    ),
  ];
}

function formatDisplay(value: string) {
  const date = parseISODate(value);
  if (!date) return "Select date";
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DateFieldProps = {
  id: string;
  label: ReactNode;
  value: string;
  min?: string;
  max?: string;
  required?: boolean;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  /** Dark glass (hero) or light surface (rooms) */
  tone?: "dark" | "light";
};

/**
 * Premium date field — calendar always opens downward via a body portal
 * so parent overflow never clips it.
 */
export function DateField({
  id,
  label,
  value,
  min,
  max,
  required,
  onChange,
  className,
  buttonClassName,
  tone = "dark",
}: DateFieldProps) {
  const dark = tone === "dark";
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const selected = parseISODate(value) || startOfDay(new Date());
  const [view, setView] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1)
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => setMounted(true), []);

  // Sync the visible month ONLY when the calendar opens — never while the
  // guest is browsing months (that was locking Previous/Next navigation).
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const date = parseISODate(value) || startOfDay(new Date());
      setView(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    wasOpenRef.current = open;
  }, [open, value]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPos(null);
      return;
    }
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.max(rect.width, 300);
      let left = rect.left;
      if (left + width > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - width - 12);
      }
      // Always open downward from the trigger.
      setPos({
        top: rect.bottom + 10,
        left,
        width,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const minDate = min ? parseISODate(min) : null;
  const maxDate = max ? parseISODate(max) : null;
  const today = startOfDay(new Date());

  const panel =
    mounted && open && pos
      ? createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Choose date"
            className={cn(
              "shadow-luxury fixed z-[9999] max-h-[min(360px,calc(100dvh-1.5rem))] overflow-y-auto rounded-xl border p-4 backdrop-blur-2xl",
              dark
                ? "border-white/10 bg-[rgb(10_24_20_/_0.96)]"
                : "border-forest-800/12 bg-white"
            )}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setView(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  );
                }}
                className={cn(
                  "grid size-9 place-items-center rounded-lg transition",
                  dark
                    ? "text-cream-200/80 hover:bg-white/10 hover:text-gold-400"
                    : "text-forest-800 hover:bg-forest-50 hover:text-gold-700"
                )}
              >
                <ChevronLeft className="size-4" />
              </button>
              <p
                className={cn(
                  "font-display text-base",
                  dark ? "text-ivory" : "text-forest-950"
                )}
              >
                {view.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setView(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  );
                }}
                className={cn(
                  "grid size-9 place-items-center rounded-lg transition",
                  dark
                    ? "text-cream-200/80 hover:bg-white/10 hover:text-gold-400"
                    : "text-forest-800 hover:bg-forest-50 hover:text-gold-700"
                )}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className={cn(
                    "pb-2 text-[9px] font-medium tracking-[0.2em] uppercase",
                    dark ? "text-cream-200/45" : "text-charcoal-900/45"
                  )}
                >
                  {day}
                </span>
              ))}
              {monthDays(view).map((day, index) => {
                if (!day) return <span key={`pad-${index}`} />;
                const iso = toISODateString(day);
                const disabled =
                  day < today ||
                  (!!minDate && day < minDate) ||
                  (!!maxDate && day > maxDate);
                const isSelected = iso === value;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    className={cn(
                      "mx-auto flex size-9 items-center justify-center rounded-full text-sm transition",
                      disabled &&
                        (dark
                          ? "cursor-not-allowed text-cream-200/25"
                          : "cursor-not-allowed text-charcoal-900/25"),
                      !disabled &&
                        !isSelected &&
                        (dark
                          ? "text-cream-200/85 hover:bg-gold-500/20 hover:text-gold-300"
                          : "text-forest-950 hover:bg-gold-500/15 hover:text-gold-700"),
                      isSelected &&
                        "bg-gold-500 font-medium text-charcoal-950"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="block">
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "mt-2.5 flex min-h-11 w-full items-center justify-between text-left text-sm font-light outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold-400/50",
          dark
            ? "border-b border-ivory/25 pb-2 text-ivory focus:border-gold-400"
            : "rounded-xl border border-forest-800/15 bg-white px-3 text-forest-950",
          buttonClassName
        )}
      >
        <span>{formatDisplay(value)}</span>
      </button>
      {/* Hidden input for form validation / accessibility */}
      <input
        type="hidden"
        name={id}
        value={value}
        required={required}
        readOnly
      />
      {panel}
    </div>
  );
}
