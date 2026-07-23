import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import {
  ensureMediaRoot,
  IMAGE_MIME_TYPES,
  kindForMime,
  maxImageBytes,
  maxVideoBytes,
  removeMediaFile,
  storeOriginalUpload,
  VIDEO_MIME_TYPES,
} from "@/lib/orbit/media-storage";

function serializeAsset(asset: {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  kind: "IMAGE" | "VIDEO";
  size: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  alt: string;
  title: string | null;
  caption: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  folder: string;
  checksum: string;
  focalX: number;
  focalY: number;
  cropJson: Prisma.JsonValue | null;
  posterUrl: string | null;
  currentVersion: number;
  deletedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { placements: number };
  placements?: { key: string; label: string }[];
}) {
  return {
    ...asset,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString(),
    deletedAt: asset.deletedAt?.toISOString() ?? null,
    usageCount: asset._count?.placements ?? asset.placements?.length ?? 0,
    usedOn: asset.placements?.map((item) => item.label || item.key) ?? [],
  };
}

export async function GET(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const params = new URL(request.url).searchParams;
  const query = params.get("query")?.trim();
  const folder = params.get("folder")?.trim();
  const kind = params.get("kind")?.trim();
  const sort = params.get("sort") || "newest";
  const unused = params.get("unused") === "1";
  const trash = params.get("trash") === "1";
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") || 48)));

  const where: Prisma.MediaAssetWhereInput = {
    deletedAt: trash ? { not: null } : null,
    ...(folder && folder !== "all" ? { folder } : {}),
    ...(kind === "IMAGE" || kind === "VIDEO" ? { kind } : {}),
    ...(query
      ? {
          OR: [
            { originalName: { contains: query, mode: "insensitive" } },
            { alt: { contains: query, mode: "insensitive" } },
            { title: { contains: query, mode: "insensitive" } },
            { caption: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(unused ? { placements: { none: {} } } : {}),
  };

  const orderBy: Prisma.MediaAssetOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? { originalName: "asc" }
        : sort === "size"
          ? { size: "desc" }
          : { createdAt: "desc" };

  const [total, assets, folders, duplicates] = await Promise.all([
    db.mediaAsset.count({ where }),
    db.mediaAsset.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { placements: true } },
        placements: { select: { key: true, label: true } },
      },
    }),
    db.mediaAsset.findMany({
      where: { deletedAt: null },
      distinct: ["folder"],
      select: { folder: true },
      orderBy: { folder: "asc" },
    }),
    db.mediaAsset.groupBy({
      by: ["checksum"],
      where: { deletedAt: null },
      having: { checksum: { _count: { gt: 1 } } },
      _count: { checksum: true },
    }),
  ]);

  return NextResponse.json({
    assets: assets.map(serializeAsset),
    folders: folders.map((item) => item.folder),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    duplicateChecksums: duplicates.map((item) => item.checksum),
  });
}

