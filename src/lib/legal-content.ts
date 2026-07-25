import "server-only";

import { getDb } from "@/lib/db";
import { siteConfig } from "@/lib/site";

export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalPageContent = {
  cover: {
    src: string;
    alt: string;
    assetId: string | null;
    eyebrow: string;
    title: string;
    description: string;
  };
  sections: {
    privacy: LegalSection;
    terms: LegalSection;
    cancellation: LegalSection;
    cookies: LegalSection;
  };
};

export function getLegalDefaults(): LegalPageContent {
  return {
    cover: {
      src: "",
      alt: "Marlo Hotels legal",
      assetId: null,
      eyebrow: "Legal",
      title: "Policies & guest commitments",
      description:
        "Transparent terms for your stay — privacy, booking conditions, cancellations and cookies.",
    },
    sections: {
      privacy: {
        heading: "Privacy Policy",
        body: [
          `${siteConfig.name} ("we", "our") respects your privacy. This policy explains how we collect, use and protect personal information when you visit our website, make an enquiry or complete a reservation.`,
          "We may collect identity and contact details, stay preferences, payment references processed by our payment partners, and technical data such as device type and approximate location for security and performance.",
          "Information is used to fulfil bookings, respond to enquiries, improve our services, and meet legal obligations. We do not sell personal data. Access is limited to authorised staff and trusted processors under confidentiality agreements.",
          `To request access, correction or deletion of your data, contact ${siteConfig.contact.email}.`,
        ].join("\n\n"),
      },
      terms: {
        heading: "Terms & Conditions",
        body: [
          `By using this website or confirming a reservation with ${siteConfig.name}, you agree to these terms. Rates, room types and inclusions are as stated at the time of booking and may vary by season, length of stay and promotional code.`,
          "Guests are responsible for providing accurate booking details and for complying with hotel house rules, including quiet hours, occupancy limits and responsible use of facilities. We reserve the right to refuse or terminate a stay in cases of misconduct or safety risk, without refund where warranted.",
          "Website content is provided for general information. Images and descriptions are illustrative; exact room assignments and views are confirmed on arrival subject to availability.",
          `These terms are governed by the laws of Nepal. For booking questions, write to ${siteConfig.contact.reservationsEmail}.`,
        ].join("\n\n"),
      },
      cancellation: {
        heading: "Cancellation Policy",
        body: [
          "Cancellation terms depend on the rate selected at booking. Flexible rates typically allow complimentary cancellation until 48 hours before arrival (local hotel time). Advance purchase, promotional and package rates may be non-refundable or carry a fee — the confirmation email states the exact policy for your reservation.",
          "No-shows and early departures may be charged according to the reserved rate. Modifications are subject to availability and may affect price.",
          "To change or cancel, contact reservations promptly with your confirmation number. Force majeure events are reviewed case by case with fairness to the guest.",
        ].join("\n\n"),
      },
      cookies: {
        heading: "Cookie Settings",
        body: [
          "We use essential cookies to operate secure booking sessions and remember basic preferences. Analytics cookies — when enabled — help us understand how guests use the site so we can improve performance and content.",
          `You can control non-essential cookies through your browser settings. Blocking essential cookies may prevent completing a reservation online; our reservations team remains available by phone at ${siteConfig.contact.reservations}.`,
          "Continued use of the site with cookies enabled constitutes acceptance of this cookie notice, alongside our Privacy Policy.",
        ].join("\n\n"),
      },
    },
  };
}

function mergeLegal(
  base: LegalPageContent,
  patch: Partial<LegalPageContent> | null | undefined
): LegalPageContent {
  if (!patch) return base;
  return {
    cover: { ...base.cover, ...patch.cover },
    sections: {
      privacy: { ...base.sections.privacy, ...patch.sections?.privacy },
      terms: { ...base.sections.terms, ...patch.sections?.terms },
      cancellation: {
        ...base.sections.cancellation,
        ...patch.sections?.cancellation,
      },
      cookies: { ...base.sections.cookies, ...patch.sections?.cookies },
    },
  };
}

export async function getLegalContent(): Promise<LegalPageContent> {
  const defaults = getLegalDefaults();
  const db = getDb();
  if (!db) return defaults;
  try {
    const [entry, placement] = await Promise.all([
      db.contentEntry.findUnique({
        where: { module_key: { module: "legal", key: "page-content" } },
        select: { data: true },
      }),
      db.mediaPlacement.findUnique({
        where: { key: "page.legal.hero" },
        include: {
          asset: { select: { url: true, alt: true, deletedAt: true } },
        },
      }),
    ]);
    const merged = mergeLegal(
      defaults,
      entry?.data && typeof entry.data === "object"
        ? (entry.data as Partial<LegalPageContent>)
        : null
    );
    if (!merged.cover.src && placement?.asset && !placement.asset.deletedAt) {
      merged.cover.src = placement.asset.url;
      merged.cover.alt = merged.cover.alt || placement.asset.alt || "";
    }
    return merged;
  } catch {
    return defaults;
  }
}
