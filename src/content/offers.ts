import type { Offer } from "@/types/content";
import { getDb } from "@/lib/db";

const offers: Offer[] = [
  {
    slug: "suite-escape",
    title: "The Suite Escape",
    category: "Seasonal",
    tagline: "Third night on us, in any suite",
    description:
      "Settle into a Marlo suite for three nights and the third is with our compliments — along with daily breakfast at The Terrace and a twilight spa ritual for two.",
    perks: [
      "Third night complimentary",
      "Daily breakfast for two",
      "60-minute couples' spa ritual",
      "Late check-out until 3:00 PM",
    ],
    validity: "Stays until 20 December 2026",
    code: "SUITE3",
    discount: "Save up to 33%",
    image: { src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1600&auto=format&fit=crop", alt: "Signature Suite living salon at dusk" },
  },
  {
    slug: "himalayan-honeymoon",
    title: "Himalayan Honeymoon",
    category: "Package",
    tagline: "Begin the story above the clouds",
    description:
      "A honeymoon composed by our concierge — champagne arrival, a private sunrise mountain-view breakfast, couples' spa journey and a candlelit dinner at Amaya.",
    perks: [
      "Champagne & rose turndown on arrival",
      "Private sunrise breakfast",
      "Couples' Twilight Ritual at Marlo Spa",
      "Five-course dinner at Amaya",
      "Room upgrade at arrival, subject to availability",
    ],
    validity: "Year-round, minimum 3 nights",
    code: "HONEYMOON",
    discount: "From $520 per night",
    image: { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1600&auto=format&fit=crop", alt: "Romantic candlelit dinner setting" },
  },
  {
    slug: "wellness-reset",
    title: "The Wellness Reset",
    category: "Package",
    tagline: "Three days to return to yourself",
    description:
      "A restorative programme pairing the Wellness Pool Room with daily spa treatments, sunrise yoga, and a nourishing menu designed with Amaya's kitchen.",
    perks: [
      "Daily 60-minute spa treatment",
      "Sunrise yoga on the pool deck",
      "Wellness tasting menu each evening",
      "Unlimited thermal circuit access",
      "Personal wellness consultation",
    ],
    validity: "Stays until 30 November 2026",
    code: "RESET",
    discount: "From $460 per night",
    image: { src: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1600&auto=format&fit=crop", alt: "Spa treatment in progress" },
  },
  {
    slug: "festive-season",
    title: "Festive Season at Marlo",
    category: "Seasonal",
    tagline: "December, dressed in gold and pine",
    description:
      "Celebrate the festive weeks with gala dinners, carol evenings by the lobby fire, and a New Year's Eve celebration above the city lights.",
    perks: [
      "Festive gala dinner for two",
      "Daily festive afternoon tea",
      "New Year's Eve celebration access",
      "Children's festive atelier",
    ],
    validity: "20 December 2026 – 2 January 2027",
    code: "FESTIVE26",
    discount: "From $390 per night",
    image: { src: "https://images.unsplash.com/photo-1482275548304-a58859dc31b7?q=80&w=1600&auto=format&fit=crop", alt: "Festive table setting with candles" },
  },
  {
    slug: "gift-of-marlo",
    title: "The Gift of Marlo",
    category: "Gift Card",
    tagline: "Give a night, a dinner, a ritual",
    description:
      "Marlo gift cards can be composed for any value and redeemed across stays, dining at all three venues, and every ritual at Marlo Spa. Presented in a linen envelope with wax seal.",
    perks: [
      "Redeemable across the entire hotel",
      "Valid for 24 months",
      "Presented in signature linen packaging",
      "Complimentary personal message in calligraphy",
    ],
    validity: "Valid 24 months from purchase",
    code: "GIFT",
    discount: "From $100",
    image: { src: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1600&auto=format&fit=crop", alt: "Elegant gift wrapped in linen" },
  },
  {
    slug: "advance-purchase",
    title: "Plan Ahead, Stay Better",
    category: "Seasonal",
    tagline: "Our best available rate, 30 days out",
    description:
      "Reserve at least thirty days before arrival and enjoy our most considered rate, with breakfast included and a welcome ritual at the spa.",
    perks: [
      "Up to 20% off flexible rates",
      "Daily breakfast for two",
      "Welcome foot ritual at Marlo Spa",
    ],
    validity: "Book 30+ days ahead, year-round",
    code: "ADVANCE30",
    discount: "Save 20%",
    image: { src: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1600&auto=format&fit=crop", alt: "Resort pool and architecture in morning light" },
  },
];

export async function getOffers(): Promise<Offer[]> {
  const db = getDb();
  if (db) {
    try {
      const entries = await db.contentEntry.findMany({
        where: { module: "offers", status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
      });
      if (entries.length) {
        return entries.map((entry) => {
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
            discount: text("discount", "Exclusive rate"),
            image: {
              src: text("imageUrl", "/images/brand/hero-reference.png"),
              alt: text("imageAlt", entry.title),
            },
          };
        });
      }
    } catch {
      // Static offers bootstrap the site before CMS publication.
    }
  }
  return offers;
}

export async function getOfferBySlug(slug: string): Promise<Offer | undefined> {
  return (await getOffers()).find((offer) => offer.slug === slug);
}
