import type { Restaurant } from "@/types/content";
import { getDb } from "@/lib/db";

const restaurants: Restaurant[] = [
  {
    slug: "amaya",
    name: "Amaya",
    cuisine: "Contemporary Himalayan",
    tagline: "The valley's harvest, told as fine dining",
    shortDescription:
      "Our signature restaurant reimagines the Himalayan larder through a contemporary tasting menu, served beneath a hand-beaten brass ceiling.",
    description: [
      "Amaya is Marlo's culinary flagship — a dining room of forest-green velvet, candlelight and a ceiling of hand-beaten brass that glows like dusk. The kitchen works with farmers across the valley rim, building a menu that changes with the mountain seasons.",
      "Choose the seven-course tasting journey with Himalayan wine pairings, or dine à la carte from a menu where timur pepper, yak butter and wild river fish meet classical French technique.",
    ],
    hours: "Dinner 6:30 PM – 10:30 PM, closed Mondays",
    dressCode: "Smart elegant",
    location: "Lobby level, garden wing",
    images: [
      { src: "", alt: "Amaya dining room at night" },
      { src: "", alt: "Signature tasting course at Amaya" },
      { src: "", alt: "Candlelit tables at Amaya" },
    ],
    chef: {
      name: "Chef Kiran Rana",
      title: "Executive Chef",
      bio: "Trained in Lyon and seasoned in the kitchens of Singapore and Copenhagen, Chef Kiran returned home to cook the food of his childhood with the precision of the world's great restaurants. His tasting menu at Amaya has been called a love letter to the Himalaya.",
      image: { src: "", alt: "Chef Kiran Rana plating a dish" },
    },
    menu: [
      {
        title: "To Begin",
        items: [
          { name: "Smoked River Trout", description: "Timur pepper crème fraîche, pickled fiddlehead, buckwheat crisp", price: "$18" },
          { name: "Heritage Tomato & Yak Cheese", description: "Aged chhurpi, basil oil, black salt meringue", price: "$16" },
          { name: "Wild Mushroom Momo", description: "Truffle jhol, brown butter, chive blossom", price: "$17" },
        ],
      },
      {
        title: "Mains",
        items: [
          { name: "Slow-Roasted Duck Breast", description: "Sichuan-timur glaze, parsnip silk, mustard greens", price: "$38" },
          { name: "Himalayan River Fish", description: "Gundruk beurre blanc, saffron potato, river herbs", price: "$34" },
          { name: "Charred Cauliflower Royale", description: "Cashew cream, curry leaf, puffed amaranth", price: "$26" },
        ],
      },
      {
        title: "To Finish",
        items: [
          { name: "Juju Dhau Crémeux", description: "Bhaktapur king yoghurt, honeycomb, sea buckthorn", price: "$14" },
          { name: "Valrhona & Sichuan Pepper", description: "70% dark chocolate, burnt orange, timur ice cream", price: "$15" },
        ],
      },
    ],
    wine: "A 400-bin cellar spanning Burgundy, Barolo and pioneering high-altitude Himalayan vineyards, curated by our head sommelier.",
  },
  {
    slug: "the-terrace",
    name: "The Terrace",
    cuisine: "All-Day Mediterranean",
    tagline: "Long lunches under the valley sky",
    shortDescription:
      "An open-air brasserie wrapped around the infinity pool, serving wood-fired Mediterranean fare from sunrise to sundown.",
    description: [
      "The Terrace is Marlo's daytime heart — breakfast as the mist lifts off the hills, wood-fired flatbreads by the pool at noon, and golden-hour aperitivo as the valley lights come on.",
      "The kitchen is built around a wood oven and charcoal grill, with produce delivered daily from our partner farms in the valley. Come barefoot from the pool or dressed for a long celebratory lunch; both are equally at home here.",
    ],
    hours: "Daily 6:30 AM – 6:00 PM",
    dressCode: "Resort casual",
    location: "Pool deck, level 3",
    images: [
      { src: "", alt: "The Terrace set for lunch" },
      { src: "", alt: "Mediterranean dishes at The Terrace" },
      { src: "", alt: "Poolside table at golden hour" },
    ],
    chef: {
      name: "Chef Elena Moretti",
      title: "Chef de Cuisine",
      bio: "Elena grew up between Puglia and the Amalfi coast, and brings the generosity of southern Italian cooking to the Himalayan foothills — handmade pasta, wood-fire vegetables and olive oil she still imports from her family's grove.",
      image: { src: "", alt: "Chef Elena Moretti in the kitchen" },
    },
    menu: [
      {
        title: "From the Garden",
        items: [
          { name: "Burrata & Grilled Peach", description: "Aged balsamic, basil, valley honey", price: "$15" },
          { name: "Fattoush of Mountain Greens", description: "Sumac, pomegranate, za'atar crisp", price: "$13" },
        ],
      },
      {
        title: "Wood Oven & Grill",
        items: [
          { name: "Flatbread Bianca", description: "Taleggio, wild mushroom, truffle oil", price: "$19" },
          { name: "Charcoal Chicken", description: "Harissa butter, preserved lemon, herb salad", price: "$27" },
          { name: "Whole Grilled Trout", description: "Salmoriglio, charred fennel, capers", price: "$29" },
        ],
      },
      {
        title: "Dolci",
        items: [
          { name: "Pistachio Semifreddo", description: "Amarena cherry, olive oil crumble", price: "$12" },
          { name: "Lemon Delizia", description: "Amalfi lemon cream, limoncello sponge", price: "$12" },
        ],
      },
    ],
  },
  {
    slug: "bar-1959",
    name: "Bar 1959",
    cuisine: "Cocktails & Small Plates",
    tagline: "A candlelit salon for the late hours",
    shortDescription:
      "An intimate bar of smoked glass, leather and vinyl records, pouring rare whiskies and Himalayan-botanical cocktails.",
    description: [
      "Named for the year the first expedition stayed on this site, Bar 1959 is a room for slow evenings — a wall of rare whiskies, a turntable spinning jazz on vinyl, and bartenders who treat Himalayan botanicals with the reverence of perfumers.",
      "The signature list infuses juniper, timur, rhododendron and wild honey into classical structures. Small plates arrive from Amaya's kitchen until midnight.",
    ],
    hours: "Daily 4:00 PM – 1:00 AM",
    dressCode: "Smart casual",
    location: "Lobby level, west salon",
    images: [
      { src: "", alt: "Cocktails at Bar 1959" },
      { src: "", alt: "Candlelit interior of Bar 1959" },
      { src: "", alt: "Sommelier pouring a rare vintage" },
    ],
    chef: {
      name: "Aarav Shrestha",
      title: "Head Bartender",
      bio: "A collector of forgotten recipes and mountain botanicals, Aarav has bartended in Tokyo and London before building the 1959 programme. His rhododendron negroni has become the hotel's quiet legend.",
      image: { src: "", alt: "Head bartender at work" },
    },
    menu: [
      {
        title: "Signatures",
        items: [
          { name: "Rhododendron Negroni", description: "Gin, laligurans infusion, vermouth di Torino", price: "$16" },
          { name: "Timur Old Fashioned", description: "Bourbon, timur pepper syrup, smoked walnut", price: "$17" },
          { name: "Valley Mist", description: "Vodka, lemongrass, wild honey, yuzu air", price: "$15" },
        ],
      },
      {
        title: "Until Midnight",
        items: [
          { name: "Truffle Croquettes", description: "Aged parmesan, chive emulsion", price: "$12" },
          { name: "Wagyu Sliders", description: "Caramelised onion, gruyère, brioche", price: "$19" },
        ],
      },
    ],
    wine: "Over 60 whiskies including rare Japanese and Speyside single malts, alongside a champagne list served by the glass.",
  },
];

