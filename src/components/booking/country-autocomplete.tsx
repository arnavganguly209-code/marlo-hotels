"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  filterCountriesByQuery,
  isKnownCountry,
  WORLD_COUNTRIES,
} from "@/lib/world-countries";

type CountryAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
};

export function CountryAutocomplete({
  value,
  onChange,
  required,
  className,
}: CountryAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useMemo(
    () => filterCountriesByQuery(value, 14),
    [value]
  );

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [value]);

  function selectCountry(country: string) {
    onChange(country);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        required={required}
        type="text"
        autoComplete="country-name"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder="Type to search — e.g. Ne for Nepal"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
            setOpen(true);
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlight((current) =>
              Math.min(current + 1, Math.max(0, suggestions.length - 1))
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlight((current) => Math.max(0, current - 1));
          } else if (event.key === "Enter" && open && suggestions[highlight]) {
            event.preventDefault();
            selectCountry(suggestions[highlight]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        onBlur={() => {
          // Soft-normalize exact matches on blur.
          const match = WORLD_COUNTRIES.find(
            (country) => country.toLowerCase() === value.trim().toLowerCase()
          );
          if (match && match !== value) onChange(match);
        }}
        className={className}
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-forest-800/15 bg-white py-1 shadow-luxury-sm"
        >
          {suggestions.map((country, index) => (
            <li key={country} role="option" aria-selected={index === highlight}>
              <button
                type="button"
                className={`block w-full px-4 py-2.5 text-left text-sm normal-case tracking-normal ${
                  index === highlight
                    ? "bg-cream-50 text-forest-950"
                    : "text-charcoal-900/80 hover:bg-cream-50"
                }`}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectCountry(country);
                }}
              >
                {country}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {value.trim() && !isKnownCountry(value) && open === false ? (
        <p className="mt-1.5 text-[11px] normal-case tracking-normal text-charcoal-900/45">
          Choose a country from the list for best results.
        </p>
      ) : null}
    </div>
  );
}
