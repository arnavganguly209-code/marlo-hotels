import { Prisma } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import type { StoredMediaFile } from "@/lib/orbit/media-storage";

type DbClient = PrismaClient | Prisma.TransactionClient;

const assetInclude = {
  _count: { select: { placements: true } },
  placements: { select: { key: true, label: true } },
} as const;

export type PersistedMediaAsset = Prisma.MediaAssetGetPayload<{
  include: typeof assetInclude;
}>;

export type PersistMediaMeta = {
  alt?: string;
  title?: string | null;
  caption?: string | null;
  focalX?: number;
  focalY?: number;
  durationMs?: number | null;
  createdBy?: string | null;
};

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function loadAsset(
  db: DbClient,
  id: string
): Promise<PersistedMediaAsset> {
  return db.mediaAsset.findUniqueOrThrow({
    where: { id },
    include: assetInclude,
  });
}

/**
 * Idempotent create for a freshly stored upload.
 * Never inserts a second MediaAsset/MediaVersion row for the same URL.
 */
export async function persistNewMediaAsset(
  db: DbClient,
  stored: StoredMediaFile,
  meta: PersistMediaMeta = {}
): Promise<{ asset: PersistedMediaAsset; created: boolean }> {
  const alt = (meta.alt ?? "").slice(0, 500);
  const title =
    meta.title === undefined ? null : meta.title?.slice(0, 240) || null;
  const caption =
    meta.caption === undefined ? null : meta.caption?.slice(0, 1000) || null;
  const focalX = Number.isFinite(meta.focalX) ? Number(meta.focalX) : 50;
  const focalY = Number.isFinite(meta.focalY) ? Number(meta.focalY) : 50;
  const folder = stored.url.split("/")[2] || "general";
  const durationMs = meta.durationMs ?? stored.durationMs;

  const byUrl = await db.mediaAsset.findUnique({
    where: { url: stored.url },
    include: assetInclude,
  });

  if (byUrl) {
    if (byUrl.deletedAt) {
      const restored = await db.mediaAsset.update({
        where: { id: byUrl.id },
        data: {
          filename: stored.filename,
          originalName: stored.originalName,
          mimeType: stored.mimeType,
          kind: stored.kind,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          durationMs,
          alt: alt || byUrl.alt,
          title: title ?? byUrl.title,
          caption: caption ?? byUrl.caption,
          folder,
          checksum: stored.checksum,
          focalX,
          focalY,
          deletedAt: null,
          currentVersion: Math.max(1, byUrl.currentVersion || 1),
        },
        include: assetInclude,
      });
      const version = await db.mediaVersion.findFirst({
        where: { url: stored.url },
      });
      if (!version) {
        await db.mediaVersion.create({
          data: {
            assetId: restored.id,
            version: restored.currentVersion || 1,
            filename: stored.filename,
            originalName: stored.originalName,
            url: stored.url,
            mimeType: stored.mimeType,
            size: stored.size,
            width: stored.width,
            height: stored.height,
            durationMs,
            checksum: stored.checksum,
            isOriginal: true,
            createdBy: meta.createdBy ?? undefined,
          },
        });
      }
      return { asset: restored, created: false };
    }

    // Active row already owns this URL — reuse (retry / double-submit).
    return { asset: byUrl, created: false };
  }

  const versionOwner = await db.mediaVersion.findUnique({
    where: { url: stored.url },
    select: { assetId: true },
  });
  if (versionOwner) {
    const existing = await loadAsset(db, versionOwner.assetId);
    if (existing.deletedAt) {
      const restored = await db.mediaAsset.update({
        where: { id: existing.id },
        data: {
          filename: stored.filename,
          originalName: stored.originalName,
          url: stored.url,
          mimeType: stored.mimeType,
          kind: stored.kind,
          size: stored.size,
          width: stored.width,
          height: stored.height,
          durationMs,
          alt: alt || existing.alt,
          title: title ?? existing.title,
          caption: caption ?? existing.caption,
          folder,
          checksum: stored.checksum,
          focalX,
          focalY,
          deletedAt: null,
        },
        include: assetInclude,
      });
      return { asset: restored, created: false };
    }
    return { asset: existing, created: false };
  }

  const byChecksum = await db.mediaAsset.findFirst({
    where: { checksum: stored.checksum, deletedAt: null },
    include: assetInclude,
  });
  if (byChecksum) {
    return { asset: byChecksum, created: false };
  }

  try {
    const created = await db.mediaAsset.create({
      data: {
        filename: stored.filename,
        originalName: stored.originalName,
        url: stored.url,
        mimeType: stored.mimeType,
        kind: stored.kind,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        durationMs,
        alt,
        title,
        caption,
        folder,
        checksum: stored.checksum,
        focalX,
        focalY,
        currentVersion: 1,
        createdBy: meta.createdBy ?? undefined,
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
            durationMs,
            checksum: stored.checksum,
            isOriginal: true,
            createdBy: meta.createdBy ?? undefined,
          },
        },
      },
      include: assetInclude,
    });
    return { asset: created, created: true };
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    // Race: another request won the insert — reuse whatever owns the URL now.
    const raced = await db.mediaAsset.findUnique({
      where: { url: stored.url },
      include: assetInclude,
    });
    if (raced) {
      if (raced.deletedAt) {
        const restored = await db.mediaAsset.update({
          where: { id: raced.id },
          data: { deletedAt: null, checksum: stored.checksum },
          include: assetInclude,
        });
        return { asset: restored, created: false };
      }
      return { asset: raced, created: false };
    }
    const viaVersion = await db.mediaVersion.findUnique({
      where: { url: stored.url },
      select: { assetId: true },
    });
    if (viaVersion) {
      return { asset: await loadAsset(db, viaVersion.assetId), created: false };
    }
    throw error;
  }
}