export async function getRestaurants(): Promise<Restaurant[]> {
  const db = getDb();
  if (db) {
    try {
      const entries = await db.contentEntry.findMany({
        where: { module: "dining", status: "PUBLISHED" },
        orderBy: { updatedAt: "desc" },
      });
      const inventory = entries.filter((entry) => entry.key !== "page-studio");
      if (inventory.length) {
        return inventory.map((entry) => {
          const data = entry.data as Record<string, unknown>;
          const text = (key: string, fallback = "") =>
            typeof data[key] === "string" ? String(data[key]) : fallback;
          const plain = (key: string, fallback = "") =>
            text(key, fallback).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          const image = {
            src: text("imageUrl", ""),
            alt: text("imageAlt", entry.title),
          };
          return {
            slug: entry.slug ?? entry.key,
            name: text("restaurant", entry.title),
            cuisine: text("cuisine", "Marlo Cuisine"),
            tagline: text("subheading", entry.title),
            shortDescription: plain("description", entry.title).slice(0, 220),
            description: [plain("description", entry.title)],
            hours: text("hours", "Contact concierge"),
            dressCode: text("dressCode", "Smart casual"),
            location: text("location", "Marlo Hotels"),
            images: [image],
            chef: {
              name: text("chefName", "Marlo Culinary Team"),
              title: "Chef",
              bio: plain("chefBio", "The Marlo Hotels culinary team."),
              image,
            },
            menu: [
              {
                title: "Current Menu",
                items: text("menu")
                  ? [
                      {
                        name: "Menu",
                        description: plain("menu"),
                        price: "",
                      },
                    ]
                  : [],
              },
            ],
          };
        });
      }
    } catch {
      // Static venues bootstrap the site before CMS publication.
    }
  }
  return restaurants;
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | undefined> {
  return (await getRestaurants()).find((restaurant) => restaurant.slug === slug);
}
