/** Default high-intent + location SEO keywords for Marlo Hotels (Kathmandu). */
export const DEFAULT_SITE_KEYWORDS: string[] = [
  // Primary / high-intent
  "luxury hotel in Kathmandu",
  "luxury hotel Kathmandu Nepal",
  "luxury hotel in Thamel Kathmandu",
  "best luxury hotel in Kathmandu",
  "5 star hotel Kathmandu",
  "boutique hotel Kathmandu",
  "luxury accommodation Kathmandu",
  "hotel in Thamel Kathmandu",
  "best hotel in Thamel",
  "hotels in Kathmandu Nepal",
  // Location
  "hotel near Thamel Kathmandu",
  "hotel near Kathmandu Durbar Square",
  "hotel near Garden of Dreams Kathmandu",
  "hotel near Paryatan Marg Kathmandu",
  "hotel near Kathmandu tourist attractions",
  "hotel in central Kathmandu",
  // Brand / supporting
  "Marlo Hotels",
  "luxury suites Kathmandu",
  "hotel spa Nepal",
];

/** Parse comma / newline separated keywords into a clean unique list. */
export function parseKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .map((item) => String(item ?? "").trim())
          .filter(Boolean)
      ),
    ];
  }
  if (typeof value !== "string" || !value.trim()) return [];
  return [
    ...new Set(
      value
        .split(/[\n,]+/)
        .map((part) => part.trim())
        .filter(Boolean)
    ),
  ];
}

export function keywordsToTextarea(keywords: string[]): string {
  return keywords.join("\n");
}
