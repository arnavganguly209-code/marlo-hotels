/**
 * Generates scripts/seo-landing-seeds.json from:
 * - Base pages (hand-maintained in BASE_SEEDS)
 * - Programmatic Nepal travel-intent pages (100+ unique paths)
 *
 * Run: node scripts/generate-seo-landing-seeds.mjs
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

/** Keep in sync with legacy seed file — edit here if base copy changes. */
const BASE_SEEDS = [
  {
    path: "hotels/kathmandu",
    title: "Hotels in Kathmandu",
    metaTitle: "Hotels in Kathmandu | Marlo Hotels",
    metaDescription:
      "Stay at Marlo Hotels in Kathmandu — a refined address on Paryatan Marg with refined rooms, dining and spa. Explore rooms and book direct.",
    h1: "Hotels in Kathmandu",
    intro:
      "Looking for a considered place to stay in Kathmandu? Marlo Hotels is a refined sanctuary on Paryatan Marg in the heart of the city — close to Thamel’s energy, yet designed for calm, comfort and Himalayan hospitality.",
    body: "Guests choose Marlo for thoughtful rooms and suites, celebrated dining, restorative spa rituals and a front desk that understands both leisure and business travel. Browse the room collection below and reserve directly for the clearest rates and stay details.",
    faqs: [
      {
        question: "Where is Marlo Hotels located in Kathmandu?",
        answer:
          "Marlo Hotels is on Paryatan Marg, 44600 Kathmandu, Nepal — a central address convenient for exploring the city and the Thamel area.",
      },
      {
        question: "Can I book a room directly?",
        answer:
          "Yes. Use Check Availability on this site to select dates, room type and extras, then complete payment securely online.",
      },
    ],
    locationKey: "kathmandu",
    categoryKey: null,
    facilityKey: null,
    roomFilter: "all",
    relatedPaths: [
      "hotels/kathmandu/best",
      "hotels/kathmandu/luxury",
      "hotels/kathmandu/budget",
      "hotels/thamel",
    ],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
  {
    path: "hotels/kathmandu/best",
    title: "Best Hotels in Kathmandu",
    metaTitle: "Best Hotels in Kathmandu | Marlo Hotels",
    metaDescription:
      "Discover why travellers shortlist Marlo Hotels among the best stays in Kathmandu — featured rooms, dining, spa and attentive service.",
    h1: "Best Hotels in Kathmandu",
    intro:
      "“Best” in Kathmandu often means more than a room key — it means location, service consistency and spaces you actually want to return to. Marlo Hotels is built for that standard: polished rooms, genuine hospitality and a calm base for exploring the capital.",
    body: "Below are Marlo’s featured rooms and suites — the stays guests most often recommend for a first visit or a refined city break. Compare layouts, then book with confidence through our direct booking flow.",
    faqs: [
      {
        question: "What makes Marlo a strong choice in Kathmandu?",
        answer:
          "A central Kathmandu address, refined positioning, on-site dining and spa, and a room collection designed for both comfort and clarity of booking.",
      },
    ],
    locationKey: "kathmandu",
    categoryKey: "best",
    facilityKey: null,
    roomFilter: "featured",
    relatedPaths: ["hotels/kathmandu", "hotels/kathmandu/luxury", "hotels/thamel/best"],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
  {
    path: "hotels/kathmandu/luxury",
    title: "Luxury Hotels in Kathmandu",
    metaTitle: "Luxury Hotels in Kathmandu | Marlo Hotels",
    metaDescription:
      "Luxury stay in Kathmandu at Marlo Hotels — suites and refined rooms, fine dining and spa wellness in the heart of the city.",
    h1: "Luxury Hotels in Kathmandu",
    intro:
      "Luxury in Kathmandu at Marlo is quiet and intentional: generous suites, considered interiors, fine dining and a spa for recovery after a day in the valley. It is refined hospitality without unnecessary noise.",
    body: "Explore Marlo’s suites and elevated room categories below. Each listing reflects live catalogue details from our rooms module — names, descriptions and starting rates as published on the site.",
    faqs: [
      {
        question: "Does Marlo offer suites?",
        answer:
          "Yes. Suite categories are listed on this page when published in our rooms catalogue. Open a room for full details and availability.",
      },
    ],
    locationKey: "kathmandu",
    categoryKey: "luxury",
    facilityKey: null,
    roomFilter: "luxury",
    relatedPaths: [
      "hotels/kathmandu",
      "hotels/kathmandu/best",
      "hotels/thamel/luxury",
      "hotels/kathmandu/budget",
    ],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
  {
    path: "hotels/kathmandu/budget",
    title: "Budget Hotels in Kathmandu",
    metaTitle: "Budget-Friendly Stays in Kathmandu | Marlo Hotels",
    metaDescription:
      "Compare Marlo Hotels’ more accessible room categories in Kathmandu — clear starting rates from our live rooms catalogue.",
    h1: "Budget-Friendly Rooms in Kathmandu",
    intro:
      "Marlo is a luxury address, but not every stay needs the largest suite. This page highlights the more accessible room categories in our Kathmandu catalogue — still with Marlo service standards, shown with real starting rates from the site.",
    body: "Rates shown are starting prices from our published room list and can change with dates and occupancy. Use Check Availability for an exact quote for your stay.",
    faqs: [
      {
        question: "Are these the lowest possible rates?",
        answer:
          "These are the lower starting categories in Marlo’s published catalogue. Final pricing depends on dates, guests and any extras selected at booking.",
      },
    ],
    locationKey: "kathmandu",
    categoryKey: "budget",
    facilityKey: null,
    roomFilter: "budget",
    relatedPaths: ["hotels/kathmandu", "hotels/kathmandu/luxury", "hotels/thamel/budget"],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
  {
    path: "hotels/thamel",
    title: "Hotels in Thamel",
    metaTitle: "Hotels in Thamel, Kathmandu | Marlo Hotels",
    metaDescription:
      "Stay near Thamel at Marlo Hotels, Kathmandu — a refined base on Paryatan Marg with easy access to Thamel’s cafés, shops and travel services.",
    h1: "Hotels in Thamel",
    intro:
      "Thamel is Kathmandu’s well-known traveller hub — cafés, outfitters and evening energy. Marlo Hotels sits on Paryatan Marg as a quieter, refined base with convenient access to the Thamel area, so you can explore by day and return to calm.",
    body: "We do not invent walking times or pin distances. What we can say accurately: Marlo is a central Kathmandu hotel positioned for guests who want Thamel’s convenience without giving up spa, dining and polished rooms. Browse available categories below.",
    faqs: [
      {
        question: "Is Marlo inside Thamel’s market streets?",
        answer:
          "Marlo is on Paryatan Marg in central Kathmandu, chosen for access to the Thamel neighbourhood while remaining a composed hotel environment.",
      },
    ],
    locationKey: "thamel",
    categoryKey: null,
    facilityKey: null,
    roomFilter: "all",
    relatedPaths: [
      "hotels/thamel/best",
      "hotels/thamel/luxury",
      "hotels/thamel/budget",
      "hotels/kathmandu",
    ],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
  {
    path: "hotels/thamel/best",
    title: "Best Hotels in Thamel",
    metaTitle: "Best Hotels in Thamel | Marlo Hotels Kathmandu",
    metaDescription:
      "A refined Thamel-area stay at Marlo Hotels — featured rooms for travellers who want the best of Kathmandu’s hub with refined comfort.",
    h1: "Best Hotels in Thamel",
    intro:
      "For many visitors, the “best” Thamel-area stay balances access to the neighbourhood with a hotel that still feels restorative. Marlo’s featured rooms are curated for that balance — central Kathmandu, elevated service, and a calm return after Thamel.",
    body: "Featured categories from our live rooms catalogue appear below. Each card links to full room detail and the same booking path used across the Marlo site.",
    faqs: [],
    locationKey: "thamel",
    categoryKey: "best",
    facilityKey: null,
    roomFilter: "featured",
    relatedPaths: ["hotels/thamel", "hotels/kathmandu/best", "hotels/thamel/luxury"],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
  {
    path: "hotels/thamel/luxury",
    title: "Luxury Hotels in Thamel",
    metaTitle: "Luxury Hotels in Thamel | Marlo Hotels",
    metaDescription:
      "Luxury hotel near Thamel at Marlo Hotels — suites and elevated rooms with dining and spa in central Kathmandu.",
    h1: "Luxury Hotels in Thamel",
    intro:
      "Luxury near Thamel at Marlo means suite-led comfort, spa recovery and dining that matches a refined brief — while keeping you connected to Kathmandu’s most walkable traveller district.",
    body: "Suite and elevated categories from our catalogue are listed here when published. Details and starting rates come directly from Marlo’s rooms data — not invented listings.",
    faqs: [],
    locationKey: "thamel",
    categoryKey: "luxury",
    facilityKey: null,
    roomFilter: "luxury",
    relatedPaths: ["hotels/thamel", "hotels/kathmandu/luxury", "hotels/thamel/best"],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
  {
    path: "hotels/thamel/budget",
    title: "Budget Hotels in Thamel",
    metaTitle: "Budget-Friendly Thamel Stays | Marlo Hotels",
    metaDescription:
      "More accessible Marlo room categories for a Thamel-area stay in Kathmandu — real starting rates from our published catalogue.",
    h1: "Budget-Friendly Rooms near Thamel",
    intro:
      "If you want Thamel’s convenience with Marlo’s standards, start with our more accessible room categories. This page surfaces the lower starting rates in our published list — still Marlo service, still central Kathmandu.",
    body: "Exact totals depend on your dates and party size. Use the booking flow for a precise quote; the rooms below are drawn only from our live catalogue.",
    faqs: [],
    locationKey: "thamel",
    categoryKey: "budget",
    facilityKey: null,
    roomFilter: "budget",
    relatedPaths: ["hotels/thamel", "hotels/kathmandu/budget", "hotels/thamel/luxury"],
    status: "PUBLISHED",
    robotsIndex: true,
    enabled: true,
  },
];

const NEPAL_TOPICS = [
  {
    slug: "pokhara",
    label: "Pokhara",
    context:
      "Pokhara is the usual lakeside gateway for Annapurna treks, paragliding and relaxed evenings by Phewa. Many itineraries stage flights or road transfers through Kathmandu first — a stay at Marlo helps you reset, dine well and book the next leg with a clear head.",
  },
  {
    slug: "chitwan",
    label: "Chitwan National Park",
    context:
      "Wildlife-focused travellers often route through Kathmandu before heading south for safari days. Use Marlo as your arrival-night hotel: spa recovery, calm rooms and easy onward planning.",
  },
  {
    slug: "lumbini",
    label: "Lumbini",
    context:
      "Pilgrimage trips to Lumbini frequently connect via Kathmandu. A composed city base makes jet lag, documents and ground transport simpler before you continue.",
  },
  {
    slug: "nagarkot",
    label: "Nagarkot",
    context:
      "Ridge-line viewpoints near the valley rim are popular for sunrise-focused nights. Marlo works well as your primary Kathmandu hotel while you build day trips and transport without rushing checkout.",
  },
  {
    slug: "bhaktapur",
    label: "Bhaktapur",
    context:
      "Heritage walking in Bhaktapur pairs naturally with a longer Kathmandu Valley itinerary. Marlo keeps dining, spa and front-desk support on-site while you plan Durbar Square time on your own schedule.",
  },
  {
    slug: "patan",
    label: "Patan (Lalitpur)",
    context:
      "Patan’s temples and courtyards reward slow exploration. Stay at Marlo for a refined room product in the capital, then visit Patan as part of your valley touring plan.",
  },
  {
    slug: "everest-region",
    label: "Everest region",
    context:
      "Trekking groups and independent travellers often overnight in Kathmandu for briefings, gear checks and flights. Marlo is suited as a pre- or post-trek city hotel — warm service, spa for tight muscles, and direct booking on this site.",
  },
  {
    slug: "annapurna-circuit",
    label: "Annapurna Circuit",
    context:
      "Long-distance trekking plans usually include buffer nights in Kathmandu. Use those nights for rest, laundry and predictable dining before the mountains.",
  },
  {
    slug: "langtang",
    label: "Langtang",
    context:
      "Closer-to-Kathmandu trekking still benefits from a composed arrival hotel. Marlo helps you line up logistics from a stable base rather than a rushed guesthouse night.",
  },
  {
    slug: "mustang",
    label: "Upper Mustang",
    context:
      "Restricted-area travel often involves permits and flights staged from Kathmandu. Book your city stay with clear cancellation rules, then continue once paperwork is confirmed.",
  },
  {
    slug: "janakpur",
    label: "Janakpur",
    context:
      "Cultural routes through the Tarai sometimes connect through Kathmandu hubs. Marlo works as a trusted stop for international arrivals before domestic hops.",
  },
  {
    slug: "biratnagar",
    label: "Biratnagar",
    context:
      "Eastern Nepal business and family travel frequently routes via Kathmandu. A reliable city hotel keeps meetings and meals straightforward.",
  },
  {
    slug: "nepalgunj",
    label: "Nepalgunj",
    context:
      "Far-west connections and Bardia safari logistics often touch Kathmandu. Stage your international arrival at Marlo while confirming domestic segments.",
  },
  {
    slug: "dharan",
    label: "Dharan",
    context:
      "Hills-and-highway itineraries sometimes begin with international arrival in Kathmandu. Rest, dine and plan the next travel day from a single, clear address.",
  },
  {
    slug: "butwal",
    label: "Butwal / Lumbini corridor",
    context:
      "Southwestern highway travel connects many points across Nepal. Marlo in Kathmandu supports a structured start or finish around longer road trips.",
  },
];

const INTENT_SEGMENTS = [
  {
    suffix: "",
    titleSuffix: "",
    h1Prefix: "Hotels for",
    metaTitleTemplate: (label) => `${label} Trips — Kathmandu Base Hotel | Marlo Hotels`,
    metaDescTemplate: (label) =>
      `Planning ${label} travel in Nepal? Book Marlo Hotels in Kathmandu as your arrival or buffer-night base — refined rooms, dining, spa and direct online booking.`,
    categoryKey: null,
    roomFilter: "all",
    introLead: (label, ctx) =>
      `Searching for hotels tied to ${label}? Marlo Hotels is one property in Kathmandu — not a directory of random listings. ${ctx}`,
    bodyTemplate: (label) =>
      `This page exists to help travellers who type “${label} hotels” find a trustworthy Kathmandu base. Every room card below is from Marlo’s live catalogue (names, copy and starting rates as published). When your dates are firm, run Check Availability for an exact total.`,
  },
  {
    suffix: "budget",
    titleSuffix: " — budget-friendly base",
    h1Prefix: "Budget hotels for",
    metaTitleTemplate: (label) => `Budget Hotels (${label}) — Kathmandu | Marlo Hotels`,
    metaDescTemplate: (label) =>
      `Affordable Marlo room categories for travellers planning ${label} — clear published starting rates in Kathmandu, Nepal. Book direct with instant confirmation online.`,
    categoryKey: "budget",
    roomFilter: "budget",
    introLead: (label, ctx) =>
      `Need a budget-conscious Kathmandu hotel before or after ${label}? Marlo lists lower starting categories from our published catalogue while keeping service consistent. ${ctx}`,
    bodyTemplate: (label) =>
      `“Budget” here means Marlo’s more accessible published categories — not third-party hostels. Compare cards below, then confirm pricing in the booking flow for your exact ${label} travel dates.`,
  },
  {
    suffix: "luxury",
    titleSuffix: " — luxury base",
    h1Prefix: "Luxury hotels for",
    metaTitleTemplate: (label) => `Luxury Hotels (${label}) — Kathmandu | Marlo Hotels`,
    metaDescTemplate: (label) =>
      `Luxury Kathmandu stay for ${label} trips: Marlo Hotels suites and elevated rooms, dining, spa and secure direct booking.`,
    categoryKey: "luxury",
    roomFilter: "luxury",
    introLead: (label, ctx) =>
      `If you want a luxury-leaning Kathmandu night around ${label} plans, start with Marlo’s suites and elevated room types. ${ctx}`,
    bodyTemplate: (label) =>
      `Luxury pages surface suite-led or higher-rate categories when published. Details remain tied to our catalogue — open any room for photos, inclusions and availability tied to your ${label} itinerary.`,
  },
  {
    suffix: "best",
    titleSuffix: " — featured picks",
    h1Prefix: "Best hotels for",
    metaTitleTemplate: (label) => `Best Hotels (${label}) — Kathmandu | Marlo Hotels`,
    metaDescTemplate: (label) =>
      `See Marlo Hotels’ featured categories for travellers planning ${label} — a refined Kathmandu base with dining, spa and direct booking.`,
    categoryKey: "best",
    roomFilter: "featured",
    introLead: (label, ctx) =>
      `Looking for the best-reviewed style of stay while you organise ${label}? Marlo highlights featured room categories that guests return to — still one hotel, still honest copy. ${ctx}`,
    bodyTemplate: (label) =>
      `“Best” on this site means our featured catalogue selection, not paid rankings. Scroll the cards, compare layouts, and book the room that matches your ${label} pacing.`,
  },
  {
    suffix: "international-travellers",
    titleSuffix: " — international travellers",
    h1Prefix: "Hotels in Nepal for international travellers —",
    metaTitleTemplate: (label) =>
      `${label} Hotels Nepal — International Travellers | Marlo Kathmandu`,
    metaDescTemplate: (label) =>
      `International visitors planning ${label} in Nepal: book Marlo Hotels in Kathmandu — English-friendly service, secure online payment and spa recovery.`,
    categoryKey: null,
    roomFilter: "all",
    introLead: (label, ctx) =>
      `Flying in for ${label}? International travellers often want a predictable Kathmandu hotel before domestic hops. Marlo publishes everything on this site — rooms, dining overview and a direct booking path. ${ctx}`,
    bodyTemplate: (label) =>
      `We do not list other brands here. If you need invoices, payment clarity or room preferences, start from the booking flow and contact details published on the contact page.`,
  },
  {
    suffix: "family",
    titleSuffix: " — families",
    h1Prefix: "Family-friendly hotels for",
    metaTitleTemplate: (label) => `Family Hotels (${label}) Nepal | Marlo Kathmandu`,
    metaDescTemplate: (label) =>
      `Family stays in Kathmandu before ${label}: spacious Marlo room categories, on-site dining and a composed environment for kids and parents — book direct.`,
    categoryKey: null,
    roomFilter: "all",
    introLead: (label, ctx) =>
      `Travelling with family around ${label}? Marlo is structured for calm lobby flow, predictable dining and front-desk clarity — helpful when schedules shift. ${ctx}`,
    bodyTemplate: (label) =>
      `Review room layouts on each card, note occupancy rules in the booking step, and add extras there if available. Every price comes from our published catalogue at search time.`,
  },
  {
    suffix: "couples",
    titleSuffix: " — couples",
    h1Prefix: "Couple-friendly hotels for",
    metaTitleTemplate: (label) => `Romantic Hotels (${label}) Kathmandu | Marlo Hotels`,
    metaDescTemplate: (label) =>
      `Couples planning ${label} in Nepal: refined Marlo rooms in Kathmandu, spa time and dining without the noise of a crowded market street.`,
    categoryKey: "luxury",
    roomFilter: "luxury",
    introLead: (label, ctx) =>
      `For two people building ${label} memories, a quiet Kathmandu hotel matters. Marlo leans into suites and elevated categories on this view, with spa access for recovery days. ${ctx}`,
    bodyTemplate: (label) =>
      `Pick a room that matches how you travel — some couples want space, others want the best rate. Compare below, then lock dates in Check Availability before ${label} transport firms up.`,
  },
  {
    suffix: "solo",
    titleSuffix: " — solo travellers",
    h1Prefix: "Solo traveller hotels for",
    metaTitleTemplate: (label) => `Solo Travel Hotels (${label}) Nepal | Marlo Kathmandu`,
    metaDescTemplate: (label) =>
      `Solo trips around ${label}: secure direct booking, clear room detail and a staffed front desk at Marlo Hotels Kathmandu.`,
    categoryKey: null,
    roomFilter: "all",
    introLead: (label, ctx) =>
      `Solo travellers often want clarity more than hype. Marlo is one address in Kathmandu with published room facts and online booking — useful when ${label} logistics eat your attention. ${ctx}`,
    bodyTemplate: (label) =>
      `Read each room card, confirm cancellation rules at checkout, and keep confirmations in email. This page is Marlo-only — no scraped listings or fake “compare 100 hotels” widgets.`,
  },
];

function buildNepalProgrammaticSeeds() {
  /** @type {typeof BASE_SEEDS[0][]} */
  const out = [];
  for (const topic of NEPAL_TOPICS) {
    for (const seg of INTENT_SEGMENTS) {
      const path =
        seg.suffix === ""
          ? `hotels/nepal/${topic.slug}`
          : `hotels/nepal/${topic.slug}/${seg.suffix}`;
      const label = topic.label;
      const h1 = `${seg.h1Prefix} ${label}`;
      const title = `${label} hotels in Nepal${seg.titleSuffix}`.trim();
      const metaTitle = seg.metaTitleTemplate(label);
      const metaDescription = seg.metaDescTemplate(label);
      const intro = `${seg.introLead(label, topic.context)}`;
      const body = seg.bodyTemplate(label);
      const faqs = [
        {
          question: `Is Marlo Hotels inside ${label}?`,
          answer:
            "Marlo Hotels is one property in Kathmandu Valley (Paryatan Marg). This page helps travellers who search region + hotel keywords find our direct booking path — not a map claim we cannot verify to the metre.",
        },
        {
          question: "Why book direct on marlohotels.com?",
          answer:
            "You see the same published room catalogue we maintain in Admin, with a secure checkout and clear confirmation. We do not add third-party hotel listings on these guides.",
        },
      ];
      const related = [
        "hotels/kathmandu",
        "hotels/thamel",
        seg.categoryKey ? `hotels/kathmandu/${seg.categoryKey}` : "hotels/kathmandu/best",
        `hotels/nepal/${topic.slug}`,
      ]
        .filter((p, i, a) => a.indexOf(p) === i)
        .filter((p) => p !== path)
        .slice(0, 5);

      out.push({
        path,
        title,
        metaTitle,
        metaDescription,
        h1,
        intro,
        body,
        faqs,
        locationKey: `nepal:${topic.slug}`,
        categoryKey: seg.categoryKey,
        facilityKey: null,
        roomFilter: seg.roomFilter,
        relatedPaths: related,
        status: "PUBLISHED",
        robotsIndex: true,
        enabled: true,
      });
    }
  }
  return out;
}

function mergeSeeds(base, generated) {
  const map = new Map();
  for (const s of base) map.set(s.path, s);
  for (const s of generated) {
    if (map.has(s.path)) throw new Error(`Duplicate path: ${s.path}`);
    map.set(s.path, s);
  }
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
}

const programmatic = buildNepalProgrammaticSeeds();
const merged = mergeSeeds(BASE_SEEDS, programmatic);
const outPath = path.join(process.cwd(), "scripts/seo-landing-seeds.json");
writeFileSync(outPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${merged.length} seeds (${BASE_SEEDS.length} base + ${programmatic.length} nepal guides) → ${outPath}`
);
