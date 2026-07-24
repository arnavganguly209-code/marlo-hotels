import "server-only";

import { getDb } from "@/lib/db";
import { removeMediaFile } from "@/lib/orbit/media-storage";
import { writeAuditLog } from "@/lib/orbit/auth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Recursively clear image/video references that point at a deleted media asset
 * so content JSON never keeps stale URLs after delete.
 */
export function scrubMediaRefsInJson(
  value: unknown,
  options: { assetId: string; urls: string[] }
): { next: unknown; changed: boolean } {
  const urlSet = new Set(
    options.urls
      .filter(Boolean)
      .map((url) => url.split("?")[0])
      .filter(Boolean)
  );

  let changed = false;

  function visit(node: unknown): unknown {
    if (Array.isArray(node)) {
      return node.map(visit);
    }
    if (!isRecord(node)) return node;

    const next: Record<string, unknown> = { ...node };

    if ("assetId" in next && next.assetId === options.assetId) {
      next.assetId = null;
      if ("src" in next) next.src = "";
      changed = true;
    }
    if ("videoAssetId" in next && next.videoAssetId === options.assetId) {
      next.videoAssetId = null;
      next.videoUrl = "";
      changed = true;
    }
    if (
      "mobileVideoAssetId" in next &&
      next.mobileVideoAssetId === options.assetId
    ) {
      next.mobileVideoAssetId = null;
      next.mobileVideoUrl = "";
      changed = true;
    }

    for (const key of [
      "src",
      "url",
      "videoUrl",
      "mobileVideoUrl",
      "posterUrl",
      "logoUrl",
      "footerLogoUrl",
      "faviconUrl",
      "coverUrl",
      "imageUrl",
    ] as const) {
      const raw = next[key];
      if (typeof raw === "string" && urlSet.has(raw.split("?")[0])) {
        next[key] = "";
        if (key === "src" && "assetId" in next) next.assetId = null;
        if (key === "videoUrl" && "videoAssetId" in next) {
          next.videoAssetId = null;
        }
        if (key === "mobileVideoUrl" && "mobileVideoAssetId" in next) {
          next.mobileVideoAssetId = null;
        }
        changed = true;
      }
    }

    for (const [key, child] of Object.entries(next)) {
      if (child && typeof child === "object") {
        next[key] = visit(child);
      }
    }

    return next;
  }

  return { next: visit(value), changed };
}

/** Scrub deleted asset from every content entry across Orbit modules. */
export async function scrubDeletedMediaFromContent(options: {
  assetId: string;
  url: string;
  extraUrls?: string[];
}) {
  const db = getDb();
  if (!db) return { scrubbed: 0 };

  const entries = await db.contentEntry.findMany({
    select: { id: true, data: true, module: true, key: true },
  });

  const urls = [options.url, ...(options.extraUrls || [])];
  let scrubbed = 0;
  for (const entry of entries) {
    const { next, changed } = scrubMediaRefsInJson(entry.data, {
      assetId: options.assetId,
      urls,
    });
    if (!changed) continue;
    await db.contentEntry.update({
      where: { id: entry.id },
      data: {
        data: next as object,
        updatedAt: new Date(),
      },
    });
    scrubbed += 1;
  }

  return { scrubbed };
}

function contentReferencesAsset(
  data: unknown,
  assetId: string,
  url: string
): boolean {
  const raw = JSON.stringify(data || {});
  const bare = url.split("?")[0];
  return raw.includes(assetId) || (bare ? raw.includes(bare) : false);
}

/**
 * Permanently remove media assets that are no longer referenced by placements
 * or any content entry JSON.
 */
export async function cleanupUnreferencedMedia(options?: {
  excludeIds?: string[];
  limit?: number;
}) {
  const db = getDb();
  if (!db) return { removed: 0, ids: [] as string[] };

  const candidates = await db.mediaAsset.findMany({
    where: {
      deletedAt: null,
      placements: { none: {} },
      ...(options?.excludeIds?.length
        ? { id: { notIn: options.excludeIds } }
        : {}),
    },
    take: options?.limit ?? 200,
    include: { versions: true },
  });

  if (!candidates.length) return { removed: 0, ids: [] as string[] };

  const entries = await db.contentEntry.findMany({
    select: { data: true },
  });

  const removedIds: string[] = [];
  for (const asset of candidates) {
    const referenced = entries.some((entry) =>
      contentReferencesAsset(entry.data, asset.id, asset.url)
    );
    if (referenced) continue;

    for (const version of asset.versions) {
      await removeMediaFile(version.url);
    }
    if (asset.posterUrl) await removeMediaFile(asset.posterUrl);
    await removeMediaFile(asset.url);
    await db.mediaAsset.delete({ where: { id: asset.id } }).catch(() => null);
    removedIds.push(asset.id);
  }

  if (removedIds.length) {
    await writeAuditLog({
      action: "CLEANUP_UNREFERENCED_MEDIA",
      module: "media-library",
      summary: `Removed ${removedIds.length} unreferenced media asset(s)`,
      metadata: { ids: removedIds },
    });
  }

  return { removed: removedIds.length, ids: removedIds };
}
