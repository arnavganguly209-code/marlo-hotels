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

const REMOTE_PLACEMENTS = [
  ["home.about.primary", "Homepage About — Primary", "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1600&auto=format&fit=crop", "Marlo Hotels architecture rising above the gardens"],
  ["home.about.secondary", "Homepage About — Secondary", "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200&auto=format&fit=crop", "The infinity pool at first light"],
  ["home.wellness.primary", "Homepage Wellness — Primary", "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop", "Spa treatment room at Marlo Hotels"],
  ["home.wellness.secondary", "Homepage Wellness — Secondary", "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop", "Wellness amenities"],
  ["home.pool", "Homepage Pool Banner", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2400&auto=format&fit=crop", "Infinity pool overlooking the valley"],
  ["home.events.primary", "Homepage Events — Primary", "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1600&auto=format&fit=crop", "Wedding celebration at Marlo"],
  ["home.events.secondary", "Homepage Events — Secondary", "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop", "Meetings and conferences"],
  ["page.rooms.hero", "Rooms Page Hero", "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2400&auto=format&fit=crop", "A Marlo guest room bathed in morning light"],
  ["page.dining.hero", "Dining Page Hero", "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2400&auto=format&fit=crop", "Fine dining at Marlo Hotels"],
  ["page.spa.hero", "Spa Page Hero", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2400&auto=format&fit=crop", "Spa sanctuary at Marlo Hotels"],
  ["page.spa.body", "Spa Page Body", "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1600&auto=format&fit=crop", "Spa treatment detail"],
  ["page.experiences.hero", "Experiences Page Hero", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2400&auto=format&fit=crop", "Experiences around Marlo Hotels"],
  ["page.gallery.hero", "Gallery Page Hero", "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop", "Gallery of Marlo Hotels"],
  ["page.offers.hero", "Offers Page Hero", "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2400&auto=format&fit=crop", "Exclusive offers at Marlo Hotels"],
  ["page.blog.hero", "Blog Page Hero", "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2400&auto=format&fit=crop", "Journal and stories from Marlo"],
  ["page.contact.hero", "Contact Page Hero", "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2400&auto=format&fit=crop", "Contact Marlo Hotels"],
  ["page.booking.hero", "Booking Page Hero", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2400&auto=format&fit=crop", "Book your stay at Marlo Hotels"],
];

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
