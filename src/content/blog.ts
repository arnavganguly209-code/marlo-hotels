import type { Post } from "@/types/content";
import { getDb } from "@/lib/db";

const posts: Post[] = [
  {
    slug: "a-perfect-72-hours-in-kathmandu",
    title: "A Perfect 72 Hours in Kathmandu",
    excerpt:
      "Palace squares at dawn, hidden courtyard cafés, and where to watch the valley turn gold — our concierge team's definitive three-day itinerary.",
    category: "Destination",
    date: "2026-06-28",
    readingTime: "8 min read",
    author: { name: "Priya Maharjan", role: "Head Concierge" },
    image: { src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1600&auto=format&fit=crop", alt: "Temple rooftops of Kathmandu at golden hour" },
    tags: ["Kathmandu", "Itinerary", "Culture"],
    content: [
      {
        paragraphs: [
          "Kathmandu rewards the traveller who rises early. By six, the palace squares belong to pigeons, priests and the smell of butter lamps; by ten they belong to everyone. Our concierge desk has spent years refining the perfect three days in the valley — this is the itinerary we give our most curious guests.",
        ],
      },
      {
        heading: "Day One: The Old Kingdom",
        paragraphs: [
          "Begin at Durbar Square before the city wakes, when the seventeenth-century palaces catch the first light. Walk north through Asan's spice market as it opens — the valley's oldest trading street, unchanged in its rhythms for centuries.",
          "Lunch should be momos, and the debate over the city's best is eternal. In the evening, return to the hotel for the tasting menu at Amaya; after three days you will understand why we ask you to book it for the first night rather than the last — it becomes the lens through which you taste the rest of the city.",
        ],
      },
      {
        heading: "Day Two: Above the Valley",
        paragraphs: [
          "If the season is right, take the sunrise mountain flight — an hour that recalibrates your sense of scale permanently. Spend the afternoon in Patan, the city of artisans, where bronze casters still work by lost-wax methods older than the temples they furnish.",
          "End the day at Swayambhunath as the light softens, when the whole valley spreads below the stupa's painted eyes.",
        ],
      },
      {
        heading: "Day Three: The Slow Morning",
        paragraphs: [
          "Keep the final day unhurried. Sunrise yoga on the pool deck, a long breakfast at The Terrace, and a last walk through the neighbourhood's hidden bahals — the courtyard sanctuaries most visitors never find. Ask the concierge desk for our hand-drawn map; we made it precisely for this morning.",
        ],
      },
    ],
  },
  {
    slug: "the-craft-behind-marlo-suites",
    title: "The Craft Behind the Marlo Suites",
    excerpt:
      "Nine months, forty artisans, and three centuries of Newari woodcarving tradition — the story of how our suites were made.",
    category: "Design",
    date: "2026-05-16",
    readingTime: "6 min read",
    author: { name: "Arjun Malla", role: "Creative Director" },
    image: { src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1600&auto=format&fit=crop", alt: "Handcrafted interior detail of a Marlo suite" },
    tags: ["Design", "Craft", "Suites"],
    content: [
      {
        paragraphs: [
          "When we began designing the Royal Heritage Suite, we made a decision that shaped everything after it: nothing ornamental would be manufactured. If a screen was to be carved, it would be carved by hand, in the valley, by the families who have always carved.",
        ],
      },
      {
        heading: "Bhaktapur's Master Carvers",
        paragraphs: [
          "The timber screens that filter the morning light in the Heritage Suite took a Bhaktapur workshop nine months. Each panel follows a classical lattice pattern — but look closely and you will find small deviations, the signature every master leaves inside the rules.",
          "Working alongside them, our Milanese furniture makers learned to leave those imperfections alone. The suite's beauty lives in that conversation between precision and hand.",
        ],
      },
      {
        heading: "A Palette from the Landscape",
        paragraphs: [
          "The colours guests notice throughout Marlo — deep forest green, warm cream, aged gold — were drawn from the valley itself: pine ridges after rain, river stone, the gilded roofs of the old city. Luxury, we believe, should feel like it grew from its place.",
        ],
      },
    ],
  },
  {
    slug: "inside-amayas-tasting-menu",
    title: "Inside Amaya's Seven-Course Tasting Menu",
    excerpt:
      "Chef Kiran Rana on foraged timur, high-altitude wine, and why the Himalayan larder belongs on the world's fine-dining map.",
    category: "Dining",
    date: "2026-04-09",
    readingTime: "7 min read",
    author: { name: "Chef Kiran Rana", role: "Executive Chef" },
    image: { src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1600&auto=format&fit=crop", alt: "A course from Amaya's tasting menu" },
    tags: ["Dining", "Amaya", "Chef"],
    content: [
      {
        paragraphs: [
          "People ask me what Himalayan fine dining means, and I tell them: it means taking the ingredients my grandmother treated as ordinary and giving them the technique they always deserved.",
        ],
      },
      {
        heading: "The Larder at Altitude",
        paragraphs: [
          "Timur — our wild mountain pepper — numbs and perfumes at once; there is nothing like it in the French repertoire I trained in. Gundruk, our fermented greens, carries the depth chefs chase with miso. The tasting menu at Amaya is built course by course around these encounters.",
          "Every morning our forager drives the valley rim. What returns in her baskets decides the evening's menu more than I do.",
        ],
      },
      {
        heading: "Wine at the Roof of the World",
        paragraphs: [
          "Our sommelier has assembled something quietly radical: Burgundy and Barolo beside pioneering high-altitude Himalayan vineyards. Guests arrive skeptical of the local pours and leave with bottles in their luggage. That conversion, more than any review, tells me the menu works.",
        ],
      },
    ],
  },
  {
    slug: "the-art-of-slow-mornings",
    title: "The Art of Slow Mornings",
    excerpt:
      "Our spa director on sunrise rituals, mountain light, and building a morning that belongs entirely to you.",
    category: "Wellness",
    date: "2026-03-02",
    readingTime: "5 min read",
    author: { name: "Dr. Sarita Joshi", role: "Spa & Wellness Director" },
    image: { src: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop", alt: "Morning spa ritual with flowers and stones" },
    tags: ["Wellness", "Spa", "Rituals"],
    content: [
      {
        paragraphs: [
          "The most valuable thing we offer at Marlo Spa is not a treatment. It is permission — permission to let a morning unfold without a single obligation in it.",
        ],
      },
      {
        heading: "Begin Before the Day Does",
        paragraphs: [
          "Sunrise yoga on the pool deck is deliberately short — forty minutes, mostly breath. The mountains do the rest. Afterwards, guests tell me the infinity pool feels different; they are not swimming laps, they are swimming in a landscape.",
          "Follow it with the thermal circuit while it is quiet: salt steam, cedar sauna, and the cold plunge that our returning guests describe as the best decision of their trip, always in those words, always after protesting first.",
        ],
      },
      {
        heading: "The Ritual of Nothing",
        paragraphs: [
          "End in the relaxation lounge with valley views and an herbal infusion. No phone, no book, twenty minutes. In nine years of practice I have prescribed nothing more effective.",
        ],
      },
    ],
  },
  {
    slug: "weddings-above-the-valley",
    title: "Weddings Above the Valley",
    excerpt:
      "From intimate terrace vows to three-day celebrations — how our events atelier composes a Marlo wedding.",
    category: "Events",
    date: "2026-02-14",
    readingTime: "6 min read",
    author: { name: "Meera Thapa", role: "Director of Events" },
    image: { src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop", alt: "Elegant wedding reception with warm lighting" },
    tags: ["Weddings", "Events", "Celebrations"],
    content: [
      {
        paragraphs: [
          "Every Marlo wedding begins the same way: a long conversation about the two of you, before a single flower or menu is discussed. The celebration should be recognisably yours — we simply give it a stage above the valley.",
        ],
      },
      {
        heading: "The Stages",
        paragraphs: [
          "The Terrace hosts vows for up to eighty as the sun sets behind the hills. The Amaya private dining room holds candlelit dinners for twenty. And for grand celebrations, the ballroom opens onto the gardens for three hundred guests under chandeliers and marigold garlands.",
          "For multi-day Nepali and fusion weddings, our atelier choreographs everything from the mehndi afternoon to the baraat's arrival — with Chef Kiran composing menus that honour both families' tables.",
        ],
      },
      {
        heading: "Begin the Conversation",
        paragraphs: [
          "We host a limited number of weddings each season, deliberately. Write to our events atelier and we will begin with that first long conversation — ideally over tea on the terrace where it may all take place.",
        ],
      },
    ],
  },
];

export async function getPosts(): Promise<Post[]> {
  const db = getDb();
  if (db) {
    try {
      const entries = await db.contentEntry.findMany({
        where: { module: "blog", status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
      });
      if (entries.length) {
        return entries
          .filter((entry) => entry.key !== "blog-settings")
          .map((entry) => {
            const data = entry.data as Record<string, unknown>;
            const text = (key: string, fallback = "") =>
              typeof data[key] === "string" ? String(data[key]) : fallback;
            const html =
              text("html") ||
              text("content") ||
              (typeof data.content === "string" ? String(data.content) : "");
            const hasHtml = html.includes("<") && html.includes(">");
            const structured = Array.isArray(data.content)
              ? (data.content as { heading?: string; paragraphs?: string[] }[])
              : null;

            const content = structured?.length
              ? structured.map((section) => ({
                  heading: section.heading,
                  paragraphs: section.paragraphs ?? [],
                }))
              : hasHtml
                ? []
                : html
                  ? [
                      {
                        paragraphs: [
                          html
                            .replace(/<\/(p|h2|li)>/gi, "\n")
                            .replace(/<[^>]+>/g, "")
                            .trim(),
                        ],
                      },
                    ]
                  : [{ paragraphs: [text("excerpt", entry.title)] }];

            const tagsRaw = data.tags;
            const tags = Array.isArray(tagsRaw)
              ? (tagsRaw as string[]).filter(Boolean)
              : text("tags")
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean);

            return {
              slug: entry.slug ?? entry.key,
              title: entry.title,
              excerpt: text("excerpt", entry.title),
              category: text("category", "Journal"),
              date:
                text("publishDate") ||
                (entry.publishedAt ?? entry.updatedAt)
                  .toISOString()
                  .slice(0, 10),
              readingTime: text("readingTime", "5 min read"),
              author: {
                name: text("authorName") || text("author", "Marlo Hotels"),
                role: text("authorRole", "Contributor"),
              },
              image: {
                src:
                  text("coverUrl") ||
                  text("imageUrl", "/images/brand/hero-reference.png"),
                alt:
                  text("coverAlt") || text("imageAlt", entry.title),
              },
              content,
              htmlBody: hasHtml ? html : undefined,
              tags,
            };
          });
      }
    } catch {
      // Static editorial content bootstraps the site before CMS publication.
    }
  }
  return [...posts].sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((post) => post.slug === slug);
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<Post[]> {
  return (await getPosts()).filter((post) => post.slug !== slug).slice(0, limit);
}

export async function getPostCategories(): Promise<string[]> {
  return [...new Set((await getPosts()).map((post) => post.category))];
}
