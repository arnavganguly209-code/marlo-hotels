import type { Offer } from "@/types/content";
import { getDb } from "@/lib/db";

/** Live offers come only from Orbit inventory — no demo fallback cards. */
export async function getOffers(): Promise<Offer[]> {
  const db = getDb();
  if (db) {
    try {
      const entries = await db.contentEntry.findMany({
        where: { module: "offers", status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
      });
      const inventory = entries.filter((entry) => entry.key !== "page-studio");
      if (inventory.length) {
        return inventory.map((entry) => {
          const data = entry.data as Record<string, unknown>;
          const text = (key: string, fallback = "") =>
            typeof data[key] === "string" ? String(data[key]) : fallback;
          const type = text("type").toLowerCase();
          return {
            slug: entry.slug ?? entry.key,
            title: entry.title,
            category:
              type === "package"
                ? "Package"
                : type === "gift card"
                  ? "Gift Card"
                  : "Seasonal",
            tagline: text("subheading", entry.title),
            description: text("description")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim(),
            perks: text("benefits")
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
            validity: [text("validFrom"), text("validUntil")]
              .filter(Boolean)
              .join(" – "),
            code: text("code", "DIRECT"),
            discount: text("discount", ""),
            image: {
              src: text("imageUrl", ""),
              alt: text("imageAlt", entry.title),
            },
          };
        });
      }
    } catch {
      // Inventory bootstraps from Orbit.
    }
  }
  return [];
}

export async function getOfferBySlug(slug: string): Promise<Offer | undefined> {
  return (await getOffers()).find((offer) => offer.slug === slug);
}
