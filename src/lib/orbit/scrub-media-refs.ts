import "server-only";

import { getDb } from "@/lib/db";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Recursively clear image/video references that point at a deleted media asset
 * so homepage JSON never keeps stale URLs after delete.
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

/** Scrub deleted asset from homepage visual-editor (+ legacy hero) content entries. */
export async function scrubDeletedMediaFromContent(options: {
  assetId: string;
  url: string;
}) {
  const db = getDb();
  if (!db) return { scrubbed: 0 };

  const entries = await db.contentEntry.findMany({
    where: {
      OR: [
        { module: "homepage", key: "visual-editor" },
        { module: "homepage", key: "hero" },
      ],
    },
  });

  let scrubbed = 0;
  for (const entry of entries) {
    const { next, changed } = scrubMediaRefsInJson(entry.data, {
      assetId: options.assetId,
      urls: [options.url],
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
