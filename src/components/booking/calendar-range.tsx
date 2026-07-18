"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

type CalendarRangeProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameDay(a: Date | null, b: Date | null) {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Days for a month grid, Monday-first, padded with nulls. */
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

function MonthGrid({
  month,
  value,
  today,
  onSelect,
}: {
  month: Date;
  value: DateRange;
  today: Date;
  onSelect: (date: Date) => void;
}) {
  return (
    <div className="w-full">
      <p className="font-display text-center text-lg font-medium text-forest-950">
        {monthLabel(month)}
      </p>
      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((weekday) => (
          <span
            key={weekday}
            className="pb-2 text-[9px] font-medium tracking-[0.2em] text-charcoal-900/45 uppercase"
          >
            {weekday}
          </span>
        ))}
        {monthDays(month).map((day, index) => {
          if (!day) return <span key={`pad-${index}`} />;

          const disabled = day < today;
          const isFrom = isSameDay(day, value.from);
          const isTo = isSameDay(day, value.to);
          const inRange =
            !!value.from && !!value.to && day > value.from && day < value.to;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              aria-label={day.toDateString()}
              aria-pressed={isFrom || isTo}
              className={cn(
                "mx-auto grid size-9 place-items-center rounded-full text-sm font-light transition-all duration-300",
                disabled && "cursor-not-allowed text-charcoal-900/25",
                !disabled &&
                  !isFrom &&
                  !isTo &&
                  !inRange &&
                  "text-forest-950 hover:bg-gold-100",
                inRange && "rounded-none bg-gold-100 text-forest-950",
                (isFrom || isTo) &&
                  "bg-forest-900 text-gold-300 shadow-luxury-sm"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarRange({ value, onChange }: CalendarRangeProps) {
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  function onSelect(day: Date) {
    if (!value.from || (value.from && value.to)) {
      onChange({ from: day, to: null });
    } else if (day > value.from) {
      onChange({ from: value.from, to: day });
    } else {
      onChange({ from: day, to: null });
    }
  }

  const atCurrentMonth =
    viewMonth.getFullYear() === today.getFullYear() &&
    viewMonth.getMonth() === today.getMonth();

  return (
    <div className="rounded-xl border border-forest-800/10 bg-white p-6 shadow-luxury-sm md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewMonth((month) => addMonths(month, -1))}
          disabled={atCurrentMonth}
          aria-label="Previous month"
          className="grid size-9 place-items-center rounded-full border border-forest-800/15 text-forest-900 transition-colors hover:border-gold-500 hover:text-gold-600 disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-[10px] font-medium tracking-[0.3em] text-gold-600 uppercase">
          Select your dates
        </p>
        <button
          type="button"
          onClick={() => setViewMonth((month) => addMonths(month, 1))}
          aria-label="Next month"
          className="grid size-9 place-items-center rounded-full border border-forest-800/15 text-forest-900 transition-colors hover:border-gold-500 hover:text-gold-600"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <MonthGrid
          month={viewMonth}
          value={value}
          today={today}
          onSelect={onSelect}
        />
        <div className="hidden md:block">
          <MonthGrid
            month={addMonths(viewMonth, 1)}
            value={value}
            today={today}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}
