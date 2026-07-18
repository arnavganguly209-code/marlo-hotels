import type { SpaPackage, SpaTreatment } from "@/types/content";

export const spaIntro = {
  name: "Marlo Spa",
  tagline: "Stillness, drawn from the mountains",
  description: [
    "Marlo Spa is a sanctuary of stone, cedar and filtered light — five treatment suites, a couples' pavilion, and a thermal circuit of steam, sauna and a cold plunge fed by mountain spring water.",
    "Our therapies weave Himalayan traditions — singing bowl sound healing, warmed river-stone work, apothecary oils pressed in the valley — with contemporary results-driven skincare from our partner houses.",
  ],
  hours: "Daily 8:00 AM – 9:00 PM",
  facilities: [
    "Five treatment suites",
    "Couples' spa pavilion",
    "Himalayan salt steam room",
    "Cedar sauna & cold plunge",
    "Relaxation lounge with valley views",
    "Yoga & meditation shala",
  ],
};

export const treatments: SpaTreatment[] = [
  {
    name: "Himalayan Singing Bowl Ritual",
    category: "Signature Journey",
    duration: "90 min",
    price: 165,
    description: "Sound healing with hand-forged bowls placed on the body, followed by a warm oil massage that works to the vibration's rhythm.",
  },
  {
    name: "Marlo Signature Massage",
    category: "Signature Journey",
    duration: "90 min",
    price: 150,
    description: "Our therapists blend Swedish, deep tissue and Thai stretching into a single intuitive treatment, tailored in conversation before you begin.",
  },
  {
    name: "Warm River-Stone Massage",
    category: "Massage",
    duration: "75 min",
    price: 135,
    description: "Basalt stones gathered from Himalayan rivers, warmed and drawn along the body's meridians to melt deep-held tension.",
  },
  {
    name: "Deep Recovery Massage",
    category: "Massage",
    duration: "60 min",
    price: 115,
    description: "Firm, focused work for trekkers and travellers — targeted muscle release with arnica and wintergreen oils.",
  },
  {
    name: "Mountain Rose Radiance Facial",
    category: "Facial",
    duration: "75 min",
    price: 140,
    description: "Wild rose and rhododendron extracts with lymphatic sculpting massage, leaving skin luminous at altitude.",
  },
  {
    name: "Advanced Renewal Facial",
    category: "Facial",
    duration: "90 min",
    price: 180,
    description: "A results-driven protocol combining enzymatic resurfacing, microcurrent lifting and a collagen-rich masque.",
  },
  {
    name: "Himalayan Salt & Honey Polish",
    category: "Body Ritual",
    duration: "45 min",
    price: 95,
    description: "Pink salt crystals and wild valley honey buff the skin to silk, finished with warmed apothecary oil.",
  },
  {
    name: "Sacred Earth Cocoon",
    category: "Body Ritual",
    duration: "75 min",
    price: 130,
    description: "A mineral clay wrap infused with vetiver and cedar, paired with a pressure-point scalp massage.",
  },
];

export const packages: SpaPackage[] = [
  {
    name: "The Marlo Day Retreat",
    duration: "5 hours",
    price: 340,
    description: "A full day surrendered to stillness — arrival ritual, signature treatments and a wellness lunch on the spa terrace.",
    inclusions: [
      "Thermal circuit & relaxation lounge",
      "Marlo Signature Massage (90 min)",
      "Mountain Rose Radiance Facial (75 min)",
      "Wellness lunch at The Terrace",
      "Herbal infusion ceremony",
    ],
  },
  {
    name: "Couples' Twilight Ritual",
    duration: "3 hours",
    price: 420,
    description: "The couples' pavilion at dusk — side-by-side massage, a private soak and champagne as the valley lights come on.",
    inclusions: [
      "Private couples' pavilion",
      "Side-by-side signature massage (90 min)",
      "Aromatic bath ritual for two",
      "Champagne & patisserie selection",
    ],
  },
  {
    name: "Trekker's Restoration",
    duration: "2.5 hours",
    price: 240,
    description: "Made for the days after the mountain — deep muscle recovery, a mineral soak and guided breathwork.",
    inclusions: [
      "Deep Recovery Massage (60 min)",
      "Himalayan salt foot ritual",
      "Mineral recovery bath",
      "Guided breathwork session (30 min)",
    ],
  },
];
