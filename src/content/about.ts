import { getDb } from "@/lib/db";

export type AboutContent = {
  hero: {
    eyebrow: string;
    heading: string;
    description: string;
    image: { src: string; alt: string };
  };
  story: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    image: { src: string; alt: string };
  };
  facilities: {
    eyebrow: string;
    heading: string;
    items: { title: string; description: string }[];
  };
  services: {
    eyebrow: string;
    heading: string;
    description: string;
  };
  experience: {
    eyebrow: string;
    heading: string;
    description: string;
  };
  gallery: {
    eyebrow: string;
    heading: string;
    images: { src: string; alt: string }[];
  };
  cta: {
    eyebrow: string;
    heading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
};

const defaults: AboutContent = {
  hero: {
    eyebrow: "About Marlo",
    heading: "A sanctuary composed of mountain light",
    description:
      "Marlo Hotels rises at the meeting point of Kathmandu's royal quarter and the valley's green rim.",
    image: { src: "", alt: "Marlo Hotels" },
  },
  story: {
    eyebrow: "Our Story",
    heading: "Hospitality of unhurried detail",
    paragraphs: [
      "Marlo Hotels was composed with one intention: that you feel the mountains before you see them. Deep forest tones, hand-carved timber and gold that catches the evening sun shape every space.",
      "From tasting tables to spa stillness and the infinity pool that pours into the horizon, ours is a hospitality of Himalayan heart and world-class execution.",
    ],
    image: { src: "", alt: "Marlo Hotels architecture" },
  },
  facilities: {
    eyebrow: "Facilities",
    heading: "Everything composed for an unhurried stay",
    items: [
      {
        title: "Concierge",
        description:
          "24/7 concierge for experiences, transfers and the valley's quietest addresses.",
      },
      {
        title: "Wellness",
        description:
          "Spa suites, thermal circuit and therapies drawn from mountain spring water.",
      },
      {
        title: "Dining",
        description:
          "Three venues — Himalayan tasting, Mediterranean terrace and late-hour cocktails.",
      },
    ],
  },
  services: {
    eyebrow: "Services",
    heading: "Anticipation, practiced daily",
    description:
      "Airport transfers, private guides, in-room dining and laundry — arranged with quiet precision.",
  },
  experience: {
    eyebrow: "The Experience",
    heading: "Arrive as a guest. Leave as if you lived here.",
    description:
      "Sunrise on the terrace, evening light on brass, and a house that remembers how you take your tea.",
  },
  gallery: {
    eyebrow: "Gallery",
    heading: "Marlo, framed",
    images: [
      { src: "", alt: "Architecture" },
      { src: "", alt: "Suite" },
      { src: "", alt: "Pool" },
    ],
  },
  cta: {
    eyebrow: "Stay with us",
    heading: "Begin your Marlo chapter",
    description: "Reserve your room and let the valley set the pace.",
    buttonText: "Check Availability",
    buttonLink: "/rooms",
  },
};

type StudioSection = Record<string, unknown>;

function sectionImage(section: StudioSection, fallback: { src: string; alt: string }) {
  const image = section.image as { src?: string; alt?: string } | undefined;
  return {
    src: String(image?.src || fallback.src),
    alt: String(image?.alt || fallback.alt),
  };
}

export async function getAboutContent(): Promise<AboutContent> {
  const db = getDb();
  if (!db) return defaults;
  try {
    const entry = await db.contentEntry.findUnique({
      where: { module_key: { module: "about", key: "page-studio" } },
    });
    if (!entry?.data || typeof entry.data !== "object") return defaults;
    const data = entry.data as Record<string, StudioSection>;
    const section = (key: string) => data[key] || {};

    const storyDescription = String(
      section("story").description || defaults.story.paragraphs.join("\n\n")
    );
    const storyParagraphs = storyDescription
      .split(/\n\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      hero: {
        eyebrow: String(section("hero").eyebrow || defaults.hero.eyebrow),
        heading: String(section("hero").heading || defaults.hero.heading),
        description: String(
          section("hero").description || defaults.hero.description
        ),
        image: sectionImage(section("hero"), defaults.hero.image),
      },
      story: {
        eyebrow: String(section("story").eyebrow || defaults.story.eyebrow),
        heading: String(section("story").heading || defaults.story.heading),
        paragraphs: storyParagraphs.length
          ? storyParagraphs
          : defaults.story.paragraphs,
        image: sectionImage(section("story"), defaults.story.image),
      },
      facilities: {
        eyebrow: String(
          section("facilities").eyebrow || defaults.facilities.eyebrow
        ),
        heading: String(
          section("facilities").heading || defaults.facilities.heading
        ),
        items: defaults.facilities.items.map((item, index) => ({
          title: item.title,
          description:
            String(section("facilities").description || "")
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)[index] || item.description,
        })),
      },
      services: {
        eyebrow: String(section("services").eyebrow || defaults.services.eyebrow),
        heading: String(section("services").heading || defaults.services.heading),
        description: String(
          section("services").description || defaults.services.description
        ),
      },
      experience: {
        eyebrow: String(
          section("experience").eyebrow || defaults.experience.eyebrow
        ),
        heading: String(
          section("experience").heading || defaults.experience.heading
        ),
        description: String(
          section("experience").description || defaults.experience.description
        ),
      },
      gallery: {
        eyebrow: String(section("gallery").eyebrow || defaults.gallery.eyebrow),
        heading: String(section("gallery").heading || defaults.gallery.heading),
        images: [
          sectionImage(section("gallery"), defaults.gallery.images[0]),
          ...defaults.gallery.images.slice(1),
        ],
      },
      cta: {
        eyebrow: String(section("cta").eyebrow || defaults.cta.eyebrow),
        heading: String(section("cta").heading || defaults.cta.heading),
        description: String(
          section("cta").description || defaults.cta.description
        ),
        buttonText: String(
          section("cta").buttonText || defaults.cta.buttonText
        ),
        buttonLink: String(
          section("cta").buttonLink || defaults.cta.buttonLink
        ),
      },
    };
  } catch {
    return defaults;
  }
}
