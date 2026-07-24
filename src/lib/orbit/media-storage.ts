import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);

export const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function maxImageBytes() {
  return (
    Number(process.env.ORBIT_MAX_IMAGE_BYTES) || 20 * 1024 * 1024
  );
}

export function maxVideoBytes() {
  return (
    Number(process.env.ORBIT_MAX_VIDEO_BYTES) || 120 * 1024 * 1024
  );
}

export function mediaRoot() {
  return path.resolve(
    process.env.ORBIT_UPLOAD_DIR ||
      path.join(process.cwd(), "public", "media")
  );
}

export function publicMediaUrl(folder: string, filename: string) {
  return `/media/${folder}/${filename}`;
}

export function safeFolder(value: string | null | undefined) {
  const folder = String(value || "general")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return folder || "general";
}

export function diskPathFromUrl(url: string) {
  const relative = url.replace(/^\/media\//, "").replace(/^\/uploads\//, "");
  const resolved = path.resolve(mediaRoot(), relative);
  if (!resolved.startsWith(mediaRoot())) {
    throw new Error("Invalid media path");
  }
  return resolved;
}

export function extensionForMime(mimeType: string, originalName: string) {
  const fromName = path.extname(originalName).toLowerCase();
  if (fromName && fromName.length <= 8) return fromName;
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
  };
  return map[mimeType] || ".bin";
}

export function normalizeUploadMime(
  mimeType: string | null | undefined,
  originalName: string
) {
  const trimmed = String(mimeType || "").trim().toLowerCase();
  if (trimmed && trimmed !== "application/octet-stream") return trimmed;
  const ext = path.extname(originalName).toLowerCase();
  const byExt: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
  };
  return byExt[ext] || trimmed;
}

export function kindForMime(mimeType: string): "IMAGE" | "VIDEO" | null {
  if (IMAGE_MIME_TYPES.has(mimeType)) return "IMAGE";
  if (VIDEO_MIME_TYPES.has(mimeType)) return "VIDEO";
  return null;
}

function hashedFilename(originalName: string, mimeType: string, checksum: string) {
  const ext = extensionForMime(mimeType, originalName);
  const stem = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const hash = checksum.slice(0, 5);
  return `${stem || "media"}-${hash}${ext}`;
}

export function checksumBuffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export type StoredMediaFile = {
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  kind: "IMAGE" | "VIDEO";
  size: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  checksum: string;
  absolutePath: string;
};

async function probeImage(buffer: Buffer) {
  const metadata = await sharp(buffer, {
    failOn: "error",
    limitInputPixels: 100_000_000,
  })
    .rotate()
    .metadata();
  return {
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
}

/**
 * Persist the original upload bytes unchanged (no recompression).
 * Optional crop creates a separate derivative via `storeCroppedDerivative`.
 */
export async function storeOriginalUpload(options: {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
  folder?: string | null;
}): Promise<StoredMediaFile> {
  const mimeType = normalizeUploadMime(options.mimeType, options.originalName);
  const kind = kindForMime(mimeType);
  if (!kind) throw new Error("Unsupported file type");

  const max =
    kind === "IMAGE" ? maxImageBytes() : maxVideoBytes();
  if (options.buffer.byteLength > max) {
    throw new Error(
      kind === "IMAGE"
        ? `File too large — maximum image size is ${Math.round(max / 1024 / 1024)} MB.`
        : `File too large — maximum video size is ${Math.round(max / 1024 / 1024)} MB.`
    );
  }

  let width: number | null = null;
  let height: number | null = null;
  const isSvg = mimeType === "image/svg+xml";
  if (kind === "IMAGE" && !isSvg) {
    try {
      const dims = await probeImage(options.buffer);
      width = dims.width;
      height = dims.height;
    } catch {
      throw new Error("The image file is invalid.");
    }
  }

  const folder = safeFolder(options.folder);
  const checksum = checksumBuffer(options.buffer);
  const filename = hashedFilename(options.originalName, mimeType, checksum);
  const destinationDir = path.join(mediaRoot(), folder);
  await mkdir(destinationDir, { recursive: true });
  const absolutePath = path.join(destinationDir, filename);
  const tempPath = `${absolutePath}.tmp`;
  try {
    await writeFile(tempPath, options.buffer, { flag: "wx" });
    await rename(tempPath, absolutePath);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code || "")
        : "";
    if (code === "ENOSPC") throw new Error("Disk full — could not store media.");
    if (code === "EACCES" || code === "EPERM") {
      throw new Error("Storage permission denied — could not store media.");
    }
    // Collision on hashed name is extremely unlikely; fall back to uuid name.
    const fallback = `${Date.now()}-${randomUUID().slice(0, 10)}${extensionForMime(
      mimeType,
      options.originalName
    )}`;
    const fallbackPath = path.join(destinationDir, fallback);
    await writeFile(fallbackPath, options.buffer);
    return {
      filename: fallback,
      originalName: options.originalName.slice(0, 240),
      url: publicMediaUrl(folder, fallback),
      mimeType,
      kind,
      size: options.buffer.byteLength,
      width,
      height,
      durationMs: null,
      checksum,
      absolutePath: fallbackPath,
    };
  }

  return {
    filename,
    originalName: options.originalName.slice(0, 240),
    url: publicMediaUrl(folder, filename),
    mimeType,
    kind,
    size: options.buffer.byteLength,
    width,
    height,
    durationMs: null,
    checksum,
    absolutePath,
  };
}

