import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/db";
import {
  checksumBuffer,
  ensureMediaRoot,
  IMAGE_MIME_TYPES,
  kindForMime,
  maxImageBytes,
  mediaRoot,
  normalizeUploadMime,
  storeOriginalUpload,
} from "@/lib/orbit/media-storage";

const IMAGE_URL_RE =
  /^(https?:\/\/|\/media\/|\/images\/|\/uploads\/).+\.(jpe?g|png|webp|avif|gif|svg)(\?.*)?$/i;
const MEDIA_URL_RE = /^\/media\/[a-z0-9/_-]+\.[a-z0-9]+(\?.*)?$/i;

function stripQuery(url: string) {
  return url.split("?")[0] || url;
}

function folderForUrl(url: string, hint?: string) {
  if (hint) return hint;
  const clean = stripQuery(url).toLowerCase();
  if (clean.startsWith("/media/")) {
    const parts = clean.replace(/^\/media\//, "").split("/");
    return parts[0] || "general";
  }
  if (clean.includes("/rooms")) return "rooms";
  if (clean.includes("/dining")) return "dining";
  if (clean.includes("/spa")) return "spa";
  if (clean.includes("/gallery")) return "gallery";
  if (clean.includes("/blog")) return "blog";
  if (clean.includes("/offers")) return "offers";
  if (clean.includes("/experiences")) return "experiences";
  if (clean.includes("/contact")) return "contact";
  if (clean.includes("/legal")) return "legal";
  if (clean.includes("/booking")) return "booking";
  if (clean.includes("/brand") || clean.includes("/payments")) return "brand";
  if (clean.includes("/hero")) return "hero";
  return "general";
}

function collectImageUrls(value: unknown, out: Set<string>) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (IMAGE_URL_RE.test(trimmed) || MEDIA_URL_RE.test(trimmed)) {
      out.add(stripQuery(trimmed));
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImageUrls(item, out);
    return;
  }
  if (value && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectImageUrls(nested, out);
    }
  }
}