/**
 * Replace an existing asset with a newly stored file.
 * If the stored URL already belongs to this asset (same bytes re-upload),
 * update in place without inserting a conflicting MediaVersion row.
 */
export async function persistReplacedMediaAsset(
  db: DbClient,
  replaceId: string,
  stored: StoredMediaFile,
  meta: PersistMediaMeta = {}
): Promise<PersistedMediaAsset> {
  const existing = await db.mediaAsset.findUnique({
    where: { id: replaceId },
  });
  if (!existing) {
    throw new Error("Asset to replace was not found.");
  }

  const alt = (meta.alt ?? "").slice(0, 500);
  const title =
    meta.title === undefined ? null : meta.title?.slice(0, 240) || null;
  const caption =
    meta.caption === undefined ? null : meta.caption?.slice(0, 1000) || null;
  const focalX = Number.isFinite(meta.focalX)
    ? Number(meta.focalX)
    : existing.focalX;
  const focalY = Number.isFinite(meta.focalY)
    ? Number(meta.focalY)
    : existing.focalY;
  const folder = stored.url.split("/")[2] || existing.folder;
  const durationMs = meta.durationMs ?? stored.durationMs;

  const urlOwner = await db.mediaAsset.findUnique({
    where: { url: stored.url },
    select: { id: true },
  });
  const versionOwner = await db.mediaVersion.findUnique({
    where: { url: stored.url },
    select: { assetId: true, version: true },
  });

  // Same URL already on this asset (identical re-upload / retry).
  if (
    existing.url === stored.url ||
    urlOwner?.id === replaceId ||
    versionOwner?.assetId === replaceId
  ) {
    return db.mediaAsset.update({
      where: { id: replaceId },
      data: {
        filename: stored.filename,
        originalName: stored.originalName,
        url: stored.url,
        mimeType: stored.mimeType,
        kind: stored.kind,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        durationMs,
        alt: alt || existing.alt,
        title: title ?? existing.title,
        caption: caption ?? existing.caption,
        folder,
        checksum: stored.checksum,
        focalX,
        focalY,
        deletedAt: null,
      },
      include: assetInclude,
    });
  }

  if (urlOwner && urlOwner.id !== replaceId) {
    throw new Error(
      "This file URL is already used by another media asset. Choose a different file or replace that asset instead."
    );
  }

  if (versionOwner && versionOwner.assetId !== replaceId) {
    throw new Error(
      "This file URL belongs to another media version. Choose a different file."
    );
  }

  const nextVersion = (existing.currentVersion || 1) + 1;
  try {
    await db.mediaVersion.create({
      data: {
        assetId: existing.id,
        version: nextVersion,
        filename: stored.filename,
        originalName: stored.originalName,
        url: stored.url,
        mimeType: stored.mimeType,
        size: stored.size,
        width: stored.width,
        height: stored.height,
        durationMs,
        checksum: stored.checksum,
        isOriginal: true,
        createdBy: meta.createdBy ?? undefined,
      },
    });
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    // Version URL race — fall through to asset update only.
  }

  return db.mediaAsset.update({
    where: { id: replaceId },
    data: {
      filename: stored.filename,
      originalName: stored.originalName,
      url: stored.url,
      mimeType: stored.mimeType,
      kind: stored.kind,
      size: stored.size,
      width: stored.width,
      height: stored.height,
      durationMs,
      alt: alt || existing.alt,
      title: title ?? existing.title,
      caption: caption ?? existing.caption,
      folder,
      checksum: stored.checksum,
      focalX,
      focalY,
      currentVersion: nextVersion,
      deletedAt: null,
    },
    include: assetInclude,
  });
}