export type CropPayload = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  flipX?: boolean;
  flipY?: boolean;
};

/** Create a cropped derivative without modifying the original file. */
export async function storeCroppedDerivative(options: {
  sourceUrl: string;
  crop: CropPayload;
  folder?: string | null;
  originalName: string;
}): Promise<StoredMediaFile> {
  const sourcePath = diskPathFromUrl(options.sourceUrl);
  const input = await readFile(sourcePath);
  let pipeline = sharp(input, { failOn: "error", limitInputPixels: 100_000_000 }).rotate(
    options.crop.rotate || 0
  );
  if (options.crop.flipX) pipeline = pipeline.flop();
  if (options.crop.flipY) pipeline = pipeline.flip();

  // After rotate, dimensions can swap — clamp extract to the transformed canvas.
  const transformed = await pipeline.toBuffer({ resolveWithObject: true });
  const maxW = transformed.info.width;
  const maxH = transformed.info.height;
  const left = Math.max(0, Math.min(Math.round(options.crop.x), Math.max(0, maxW - 1)));
  const top = Math.max(0, Math.min(Math.round(options.crop.y), Math.max(0, maxH - 1)));
  const width = Math.max(
    1,
    Math.min(Math.round(options.crop.width), maxW - left)
  );
  const height = Math.max(
    1,
    Math.min(Math.round(options.crop.height), maxH - top)
  );

  pipeline = sharp(transformed.data, {
    failOn: "error",
    limitInputPixels: 100_000_000,
  }).extract({ left, top, width, height });

  // Preserve original format when possible; fall back to PNG for lossless crop.
  const meta = await sharp(input).metadata();
  const formatName = String(meta.format || "png");
  const format =
    formatName === "jpeg" || formatName === "jpg"
      ? "jpeg"
      : formatName === "webp"
        ? "webp"
        : formatName === "avif" || formatName === "heif"
          ? "avif"
          : "png";
  const buffer =
    format === "jpeg"
      ? await pipeline.jpeg({ quality: 100, mozjpeg: true }).toBuffer()
      : format === "webp"
        ? await pipeline.webp({ quality: 100, lossless: true }).toBuffer()
        : format === "avif"
          ? await pipeline.avif({ quality: 100 }).toBuffer()
          : await pipeline.png({ compressionLevel: 6 }).toBuffer();

  const mimeType =
    format === "jpeg"
      ? "image/jpeg"
      : format === "webp"
        ? "image/webp"
        : format === "avif"
          ? "image/avif"
          : "image/png";

  return storeOriginalUpload({
    buffer,
    mimeType,
    originalName: `crop-${options.originalName}`,
    folder: options.folder,
  });
}

export async function removeMediaFile(url: string) {
  try {
    await unlink(diskPathFromUrl(url));
  } catch {
    // File may already be gone.
  }
}

export async function copyIntoMediaLibrary(options: {
  absoluteSource: string;
  mimeType: string;
  originalName: string;
  folder?: string | null;
}): Promise<StoredMediaFile> {
  const buffer = await readFile(options.absoluteSource);
  return storeOriginalUpload({
    buffer,
    mimeType: options.mimeType,
    originalName: options.originalName,
    folder: options.folder,
  });
}

export async function ensureMediaRoot() {
  await mkdir(mediaRoot(), { recursive: true });
  for (const folder of [
    "general",
    "hero",
    "video",
    "rooms",
    "dining",
    "spa",
    "gallery",
    "offers",
    "experiences",
    "wedding",
    "meetings",
    "blog",
    "about",
    "footer",
    "payments",
    "trash",
  ]) {
    await mkdir(path.join(mediaRoot(), folder), { recursive: true });
  }
}

export async function fileExists(url: string) {
  try {
    await stat(diskPathFromUrl(url));
    return true;
  } catch {
    return false;
  }
}

export async function softDeleteFile(url: string) {
  const source = diskPathFromUrl(url);
  const trashDir = path.join(mediaRoot(), "trash");
  await mkdir(trashDir, { recursive: true });
  const dest = path.join(trashDir, `${Date.now()}-${path.basename(source)}`);
  try {
    await rename(source, dest);
    return dest;
  } catch {
    try {
      await copyFile(source, dest);
      await unlink(source);
      return dest;
    } catch {
      return null;
    }
  }
}
