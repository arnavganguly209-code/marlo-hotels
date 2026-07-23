/**
 * Idempotent media seed for Orbit Visual Media CMS.
 * Usage: node --env-file=.env scripts/seed-media.mjs
 */
import { createHash, randomUUID } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const mediaRoot = process.env.ORBIT_UPLOAD_DIR
  ? path.resolve(process.env.ORBIT_UPLOAD_DIR)
  : path.join(root, "public", "media");

const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = new Client({ connectionString });

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function checksum(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function cuid() {
  return `c${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

async function findByChecksum(hash) {
  const result = await client.query(
    `SELECT * FROM "MediaAsset" WHERE checksum = $1 AND "deletedAt" IS NULL LIMIT 1`,
    [hash]
  );
  return result.rows[0] || null;
}

async function createAsset({
  buffer,
  originalName,
  folder,
  alt,
  title,
  mimeType,
}) {
  const hash = checksum(buffer);
  const existing = await findByChecksum(hash);
  if (existing) return existing;

  const ext = path.extname(originalName) || ".png";
  const filename = `${Date.now()}-${randomUUID().slice(0, 10)}${ext}`;
  const destDir = path.join(mediaRoot, folder);
  await ensureDir(destDir);
  await writeFile(path.join(destDir, filename), buffer, { flag: "wx" });
  const url = `/media/${folder}/${filename}`;
  const id = cuid();
  const now = new Date();
  await client.query(
    `INSERT INTO "MediaAsset"
      (id, filename, "originalName", url, "mimeType", kind, size, alt, title, folder, checksum, "focalX", "focalY", "currentVersion", "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,'IMAGE',$6,$7,$8,$9,$10,50,45,1,$11,$11)`,
    [
      id,
      filename,
      originalName,
      url,
      mimeType,
      buffer.byteLength,
      alt,
      title,
      folder,
      hash,
      now,
    ]
  );
  await client.query(
    `INSERT INTO "MediaVersion"
      (id, "assetId", version, filename, "originalName", url, "mimeType", size, checksum, "isOriginal", "createdAt")
     VALUES ($1,$2,1,$3,$4,$5,$6,$7,$8,true,$9)`,
    [
      cuid(),
      id,
      filename,
      originalName,
      url,
      mimeType,
      buffer.byteLength,
      hash,
      now,
    ]
  );
  const created = await client.query(`SELECT * FROM "MediaAsset" WHERE id = $1`, [
    id,
  ]);
  return created.rows[0];
}

async function upsertPlacement(key, label, asset, extras = {}) {
  const existing = await client.query(
    `SELECT id FROM "MediaPlacement" WHERE key = $1`,
    [key]
  );
  const now = new Date();
  if (existing.rows[0]) {
    await client.query(
      `UPDATE "MediaPlacement"
       SET label=$2, "assetId"=$3, alt=$4, "focalX"=$5, "focalY"=$6, "updatedAt"=$7
       WHERE key=$1`,
      [
        key,
        label,
        asset.id,
        extras.alt || asset.alt,
        extras.focalX ?? 50,
        extras.focalY ?? 45,
        now,
      ]
    );
  } else {
    await client.query(
      `INSERT INTO "MediaPlacement"
        (id, key, label, "assetId", "mediaType", alt, "focalX", "focalY", "videoAutoplay", "videoLoop", "videoMuted", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,'IMAGE',$5,$6,$7,true,true,true,0,$8,$8)`,
      [
        cuid(),
        key,
        label,
        asset.id,
        extras.alt || asset.alt,
        extras.focalX ?? 50,
        extras.focalY ?? 45,
        now,
      ]
    );
  }
}

async function importLocal(absoluteSource, originalName, folder, alt, title) {
  const buffer = await readFile(absoluteSource);
  const mimeType =
    originalName.endsWith(".jpg") || originalName.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/png";
  return createAsset({ buffer, originalName, folder, alt, title, mimeType });
}

async function importRemote(url, originalName, folder, alt, title) {
  const byName = await client.query(
    `SELECT * FROM "MediaAsset" WHERE "originalName" = $1 AND "deletedAt" IS NULL LIMIT 1`,
    [originalName]
  );
  if (byName.rows[0]) return byName.rows[0];
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = (response.headers.get("content-type") || "image/jpeg").split(
    ";"
  )[0];
  return createAsset({
    buffer,
    originalName,
    folder,
    alt,
    title,
    mimeType: contentType,
  });
}

const REMOTE_PLACEMENTS = [];

console.log(
  "seed-media: REMOTE_PLACEMENTS disabled — Orbit starts empty of demo Unsplash assets."
);

async function findHeroSource() {
  const candidates = [
    path.join(root, "public", "images", "brand", "hero-reception.png"),
    path.join(
      process.env.USERPROFILE || "",
      ".cursor",
      "projects",
      "c-Users-Admin-Desktop-ARNAB-marlo-hotels",
      "assets",
      "c__Users_Admin_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_Marlo_Hotels_Rec-b0d526a4-b4b6-40ee-9a71-891c658636bd.png"
    ),
    path.join(root, "public", "images", "brand", "hero-reference.png"),
  ];
  for (const candidate of candidates) {
    if (candidate && (await fileExists(candidate))) return candidate;
  }
  return null;
}

async function main() {
  await client.connect();
  await ensureDir(mediaRoot);
  await ensureDir(path.join(mediaRoot, "hero"));

  const heroSource = await findHeroSource();
  if (!heroSource) throw new Error("Hero source image not found");
  console.log("Hero source:", heroSource);

  const heroAsset = await importLocal(
    heroSource,
    "marlo-hotels-reception-hero.png",
    "hero",
    "Marlo Hotels lobby and reception — Hotel Marlo",
    "Homepage Hero"
  );
  await upsertPlacement("home.hero", "Homepage Hero", heroAsset, {
    alt: heroAsset.alt,
    focalX: 50,
    focalY: 45,
  });

  const heroData = {
    section: "Hero",
    heading: "Stay Beyond Extraordinary",
    subheading: "",
    buttonText: "Discover More",
    buttonLink: "/rooms",
    bookingWidget: true,
    backgroundOverlay: "Balanced",
    imageUrl: heroAsset.url,
    imageAlt: heroAsset.alt,
    mediaAssetId: heroAsset.id,
    mediaType: "IMAGE",
    focalX: 50,
    focalY: 45,
  };
  const existingHero = await client.query(
    `SELECT id FROM "ContentEntry" WHERE module = 'homepage' AND key = 'hero'`
  );
  const now = new Date();
  if (existingHero.rows[0]) {
    await client.query(
      `UPDATE "ContentEntry"
       SET title=$2, status='PUBLISHED', "publishedAt"=$3, data=$4::jsonb, "updatedAt"=$3
       WHERE id=$1`,
      [existingHero.rows[0].id, "Homepage Hero", now, JSON.stringify(heroData)]
    );
  } else {
    await client.query(
      `INSERT INTO "ContentEntry"
        (id, module, key, title, status, data, "publishedAt", "createdAt", "updatedAt")
       VALUES ($1,'homepage','hero','Homepage Hero','PUBLISHED',$2::jsonb,$3,$3,$3)`,
      [cuid(), JSON.stringify(heroData), now]
    );
  }

  const logoPath = path.join(root, "public", "images", "brand", "logo.png");
  if (await fileExists(logoPath)) {
    const logo = await importLocal(
      logoPath,
      "marlo-logo.png",
      "brand",
      "Marlo Hotels",
      "Primary Logo"
    );
    await upsertPlacement("brand.logo", "Primary Logo", logo);
    await upsertPlacement("brand.footerLogo", "Footer Logo", logo);
  }

  for (const [key, label, url, alt] of REMOTE_PLACEMENTS) {
    try {
      const asset = await importRemote(url, `${key}.jpg`, "imported", alt, label);
      await upsertPlacement(key, label, asset, { alt });
      console.log("Placed", key);
    } catch (error) {
      console.warn("Skipped", key, error.message);
    }
  }

  console.log("Media seed complete.");
  console.log("Hero URL:", heroAsset.url);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end().catch(() => undefined);
  });
