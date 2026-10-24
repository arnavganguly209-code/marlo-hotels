const POOL_CLAIM =
  /[^.!?\n]*(infinity\s+pool|swimming\s+pool|pool\s+deck|by the pool|the pool that|heated year-round)[^.!?\n]*[.!?]?/gi;

export function stripUnverifiedPoolClaims(text: string): string {
  if (!text) return text;
  return text
    .replace(POOL_CLAIM, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,;:])/g, "$1")
    .trim();
}

export function stripUnofficialStarRating(text: string): string {
  if (!text) return text;
  return text
    .replace(/\bfive-star\s+luxury\b/gi, "luxury")
    .replace(/\b5[\s-]?star\s+luxury\b/gi, "luxury")
    .replace(/\bfive-star\b/gi, "refined")
    .replace(/\b5[\s-]?star\b/gi, "refined")
    .replace(/\b5★\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizePublicCopy(text: string): string {
  return stripUnofficialStarRating(stripUnverifiedPoolClaims(text));
}

export function mentionsUnverifiedPool(text: string): boolean {
  return /infinity\s+pool|swimming\s+pool|pool\s+deck/i.test(text);
}
