/** Page filters for Media Library — maps Orbit pages to folders + placement keys. */

export const SITE_PAGE_MEDIA_FILTERS = [
  {
    id: "homepage",
    label: "Homepage",
    folders: ["hero", "homepage"],
    keyPrefixes: ["home."],
  },
  {
    id: "rooms",
    label: "Rooms",
    folders: ["rooms"],
    keyPrefixes: ["page.rooms."],
  },
  {
    id: "dining",
    label: "Dining",
    folders: ["dining"],
    keyPrefixes: ["page.dining."],
  },
  {
    id: "spa",
    label: "Spa",
    folders: ["spa"],
    keyPrefixes: ["page.spa."],
  },
  {
    id: "gallery",
    label: "Gallery",
    folders: ["gallery"],
    keyPrefixes: ["page.gallery."],
  },
  {
    id: "experiences",
    label: "Experiences",
    folders: ["experiences"],
    keyPrefixes: ["page.experiences."],
  },
  {
    id: "offers",
    label: "Offers",
    folders: ["offers"],
    keyPrefixes: ["page.offers."],
  },
  {
    id: "booking",
    label: "Booking",
    folders: ["booking"],
    keyPrefixes: ["page.booking."],
  },
  {
    id: "contact",
    label: "Contact",
    folders: ["contact"],
    keyPrefixes: ["page.contact."],
  },
  {
    id: "blog",
    label: "Blog",
    folders: ["blog"],
    keyPrefixes: ["page.blog."],
  },
  {
    id: "legal",
    label: "Legal",
    folders: ["legal"],
    keyPrefixes: ["page.legal."],
  },
  {
    id: "brand",
    label: "Brand & Payments",
    folders: ["payments", "brand"],
    keyPrefixes: ["brand."],
  },
] as const;

export type SitePageMediaFilterId =
  | (typeof SITE_PAGE_MEDIA_FILTERS)[number]["id"]
  | "all";

export function getSitePageFilter(id: string | null | undefined) {
  if (!id || id === "all") return null;
  return SITE_PAGE_MEDIA_FILTERS.find((item) => item.id === id) ?? null;
}
