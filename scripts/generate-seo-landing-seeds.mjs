/**
 * Generates scripts/seo-landing-seeds.json from:
 * - Base pages (hand-maintained in BASE_SEEDS)
 * - Programmatic Nepal travel-intent pages
 * - Keyword intent guides (25+ root phrases × variants)
 *
 * Run: node scripts/generate-seo-landing-seeds.mjs
 */
import { writeFileSync } from "node:fs";
import path from "node:path";

/** Google SERP-friendly bands (approximate; we normalize all seeds to fit). */
function trimToMaxChars(s, max, ellipsis) {
  let t = String(s || "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - (ellipsis ? 1 : 0));
  const lastSpace = cut.lastIndexOf(" ");
  const base =
    lastSpace > max * 0.5 ? cut.slice(0, lastSpace).trimEnd() : cut.trimEnd();
  return ellipsis ? `${base}…` : base;
}

/** Ensure first character is uppercase for display titles. */
function titleCasePhrase(s) {
  const t = String(s || "").trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Google SERP-friendly bands (approximate; we normalize all seeds to fit). */
function ensureSerp(metaTitle, metaDescription) {
  let mt = String(metaTitle || "").trim().replace(/\s+/g, " ");
  let md = String(metaDescription || "").trim().replace(/\s+/g, " ");
  const titlePad = " | Marlo Hotels Kathmandu";
  while (mt.length > 0 && mt.length < 30) {
    mt = (mt + titlePad).trim();
    if (mt.length >= 30) break;
  }
  if (mt.length > 65) mt = trimToMaxChars(mt, 65, true);
  const descPad =
    " Direct booking on marlohotels.com with live room catalogue and secure checkout.";
  while (md.length < 120) {
    md = (md + descPad).trim();
    if (md.length >= 120) break;
  }
  if (md.length > 165) md = trimToMaxChars(md, 165, true);
  return { metaTitle: mt, metaDescription: md };
}

function ensureLongBody(body, pagePath) {
  let b = String(body || "").trim();
  if (b.length >= 1100) return b;
  const tail = `

How to use this page: the room cards below pull from Marlo’s published catalogue only — names, descriptions and starting rates as maintained in Admin. That keeps this guide aligned with checkout: what you see here is what you can book, without scraped third-party listings or invented “compare 20 hotels” widgets.

International visitors often land in Kathmandu before domestic flights to trekking regions, Chitwan, Pokhara or Lumbini. A composed hotel night helps when permits, weather or festival traffic shift plans. Local and regional guests use the same flow for celebrations and business — ask the front desk for quiet floors, dietary notes and realistic timing around valley traffic.

Dining and wellness on property mean you can recover after long-haul flights or road days without hunting the city at night. Spa hours and menus can change; confirm at check-in. For ${pagePath.includes("guide") ? "high-intent keyword" : "destination-led"} searches, we keep copy factual: one hotel address (Paryatan Marg), transparent booking, and FAQs for quick answers.

If a category does not appear, it is not published yet. Publish in Admin → Rooms, then refresh this page. For the clearest total, always run Check Availability with your exact dates, guests and add-ons — starting rates are not a final invoice.`;
  b = `${b}${tail}`.trim();
  if (b.length > 6000) return `${b.slice(0, 5997).trimEnd()}…`;
  return b;
}

function ensureIntro(intro, h1) {
  let t = String(intro || "").trim();
  if (t.length >= 380) return t;
  const isHotel = String(h1 || "").toLowerCase().includes("hotel");
  const add = ` This ${isHotel ? "guide" : "page"} exists for searchers who want a single trustworthy Kathmandu property — Marlo Hotels on Paryatan Marg — with direct booking instead of OTA redirects.`;
  t = (t + add).trim();
  if (t.length > 900) return `${t.slice(0, 897).trimEnd()}…`;
  return t;
}

function ensureFaqs(faqs) {
  const list = Array.isArray(faqs) ? [...faqs] : [];
  const extras = [
    {
      question: "Is this a list of many hotels in Kathmandu?",
      answer:
        "No. Only Marlo Hotels appears here. We route search keywords to our official catalogue and booking flow — not a directory of competitors.",
    },
    {
      question: "How do international and local guests book the same way?",
      answer:
        "Everyone uses Check Availability on this site. Published rates, taxes and cancellation rules show before you pay; confirmation emails recap your stay details.",
    },
    {
      question: "What if my room category is not listed?",
      answer:
        "Unpublished categories are hidden until Admin → Rooms marks them live. Contact the hotel if you need a room type that should be public.",
    },
  ];
  let i = 0;
  while (list.length < 3 && i < extras.length) {
    if (!list.some((x) => x.question === extras[i].question)) list.push(extras[i]);
    i += 1;
  }
  return list;
}

function enrichSeed(seed) {
  const serp = ensureSerp(seed.metaTitle, seed.metaDescription);
  return {
    ...seed,
    metaTitle: serp.metaTitle,
    metaDescription: serp.metaDescription,
    intro: ensureIntro(seed.intro, seed.h1),
    body: ensureLongBody(seed.body, seed.path),
    faqs: ensureFaqs(seed.faqs),
  };
}

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
    bodyTemplate: () =>
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
    bodyTemplate: () =>
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
    bodyTemplate: () =>
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
          question: `Is Marlo Hotels located inside ${label}?`,
          answer:
            "Marlo Hotels is one property in Kathmandu Valley on Paryatan Marg. This guide connects your search to our official booking path — we do not claim to be inside another town’s boundary to the metre.",
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

/** @param {typeof BASE_SEEDS} arrays */
function mergeSeeds(...arrays) {
  const map = new Map();
  for (const arr of arrays) {
    for (const s of arr) {
      if (map.has(s.path)) throw new Error(`Duplicate path: ${s.path}`);
      map.set(s.path, s);
    }
  }
  return [...map.values()].sort((a, b) => a.path.localeCompare(b.path));
}

/** High-intent hotel searches (Kathmandu / Thamel / Nepal travel) — Marlo-only copy, no false map claims. */
const KEYWORD_TOPICS = [
  { slug: "best-hotel-kathmandu", phrase: "best hotel Kathmandu", hint: "central refined base near Thamel" },
  { slug: "cheap-hotel-kathmandu", phrase: "cheap hotel Kathmandu", hint: "clear published rates — compare in-booking" },
  { slug: "budget-hotel-kathmandu", phrase: "budget hotel Kathmandu", hint: "accessible categories with Marlo service" },
  { slug: "luxury-hotel-kathmandu", phrase: "luxury hotel Kathmandu", hint: "suites, dining and spa recovery" },
  { slug: "hotel-thamel", phrase: "hotel Thamel Kathmandu", hint: "refined stay with Thamel-area access" },
  { slug: "hotel-near-thamel", phrase: "hotel near Thamel", hint: "Paryatan Marg base for the district" },
  { slug: "thamel-budget-hotel", phrase: "Thamel budget hotel", hint: "value-led room categories" },
  { slug: "kathmandu-hotel-booking", phrase: "Kathmandu hotel booking", hint: "secure direct online confirmation" },
  { slug: "hotel-nepal-kathmandu", phrase: "hotel in Nepal Kathmandu", hint: "international arrival + valley trips" },
  { slug: "boutique-hotel-kathmandu", phrase: "boutique hotel Kathmandu", hint: "considered design and calm service" },
  { slug: "family-hotel-kathmandu", phrase: "family hotel Kathmandu", hint: "spacious categories + dining on site" },
  { slug: "honeymoon-hotel-nepal", phrase: "honeymoon hotel Nepal", hint: "suite-led stays with spa time" },
  { slug: "business-hotel-kathmandu", phrase: "business hotel Kathmandu", hint: "front desk + meeting mindset" },
  { slug: "airport-hotel-kathmandu", phrase: "airport hotel Kathmandu", hint: "buffer nights around Tribhuvan connections" },
  { slug: "tribhuvan-airport-hotel", phrase: "hotel near Tribhuvan Airport", hint: "arrival-night clarity before domestic legs" },
  { slug: "spa-hotel-kathmandu", phrase: "spa hotel Kathmandu", hint: "wellness on property — verify hours at check-in" },
  { slug: "downtown-kathmandu-hotel", phrase: "downtown Kathmandu hotel", hint: "capital base for meetings and touring" },
  { slug: "durbar-marg-hotel", phrase: "Durbar Marg area hotel", hint: "central valley positioning" },
  { slug: "lazimpat-hotel", phrase: "Lazimpat hotel Kathmandu", hint: "embassy-district proximity searches" },
  { slug: "patan-hotel", phrase: "Patan hotel Kathmandu", hint: "heritage day trips from a capital base" },
  { slug: "bhaktapur-hotel", phrase: "Bhaktapur hotel", hint: "easy valley staging in Kathmandu" },
  { slug: "trekking-hotel-kathmandu", phrase: "trekking hotel Kathmandu", hint: "pre- and post-trek recovery nights" },
  { slug: "everest-trek-hotel-base", phrase: "Everest trek hotel base", hint: "buffer nights before Lukla / domestic" },
  { slug: "annapurna-trek-hotel-base", phrase: "Annapurna trek hotel base", hint: "Pokhara-stage itineraries via KTM" },
  { slug: "couple-hotel-kathmandu", phrase: "couple hotel Kathmandu", hint: "quiet rooms and dining together" },
  { slug: "solo-traveller-hotel-kathmandu", phrase: "solo traveller hotel Kathmandu", hint: "clear policies and staffed desk" },
  { slug: "international-tourist-hotel-nepal", phrase: "international tourist hotel Nepal", hint: "English-friendly service + direct pay" },
  { slug: "marriott-style-hotel-kathmandu", phrase: "international chain style hotel Kathmandu", hint: "refined independent alternative — one property" },
  { slug: "premium-hotel-kathmandu", phrase: "premium hotel Kathmandu", hint: "elevated categories and suite-led stays" },
  { slug: "pokhara-trip-hotel-base", phrase: "Pokhara trip hotel Kathmandu", hint: "buffer nights before lakeside travel" },
];

const KEYWORD_INTENTS = [
  {
    suffix: "",
    titleSuffix: "",
    h1Template: (phrase) => `${phrase} — book direct`,
    metaTitleTemplate: (phrase) => `${phrase} | Marlo Hotels Kathmandu`,
    metaDescTemplate: (phrase, hint) =>
      `${phrase} at Marlo Hotels, Paryatan Marg — ${hint}. Published rooms, dining, spa. Secure direct booking on marlohotels.com.`,
    categoryKey: null,
    roomFilter: "all",
    introTemplate: (phrase, hint) =>
      `If you searched “${phrase}”, you want a hotel page you can trust — not a spam directory. Marlo Hotels is one address in Kathmandu with published rooms, live rates and secure checkout: ${hint}.`,
    bodyTemplate: (phrase) =>
      `Every tile below is from Marlo’s catalogue. Open a room for layout detail, then run Check Availability for your exact stay when “${phrase}” leads you here from Google.`,
  },
  {
    suffix: "budget",
    titleSuffix: " (budget)",
    h1Template: (phrase) => `Budget — ${phrase}`,
    metaTitleTemplate: (phrase) => `Budget ${phrase} | Marlo Hotels`,
    metaDescTemplate: (phrase) =>
      `Budget ${phrase}: Marlo’s lower published categories in Kathmandu with online booking — transparent starting rates.`,
    categoryKey: "budget",
    roomFilter: "budget",
    introTemplate: (phrase) =>
      `Budget-led searches for “${phrase}” still deserve honest copy. Marlo lists accessible categories from the same property — no fake “compare 50 hotels” widgets.`,
    bodyTemplate: (phrase) =>
      `Pick a category, note starting rates on the card, then confirm the total in the booking step. That is how we keep “${phrase}” aligned with real inventory.`,
  },
  {
    suffix: "luxury",
    titleSuffix: " (luxury)",
    h1Template: (phrase) => `Luxury — ${phrase}`,
    metaTitleTemplate: (phrase) => `Luxury ${phrase} | Marlo Hotels`,
    metaDescTemplate: (phrase) =>
      `Luxury ${phrase}: suites and elevated rooms at Marlo Hotels — dining, spa and refined service in Kathmandu.`,
    categoryKey: "luxury",
    roomFilter: "luxury",
    introTemplate: (phrase) =>
      `Luxury intent behind “${phrase}” usually means space, dining and recovery. Marlo surfaces suite-led categories here when published in our catalogue.`,
    bodyTemplate: (phrase) =>
      `Compare suite layouts below, then book direct so “${phrase}” resolves to a confirmed Marlo stay — not an OTA redirect loop.`,
  },
  {
    suffix: "best",
    titleSuffix: " (top picks)",
    h1Template: (phrase) => `Top picks — ${phrase}`,
    metaTitleTemplate: (phrase) => `Best ${phrase} | Marlo Hotels`,
    metaDescTemplate: (phrase) =>
      `Best-rated style stay for “${phrase}”: Marlo’s featured room categories in Kathmandu — book direct.`,
    categoryKey: "best",
    roomFilter: "featured",
    introTemplate: (phrase) =>
      `“Best” searches for “${phrase}” are noisy online. This page keeps it simple: Marlo’s featured catalogue picks, one hotel, one booking path.`,
    bodyTemplate: (phrase) =>
      `Featured does not mean paid placement — it is our internal highlight list. Use it to shortlist, then finalize dates for “${phrase}”.`,
  },
];

function buildKeywordGuideSeeds() {
  /** @type {typeof BASE_SEEDS[0][]} */
  const out = [];
  for (const topic of KEYWORD_TOPICS) {
    for (const seg of KEYWORD_INTENTS) {
      const path =
        seg.suffix === ""
          ? `hotels/guide/${topic.slug}`
          : `hotels/guide/${topic.slug}/${seg.suffix}`;
      const phrase = titleCasePhrase(topic.phrase);
      const h1 = titleCasePhrase(seg.h1Template(phrase));
      const title = `${phrase}${seg.titleSuffix} — Marlo Hotels`.trim();
      const metaTitle = seg.metaTitleTemplate(phrase);
      const metaDescription =
        seg.metaDescTemplate.length >= 2
          ? seg.metaDescTemplate(phrase, topic.hint)
          : seg.metaDescTemplate(phrase);
      const intro =
        seg.introTemplate.length >= 2
          ? seg.introTemplate(phrase, topic.hint)
          : seg.introTemplate(phrase);
      const body = seg.bodyTemplate(phrase);
      const faqs = [
        {
          question:
            "Does this page compare every hotel in Kathmandu for this search?",
          answer:
            "No. Only Marlo Hotels is listed. This page matches common searches to our official catalogue and direct booking — not a competitor directory.",
        },
        {
          question: "Why only Marlo room cards?",
          answer:
            "You get live inventory language, real photos from Admin, and direct payment — which is what we can stand behind in Search Console.",
        },
      ];
      const related = [
        "hotels/kathmandu",
        "hotels/thamel",
        seg.categoryKey ? `hotels/kathmandu/${seg.categoryKey}` : "hotels/kathmandu/best",
        `hotels/guide/${topic.slug}`,
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
        locationKey: "kathmandu",
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

const nepalProgrammatic = buildNepalProgrammaticSeeds();
const keywordProgrammatic = buildKeywordGuideSeeds();
const merged = mergeSeeds(
  BASE_SEEDS,
  nepalProgrammatic,
  keywordProgrammatic
).map(enrichSeed);
const outPath = path.join(process.cwd(), "scripts/seo-landing-seeds.json");
writeFileSync(outPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${merged.length} seeds (${BASE_SEEDS.length} base + ${nepalProgrammatic.length} nepal + ${keywordProgrammatic.length} keyword guides) → ${outPath}`
);
