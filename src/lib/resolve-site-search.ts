/**
 * Resolve header search queries to the best matching site page.
 * Client-safe — static keyword map only (no DB).
 */
const ROUTES: { href: string; terms: string[] }[] = [
  {
    href: "/rooms/suite-apartment",
    terms: ["suite apartment", "apartment suite", "suite"],
  },
  {
    href: "/rooms/premier-family-room",
    terms: ["premier family", "family premier"],
  },
  {
    href: "/rooms/premier-room",
    terms: ["premier room", "premier"],
  },
  {
    href: "/rooms/standard-family-room",
    terms: ["family room", "family"],
  },
  {
    href: "/rooms/standard-triple-room",
    terms: ["triple room", "triple"],
  },
  {
    href: "/rooms/standard-twin-room",
    terms: ["twin room", "twin"],
  },
  {
    href: "/rooms/standard-double-room",
    terms: ["double room", "double"],
  },
  {
    href: "/rooms",
    terms: ["rooms", "room", "suites", "suite", "stay", "accommodation", "bedroom"],
  },
  {
    href: "/dining/amaya",
    terms: ["amaya", "tasting", "fine dining"],
  },
  {
    href: "/dining/the-terrace",
    terms: ["terrace", "the terrace", "lunch", "pool deck"],
  },
  {
    href: "/dining/bar-1959",
    terms: ["bar 1959", "bar1959", "cocktail", "cocktails", "bar"],
  },
  {
    href: "/dining",
    terms: ["dining", "restaurant", "restaurants", "food", "dinner", "eat", "breakfast"],
  },
  {
    href: "/spa",
    terms: ["spa", "wellness", "massage", "singing bowl", "treatment", "relax"],
  },
  {
    href: "/experiences",
    terms: [
      "experiences",
      "experience",
      "tour",
      "tours",
      "activity",
      "activities",
      "heritage",
      "nagarkot",
      "flight",
      "momo",
    ],
  },
  {
    href: "/offers",
    terms: ["offers", "offer", "deal", "deals", "package", "packages", "promo", "discount"],
  },
  {
    href: "/gallery",
    terms: ["gallery", "photos", "photo", "images", "pictures"],
  },
  {
    href: "/about",
    terms: ["about", "marlo", "hotel", "story", "landmark"],
  },
  {
    href: "/blog",
    terms: ["blog", "journal", "article", "articles", "news"],
  },
  {
    href: "/contact",
    terms: ["contact", "phone", "email", "location", "address", "map", "reach"],
  },
  {
    href: "/booking",
    terms: ["booking", "book", "reserve", "reservation", "availability", "check in", "check-in"],
  },
  {
    href: "/legal",
    terms: ["legal", "privacy", "terms", "policy"],
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns the best matching path for a header search query. */
export function resolveSiteSearch(query: string): string {
  const q = normalize(query);
  if (!q) return "/rooms";

  // Exact / phrase match first (longer terms win via route order + length check).
  let best: { href: string; score: number } | null = null;

  for (const route of ROUTES) {
    for (const term of route.terms) {
      const t = normalize(term);
      if (!t) continue;
      if (q === t) return route.href;
      if (q.includes(t) || t.includes(q)) {
        const score = t.length + (q.includes(t) ? 10 : 0);
        if (!best || score > best.score) {
          best = { href: route.href, score };
        }
      }
    }
  }

  if (best) return best.href;

  // Fallback: rooms listing with the query so guests still land somewhere useful.
  return `/rooms?q=${encodeURIComponent(query.trim())}`;
}
