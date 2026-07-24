import "server-only";

import { getDb } from "@/lib/db";
import { getPlacement } from "@/lib/orbit/media";
import {
  PAYMENT_METHODS,
  type PaymentLogoMark,
  type PaymentMethodKey,
} from "@/components/shared/payment-marks";

export type BrandSettings = {
  logoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
};

export type PaymentLogoSettings = {
  marks: PaymentLogoMark[];
};

const brandDefaults: BrandSettings = {
  logoUrl: "/images/brand/logo.png",
  footerLogoUrl: "/images/brand/logo.png",
  faviconUrl: "/images/brand/logo.png",
};

function defaultPaymentMarks(): PaymentLogoMark[] {
  return PAYMENT_METHODS.map((item) => ({
    key: item.key,
    label: item.label,
    src: item.defaultSrc,
    assetId: null,
    version: 1,
  }));
}

export async function getBrandSettings(): Promise<BrandSettings> {
  const db = getDb();
  const [logo, footerLogo, favicon] = await Promise.all([
    getPlacement("brand.logo", { src: brandDefaults.logoUrl, alt: "Marlo Hotels" }),
    getPlacement("brand.footerLogo", {
      src: brandDefaults.footerLogoUrl,
      alt: "Marlo Hotels",
    }),
    getPlacement("brand.favicon", {
      src: brandDefaults.faviconUrl,
      alt: "Marlo Hotels",
    }),
  ]);

  const fromPlacements: BrandSettings = {
    logoUrl: logo.src || brandDefaults.logoUrl,
    footerLogoUrl: footerLogo.src || brandDefaults.footerLogoUrl,
    faviconUrl: favicon.src || brandDefaults.faviconUrl,
  };

  if (!db) return fromPlacements;
  try {
    const entry = await db.contentEntry.findFirst({
      where: { module: "site-settings", status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      select: { data: true },
    });
    if (!entry || typeof entry.data !== "object" || !entry.data) {
      return fromPlacements;
    }
    const data = entry.data as Record<string, unknown>;
    return {
      logoUrl:
        typeof data.logoUrl === "string" && data.logoUrl
          ? data.logoUrl
          : fromPlacements.logoUrl,
      footerLogoUrl:
        typeof data.footerLogoUrl === "string" && data.footerLogoUrl
          ? data.footerLogoUrl
          : fromPlacements.footerLogoUrl,
      faviconUrl:
        typeof data.faviconUrl === "string" && data.faviconUrl
          ? data.faviconUrl
          : fromPlacements.faviconUrl,
    };
  } catch {
    return fromPlacements;
  }
}

export async function getPaymentLogoSettings(): Promise<PaymentLogoSettings> {
  const db = getDb();

  const placements = await Promise.all(
    PAYMENT_METHODS.map((item) =>
      getPlacement(`brand.payment.${item.key}`, {
        src: item.defaultSrc,
        alt: item.label,
      })
    )
  );

  const fromPlacements = PAYMENT_METHODS.map((item, index) => ({
    key: item.key,
    label: item.label,
    src: placements[index]?.src || item.defaultSrc,
    assetId: placements[index]?.id ?? null,
    version: 1,
  }));

  if (!db) return { marks: fromPlacements };

  try {
    const entry = await db.contentEntry.findUnique({
      where: {
        module_key: { module: "site-settings", key: "payment-methods" },
      },
      select: { data: true },
    });
    if (!entry?.data || typeof entry.data !== "object") {
      return { marks: fromPlacements };
    }
    const data = entry.data as {
      logos?: Record<
        string,
        { src?: string; assetId?: string | null; version?: number }
      >;
    };
    const logos = data.logos || {};
    return {
      marks: PAYMENT_METHODS.map((item, index) => {
        const saved = logos[item.key];
        const src =
          typeof saved?.src === "string" && saved.src
            ? saved.src
            : fromPlacements[index].src;
        return {
          key: item.key as PaymentMethodKey,
          label: item.label,
          src,
          assetId: saved?.assetId ?? fromPlacements[index].assetId,
          version: Number(saved?.version || 1),
        };
      }),
    };
  } catch {
    return { marks: fromPlacements };
  }
}

export { defaultPaymentMarks };