export async function POST(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  await ensureMediaRoot();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Network Error", code: "NETWORK_ERROR" },
      { status: 400 }
    );
  }

  const duplicateId = String(form.get("duplicateId") || "");
  if (duplicateId) {
    const source = await db.mediaAsset.findUnique({ where: { id: duplicateId } });
    if (!source || source.deletedAt) {
      return NextResponse.json({ error: "Source asset not found" }, { status: 404 });
    }
    try {
      const { readFile } = await import("node:fs/promises");
      const { diskPathFromUrl } = await import("@/lib/orbit/media-storage");
      const buffer = await readFile(diskPathFromUrl(source.url));
      const stored = await storeOriginalUpload({
        buffer,
        mimeType: source.mimeType,
        originalName: `copy-${source.originalName}`,
        folder: source.folder,
      });
      const asset = await db.$transaction(async (tx) => {
        const created = await tx.mediaAsset.create({
          data: {
            filename: stored.filename,
            originalName: stored.originalName,
            url: stored.url,
            mimeType: stored.mimeType,
            kind: stored.kind,
            size: stored.size,
            width: stored.width,
            height: stored.height,
            durationMs: source.durationMs,
            alt: source.alt,
            title: source.title,
            caption: source.caption,
            seoTitle: source.seoTitle,
            seoDescription: source.seoDescription,
            folder: source.folder,
            checksum: stored.checksum,
            focalX: source.focalX,
            focalY: source.focalY,
            posterUrl: source.posterUrl,
            currentVersion: 1,
          },
        });
        await tx.mediaVersion.create({
          data: {
            assetId: created.id,
            version: 1,
            filename: stored.filename,
            originalName: stored.originalName,
            url: stored.url,
            mimeType: stored.mimeType,
            size: stored.size,
            width: stored.width,
            height: stored.height,
            durationMs: source.durationMs,
            checksum: stored.checksum,
            isOriginal: true,
          },
        });
        return tx.mediaAsset.findUniqueOrThrow({
          where: { id: created.id },
          include: {
            _count: { select: { placements: true } },
            placements: { select: { key: true, label: true } },
          },
        });
      });
      await writeAuditLog({
        action: "DUPLICATE_MEDIA",
        module: "media-library",
        entityId: asset.id,
        summary: `Duplicated ${source.originalName}`,
      });
      revalidateTag("media");
      revalidatePath("/orbit/media-library");
      return NextResponse.json({
        asset: serializeAsset(asset),
        message: "Duplicated Successfully",
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Duplicate Failed",
          code: "SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Choose a file to upload.", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const kind = kindForMime(file.type);
  if (!kind) {
    return NextResponse.json(
      {
        error: "Unsupported File. Use JPG, PNG, WebP, AVIF, MP4 or WebM.",
        code: "UNSUPPORTED_FILE",
      },
      { status: 400 }
    );
  }

  const max = kind === "IMAGE" ? maxImageBytes() : maxVideoBytes();
  if (file.size > max) {
    return NextResponse.json(
      {
        error: `Maximum Size Exceeded (${Math.round(max / 1024 / 1024)} MB).`,
        code: "MAX_SIZE",
      },
      { status: 400 }
    );
  }

  const input = Buffer.from(await file.arrayBuffer());
  let stored;
  try {
    stored = await storeOriginalUpload({
      buffer: input,
      mimeType: file.type,
      originalName: file.name,
      folder: String(form.get("folder") || "general"),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload Failed",
        code: "SERVER_ERROR",
      },
      { status: 400 }
    );
  }

  const duplicate = await db.mediaAsset.findFirst({
    where: { checksum: stored.checksum, deletedAt: null },
    select: { id: true, originalName: true, url: true },
  });

  const replaceId = String(form.get("replaceId") || "");
  const alt = String(form.get("alt") || "").slice(0, 500);
  const title = String(form.get("title") || "").slice(0, 240) || null;
  const caption = String(form.get("caption") || "").slice(0, 1000) || null;
  const focalX = Number(form.get("focalX") || 50);
  const focalY = Number(form.get("focalY") || 50);

  try {
    let asset;
    if (replaceId) {
      const existing = await db.mediaAsset.findUnique({
        where: { id: replaceId },
        include: { versions: { orderBy: { version: "desc" }, take: 1 } },
      });
      if (!existing) {
        await removeMediaFile(stored.url);
        return NextResponse.json(
          { error: "Asset to replace was not found." },
          { status: 404 }
        );
      }
      const nextVersion = (existing.currentVersion || 1) + 1;
      asset = await db.$transaction(async (tx) => {
        await tx.mediaVersion.create({
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
            durationMs: stored.durationMs,
            checksum: stored.checksum,
            isOriginal: true,
          },
        });
        return tx.mediaAsset.update({
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
            durationMs: stored.durationMs,
            alt: alt || existing.alt,
            title: title ?? existing.title,
            caption: caption ?? existing.caption,
            folder: stored.url.split("/")[2] || existing.folder,
            checksum: stored.checksum,
            focalX: Number.isFinite(focalX) ? focalX : existing.focalX,
            focalY: Number.isFinite(focalY) ? focalY : existing.focalY,
            currentVersion: nextVersion,
            deletedAt: null,
          },
          include: {
            _count: { select: { placements: true } },
            placements: { select: { key: true, label: true } },
          },
        });
      });
    } else {
      asset = await db.$transaction(async (tx) => {
        const created = await tx.mediaAsset.create({
          data: {
            filename: stored.filename,
            originalName: stored.originalName,
            url: stored.url,
            mimeType: stored.mimeType,
            kind: stored.kind,
            size: stored.size,
            width: stored.width,
            height: stored.height,
            durationMs: stored.durationMs,
            alt,
            title,
            caption,
            folder: stored.url.split("/")[2] || "general",
            checksum: stored.checksum,
            focalX: Number.isFinite(focalX) ? focalX : 50,
            focalY: Number.isFinite(focalY) ? focalY : 50,
            currentVersion: 1,
          },
        });
        await tx.mediaVersion.create({
          data: {
            assetId: created.id,
            version: 1,
            filename: stored.filename,
            originalName: stored.originalName,
            url: stored.url,
            mimeType: stored.mimeType,
            size: stored.size,
            width: stored.width,
            height: stored.height,
            durationMs: stored.durationMs,
            checksum: stored.checksum,
            isOriginal: true,
          },
        });
        return tx.mediaAsset.findUniqueOrThrow({
          where: { id: created.id },
          include: {
            _count: { select: { placements: true } },
            placements: { select: { key: true, label: true } },
          },
        });
      });
    }

    await writeAuditLog({
      action: replaceId ? "REPLACE_MEDIA" : "UPLOAD_MEDIA",
      module: "media-library",
      entityId: asset.id,
      summary: `${replaceId ? "Replaced" : "Uploaded"} ${file.name}`,
      metadata: {
        size: stored.size,
        width: stored.width,
        height: stored.height,
        mimeType: stored.mimeType,
        preservedOriginal: true,
      },
    });

    revalidateTag("media");
    revalidatePath("/");
    revalidatePath("/orbit/media-library");

    return NextResponse.json(
      {
        asset: serializeAsset(asset),
        duplicate: duplicate && duplicate.id !== asset.id ? duplicate : null,
        message: replaceId ? "Image Saved" : "Upload Successful",
      },
      { status: replaceId ? 200 : 201 }
    );
  } catch (error) {
    await removeMediaFile(stored.url);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Server Error",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Silence unused import warnings in some tooling versions
void IMAGE_MIME_TYPES;
void VIDEO_MIME_TYPES;
