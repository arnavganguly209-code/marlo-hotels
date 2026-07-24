import "server-only";

import { getDb } from "@/lib/db";
import type { EditableImage } from "@/lib/homepage-content";
import { siteConfig } from "@/lib/site";

export type ContactPageContent = {
  cover: {
    image: EditableImage;
    eyebrow: string;
    headline: string;
    subheading: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
  details: {
    hotelName: string;
    address: string;
    phone: string;
    reservationsPhone: string;
    whatsapp: string;
    reservationsEmail: string;
    generalEmail: string;
    businessHours: string;
    frontDeskHours: string;
    conciergeHours: string;
  };
  form: {
    eyebrow: string;
    heading: string;
    description: string;
    successTitle: string;
    successMessage: string;
    errorMessage: string;
    buttonText: string;
  };
  map: {
    lat: number;
    lng: number;
    zoom: number;
    mapUrl: string;
    previewImage: EditableImage;
  };
  seo: {
    title: string;
    description: string;
  };
};

function emptyImage(alt = ""): EditableImage {
  return { assetId: null, src: "", alt, title: alt, focalX: 50, focalY: 50 };
}

export function getContactDefaults(): ContactPageContent {
  return {
    cover: {
      image: {
        assetId: null,
        src: "https://images.unsplash.com/photo-1455587734955-081b22074882?q=80&w=2400&auto=format&fit=crop",
        alt: "The warm lights of the Marlo lobby at evening",
        title: "Contact Cover",
        focalX: 50,
        focalY: 50,
      },
      eyebrow: "Contact",
      headline: "We are at your service",
      subheading: "",
      description:
        "Reservations, celebrations, dining or a question about the valley — the concierge desk answers around the clock.",
      buttonText: "Reserve a stay",
      buttonLink: "/booking",
    },
    details: {
      hotelName: siteConfig.name,
      address: siteConfig.contact.address,
      phone: siteConfig.contact.phone,
      reservationsPhone: siteConfig.contact.reservations,
      whatsapp: siteConfig.contact.whatsapp,
      reservationsEmail: siteConfig.contact.reservationsEmail,
      generalEmail: siteConfig.contact.email,
      businessHours: `Front desk · ${siteConfig.hours.frontDesk}\nConcierge · ${siteConfig.hours.concierge}`,
      frontDeskHours: siteConfig.hours.frontDesk,
      conciergeHours: siteConfig.hours.concierge,
    },
    form: {
      eyebrow: "Write To Us",
      heading: "Begin the conversation",
      description:
        "Tell us about your stay, your celebration or your question — a member of our team replies within one working day.",
      successTitle: "Thank you for writing",
      successMessage:
        "Your message has reached our team. A member of the concierge desk will reply within one working day.",
      errorMessage:
        "We could not send your message. Please try again or call the concierge desk.",
      buttonText: "Send Message",
    },
    map: {
      lat: siteConfig.contact.geo.lat,
      lng: siteConfig.contact.geo.lng,
      zoom: 15,
      mapUrl: siteConfig.contact.mapUrl,
      previewImage: emptyImage("Map preview"),
    },
    seo: {
      title: "Contact",
      description:
        "Reach Marlo Hotels — Durbar Marg, Kathmandu. Reservations, events, dining and concierge enquiries by phone, WhatsApp, email or our contact form.",
    },
  };
}

function mergeContact(
  base: ContactPageContent,
  patch: Partial<ContactPageContent> | null | undefined
): ContactPageContent {
  if (!patch) return base;
  return {
    cover: { ...base.cover, ...patch.cover, image: { ...base.cover.image, ...patch.cover?.image } },
    details: { ...base.details, ...patch.details },
    form: { ...base.form, ...patch.form },
    map: {
      ...base.map,
      ...patch.map,
      previewImage: { ...base.map.previewImage, ...patch.map?.previewImage },
    },
    seo: { ...base.seo, ...patch.seo },
  };
}

export async function getContactContent(): Promise<ContactPageContent> {
  const defaults = getContactDefaults();
  const db = getDb();
  if (!db) return defaults;
  try {
    const entry = await db.contentEntry.findUnique({
      where: { module_key: { module: "contact", key: "page-content" } },
      select: { data: true },
    });
    if (!entry?.data || typeof entry.data !== "object") return defaults;
    return mergeContact(defaults, entry.data as Partial<ContactPageContent>);
  } catch {
    return defaults;
  }
}
