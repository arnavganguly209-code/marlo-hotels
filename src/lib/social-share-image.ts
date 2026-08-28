/** Static share image synced with the live homepage hero (reception still). */
export const SOCIAL_SHARE_IMAGE_PATH = "/images/brand/social-share.jpg";

/** Bump when the hero share image changes to bust WhatsApp / Facebook cache. */
export const SOCIAL_SHARE_IMAGE_VERSION = "20260828";

export function socialShareImageUrl(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${SOCIAL_SHARE_IMAGE_PATH}?v=${SOCIAL_SHARE_IMAGE_VERSION}`;
}
