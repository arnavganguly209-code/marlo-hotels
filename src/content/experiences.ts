import type { Experience } from "@/types/content";
import { getDb } from "@/lib/db";

const experiences: Experience[] = [
  {
    slug: "sunrise-himalaya-flight",
    title: "Sunrise Himalaya Flight",
    category: "Adventure",
    duration: "3 hours",
    shortDescription: "A private mountain flight past Everest at first light, with champagne breakfast on return.",
    description:
      "Depart before dawn for the most celebrated hour in aviation — a private flight along the Himalayan range as sunrise gilds Everest, Lhotse and Ama Dablam. Our concierge arranges window seating for every guest, and a champagne breakfast awaits on the Terrace upon your return.",
    highlights: ["Private charter with guaranteed window seats", "Everest, Lhotse & Ama Dablam views", "Champagne breakfast on return", "Flight certificate & keepsake photography"],
    image: { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1600&auto=format&fit=crop", alt: "Himalayan peaks at sunrise" },
  },
  {
    slug: "kathmandu-heritage-walk",
    title: "Seven Centuries Walk",
    category: "Culture",
    duration: "4 hours",
    shortDescription: "A historian-led walk through Kathmandu's palace squares, hidden courtyards and living temples.",
    description:
      "With a royal-court historian as your guide, trace seven centuries through Durbar Square's palaces, the hidden bahals known only to locals, and workshops where the city's craft dynasties still work. The walk ends with butter tea in a restored Rana-era mansion.",
    highlights: ["Private historian guide", "UNESCO palace squares & hidden courtyards", "Living craft workshop visits", "Butter tea in a Rana-era mansion"],
    image: { src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop", alt: "Ancient temple architecture in Kathmandu" },
  },
  {
    slug: "private-momo-masterclass",
    title: "Momo Masterclass with Chef Kiran",
    category: "Private",
    duration: "2.5 hours",
    shortDescription: "Fold, steam and feast with our executive chef in Amaya's private kitchen.",
    description:
      "Join Chef Kiran Rana in Amaya's private kitchen to master Nepal's most beloved dish — from milling the timur-chilli achar to the twelve-pleat fold. The class ends around the chef's table with your creations, paired wines and stories from the mountain kitchens.",
    highlights: ["Private session with the executive chef", "Market visit for spices, on request", "Chef's table lunch with wine pairing", "Marlo apron & recipe folio to keep"],
    image: { src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1600&auto=format&fit=crop", alt: "Hands at work in a professional kitchen" },
  },
  {
    slug: "nagarkot-sunset-drive",
    title: "Nagarkot Sunset Drive",
    category: "Adventure",
    duration: "6 hours",
    shortDescription: "A chauffeured drive to the valley rim for sunset over the high Himalaya, with a private picnic.",
    description:
      "Leave the city behind for the pine ridges of Nagarkot, where the Himalayan panorama unfolds from Annapurna to Everest on clear evenings. Our team sets a private picnic of Amaya's making at a secluded viewpoint as the range turns rose and gold.",
    highlights: ["Private chauffeured Land Cruiser", "Secluded ridge-top picnic by Amaya", "Sunset over the high Himalaya", "Blankets, lanterns & warm rum punch"],
    image: { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop", alt: "Sunset over mountain ridges" },
  },
  {
    slug: "morning-with-the-monks",
    title: "Morning with the Monks",
    category: "Wellness",
    duration: "5 hours",
    shortDescription: "Dawn prayers at a hillside monastery, followed by a private meditation with a senior lama.",
    description:
      "Arrive at a hillside monastery as the first horns sound and butter lamps are lit. After observing morning prayers, sit with a senior lama for a private meditation and conversation on mindfulness, closed with tea in the monastery garden overlooking the valley.",
    highlights: ["Dawn prayer ceremony access", "Private meditation with a senior lama", "Monastery garden tea ceremony", "Optional prayer-flag blessing"],
    image: { src: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=1600&auto=format&fit=crop", alt: "Monastery at dawn with prayer flags" },
  },
  {
    slug: "artisan-gold-atelier",
    title: "The Goldsmith's Atelier",
    category: "Culture",
    duration: "3 hours",
    shortDescription: "A private visit to a family atelier where Kathmandu's finest filigree has been made for nine generations.",
    description:
      "Behind an unmarked door in the old city, one family has worked gold filigree for nine generations. Watch masters at the bench, learn the language of Newari ornament, and — should you wish — commission a piece of your own over tea with the family patriarch.",
    highlights: ["Nine-generation family atelier", "Live filigree demonstration", "Private commission consultation", "Tea with the master goldsmith"],
    image: { src: "https://images.unsplash.com/photo-1524230572899-a752b3835840?q=80&w=1600&auto=format&fit=crop", alt: "Artisan detail work in warm light" },
  },
];

export async function getExperiences(): Promise<Experience[]> {
  const db = getDb();
  if (db) {
    try {
      const entries = await db.contentEntry.findMany({
        where: { module: "experiences", status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
      });
      if (entries.length) {
        return entries.map((entry) => {
          const data = entry.data as Record<string, unknown>;
          const text = (key: string, fallback = "") =>
            typeof data[key] === "string" ? String(data[key]) : fallback;
          const category = text("category", "Private") as Experience["category"];
          const description = text("description")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          return {
            slug: entry.slug ?? entry.key,
            title: entry.title,
            category,
            duration: text("duration", "By arrangement"),
            shortDescription: description.slice(0, 220),
            description,
            highlights: text("highlights")
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
            image: {
              src: text("imageUrl", "/images/brand/hero-reference.png"),
              alt: text("imageAlt", entry.title),
            },
          };
        });
      }
    } catch {
      // Static experiences bootstrap the site before CMS publication.
    }
  }
  return experiences;
}

export async function getExperienceBySlug(slug: string): Promise<Experience | undefined> {
  return (await getExperiences()).find((experience) => experience.slug === slug);
}
