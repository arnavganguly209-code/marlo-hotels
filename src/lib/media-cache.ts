/**
 * Cache-bust a media URL so browsers never flash a previous binary
 * at the same path after replace/delete.
 */
export function withMediaCacheBust(url: string, version?: string | number) {
  if (!url) return url;
  const stamp = version ?? Date.now();
  try {
    const parsed = new URL(url, "http://local.invalid");
    parsed.searchParams.set("v", String(stamp));
    if (url.startsWith("http")) return parsed.toString();
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    const base = url.split("?")[0];
    return `${base}?v=${stamp}`;
  }
}