async function walkLocalImages(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkLocalImages(full)));
      continue;
    }
    if (/\.(jpe?g|png|webp|avif|gif|svg)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function ensureAssetFromBuffer(options: {
  buffer: Buffer;
  originalName: string;
  folder: string;
  alt?: string;
  urlHint?: string;
}): Promise<{ id: string; created: boolean } | null> {
  const db = getDb();
  if (!db) return null;

  const mimeType = normalizeUploadMime(null, options.originalName);
  if (!IMAGE_MIME_TYPES.has(mimeType) && !mimeType.startsWith("image/")) {
    return null;
  }
  if (options.buffer.byteLength > maxImageBytes()) return null;

  const checksum = checksumBuffer(options.buffer);
  const byChecksum = await db.mediaAsset.findFirst({
    where: { checksum, deletedAt: null },
    select: { id: true },
  });
  if (byChecksum) return { id: byChecksum.id, created: false };

  if (options.urlHint) {
    const byUrl = await db.mediaAsset.findFirst({
      where: { url: stripQuery(options.urlHint), deletedAt: null },
      select: { id: true },
    });
    if (byUrl) return { id: byUrl.id, created: false };
  }

  const stored = await storeOriginalUpload({
    buffer: options.buffer,
    mimeType,
    originalName: options.originalName,
    folder: options.folder,
  });

  const created = await db.mediaAsset.create({
    data: {
      filename: stored.filename,
      originalName: stored.originalName,
      url: stored.url,
      mimeType: stored.mimeType,
      kind: kindForMime(stored.mimeType) || "IMAGE",
      size: stored.size,
      width: stored.width,
      height: stored.height,
      alt: options.alt || options.originalName,
      title: options.originalName,
      folder: options.folder,
      checksum: stored.checksum,
      versions: {
        create: {
          version: 1,
          filename: stored.filename,
          originalName: stored.originalName,
          url: stored.url,
          mimeType: stored.mimeType,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          checksum: stored.checksum,
          isOriginal: true,
        },
      },
    },
    select: { id: true },
  });

  return { id: created.id, created: true };
}

async function importUrl(
  url: string,
  folderHint?: string
): Promise<{ id: string; created: boolean } | null> {
  const db = getDb();
  if (!db) return null;
  const clean = stripQuery(url);

  const existing = await db.mediaAsset.findFirst({
    where: {
      deletedAt: null,
      OR: [{ url: clean }, { url: { startsWith: `${clean}?` } }],
    },
    select: { id: true },
  });
  if (existing) return { id: existing.id, created: false };

  const folder = folderForUrl(clean, folderHint);

  if (clean.startsWith("/images/") || clean.startsWith("/uploads/")) {
    try {
      const buffer = await readFile(
        path.join(process.cwd(), "public", clean.replace(/^\//, ""))
      );
      return ensureAssetFromBuffer({
        buffer,
        originalName: path.basename(clean),
        folder,
        alt: path.basename(clean),
        urlHint: clean,
      });
    } catch {
      return null;
    }
  }

  if (clean.startsWith("/media/")) {
    const relative = clean.replace(/^\/media\//, "");
    for (const absolute of [
      path.join(mediaRoot(), relative),
      path.join(process.cwd(), "public", "media", relative),
    ]) {
      try {
        const buffer = await readFile(absolute);
        return ensureAssetFromBuffer({
          buffer,
          originalName: path.basename(clean),
          folder,
          alt: path.basename(clean),
          urlHint: clean,
        });
      } catch {
        // try next candidate
      }
    }
    return null;
  }

  if (!/^https?:\/\//i.test(clean)) return null;

  try {
    const response = await fetch(clean, {
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) return null;
    const mimeType = normalizeUploadMime(
      response.headers.get("content-type"),
      path.basename(clean) || "remote.jpg"
    );
    if (!IMAGE_MIME_TYPES.has(mimeType) && !mimeType.startsWith("image/")) {
      return null;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const name =
      path.basename(new URL(clean).pathname).replace(/[^\w.-]+/g, "-") ||
      "site-image.jpg";
    return ensureAssetFromBuffer({
      buffer,
      originalName: name,
      folder,
      alt: name,
    });
  } catch {
    return null;
  }
}

/**
 * Import every image currently referenced by the live site into Media Library.
 * Idempotent — safe to run from Media Library Sync.
 */
export async function syncSiteMediaIntoLibrary(): Promise<{
  imported: number;
  scanned: number;
}> {
  const db = getDb();
  if (!db) {
    return { imported: 0, scanned: 0 };
  }

  await ensureMediaRoot();

  const urls = new Set<string>();
  let imported = 0;

  const imagesRoot = path.join(process.cwd(), "public", "images");
  for (const file of await walkLocalImages(imagesRoot)) {
    const relative = path
      .relative(path.join(process.cwd(), "public"), file)
      .replace(/\\/g, "/");
    urls.add(`/${relative}`);
  }

  const entries = await db.contentEntry.findMany({
    select: { data: true, seo: true },
    take: 2000,
  });
  for (const entry of entries) {
    collectImageUrls(entry.data, urls);
    collectImageUrls(entry.seo, urls);
  }

  const [images, offers, posts] = await Promise.all([
    db.image.findMany({ select: { url: true }, take: 2000 }).catch(() => []),
    db.offer.findMany({ select: { imageUrl: true }, take: 500 }).catch(() => []),
    db.post.findMany({ select: { imageUrl: true }, take: 500 }).catch(() => []),
  ]);
  for (const image of images) {
    if (image.url) urls.add(stripQuery(image.url));
  }
  for (const offer of offers) {
    if (offer.imageUrl) urls.add(stripQuery(offer.imageUrl));
  }
  for (const post of posts) {
    if (post.imageUrl) urls.add(stripQuery(post.imageUrl));
  }

  const folderHintByToken: Array<[string, string]> = [
    ["rooms", "rooms"],
    ["dining", "dining"],
    ["spa", "spa"],
    ["gallery", "gallery"],
    ["experiences", "experiences"],
    ["offers", "offers"],
    ["booking", "booking"],
    ["contact", "contact"],
    ["blog", "blog"],
    ["legal", "legal"],
    ["hero", "hero"],
    ["home", "hero"],
  ];

  for (const url of urls) {
    const lower = url.toLowerCase();
    const hint =
      folderHintByToken.find(([token]) => lower.includes(token))?.[1] ||
      undefined;
    const result = await importUrl(url, hint).catch(() => null);
    if (result?.created) imported += 1;
  }

  return { imported, scanned: urls.size };
}
