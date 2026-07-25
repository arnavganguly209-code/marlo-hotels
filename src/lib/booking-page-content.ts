import "server-only";

import { getDb } from "@/lib/db";

export type BookingPageContent = {
  cover: {
    src: string;
    alt: string;
    assetId: string | null;
    eyebrow: string;
    title: string;
    description: string;
  };
};

export function getBookingPageDefaults(): BookingPageContent {
  return {
    cover: {
      src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2400&auto=format&fit=crop",
      alt: "A Marlo room prepared for arrival",
      assetId: null,
      eyebrow: "Reservations",
      title: "Reserve your stay",
      description:
        "Direct bookings enjoy our best available rate — select dates, meal plan and room, then complete guest details and payment.",
    },
  };
}

function mergeBooking(
  base: BookingPageContent,
  patch: Partial<BookingPageContent> | null | undefined
): BookingPageContent {
  if (!patch) return base;
  return {
    cover: { ...base.cover, ...patch.cover },
  };
}

export async function getBookingPageContent(): Promise<BookingPageContent> {
  const defaults = getBookingPageDefaults();
  const db = getDb();
  if (!db) return defaults;
  try {
    const [entry, placement] = await Promise.all([
      db.contentEntry.findUnique({
        where: { module_key: { module: "booking", key: "page-content" } },
        select: { data: true },
      }),
      db.mediaPlacement.findUnique({
        where: { key: "page.booking.hero" },
        include: {
          asset: { select: { url: true, alt: true, deletedAt: true } },
        },
      }),
    ]);
    const merged = mergeBooking(
      defaults,
      entry?.data && typeof entry.data === "object"
        ? (entry.data as Partial<BookingPageContent>)
        : null
    );
    if (!merged.cover.assetId && placement?.asset && !placement.asset.deletedAt) {
      merged.cover.src = placement.asset.url;
      merged.cover.alt = merged.cover.alt || placement.asset.alt || "";
    }
    return merged;
  } catch {
    return defaults;
  }
}
