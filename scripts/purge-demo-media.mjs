/**
 * Permanently purge demo / placeholder Orbit media.
 * Preserves videos >= 80MB (the real Hero upload) and attaches the largest
 * remaining video as the official Homepage Hero.
 *
 * Usage: node --env-file=.env scripts/purge-demo-media.mjs
 */
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const mediaRoot = process.env.ORBIT_UPLOAD_DIR
  ? path.resolve(process.env.ORBIT_UPLOAD_DIR)
  : path.join(root, "public", "media");

const KEEP_VIDEO_MIN_BYTES = 80 * 1024 * 1024;
const connectionString = process.env.DATABASE_URL?.trim();
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

function cuid() {
  return `c${randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function isDemo(asset) {
  const hay = `${asset.url} ${asset.originalName} ${asset.filename}`.toLowerCase();
  if (/hero-demo|sample|placeholder|flowers|demo\.mp4|unsplash/.test(hay)) {
    return true;
  }
  if (String(asset.url).includes("images.unsplash.com")) return true;
  if (asset.kind === "VIDEO" && Number(asset.size) < KEEP_VIDEO_MIN_BYTES) {
    return true;
  }
  return false;
}

function diskPathFromUrl(url) {
  if (!url || !url.startsWith("/media/")) return null;
  return path.join(mediaRoot, url.replace(/^\/media\//, "").split("?")[0]);
}

async function removeFile(url) {
  const disk = diskPathFromUrl(url);
  if (!disk) return;
  try {
    await unlink(disk);
  } catch {
    // already gone
  }
}

async function attachOfficialHeroVideo(client, heroVideo) {
  const now = new Date();
  const existing = await client.query(
    `SELECT id FROM "MediaPlacement" WHERE key = 'home.hero' LIMIT 1`
  );
  if (existing.rows[0]) {
    await client.query(
      `UPDATE "MediaPlacement"
       SET "assetId"=$2, "mediaType"='VIDEO', "videoAutoplay"=true, "videoLoop"=true,
           "videoMuted"=true, "updatedAt"=$3, alt=$4, "posterUrl"=COALESCE($5, "posterUrl")
       WHERE id=$1`,
      [
        existing.rows[0].id,
        heroVideo.id,
        now,
        heroVideo.alt || "Marlo Hotels hero video",
        heroVideo.posterUrl || null,
      ]
    );
  } else {
    await client.query(
      `INSERT INTO "MediaPlacement"
        (id, key, label, "assetId", "mediaType", alt, "focalX", "focalY",
         "videoAutoplay", "videoLoop", "videoMuted", "posterUrl", "createdAt", "updatedAt")
       VALUES ($1,'home.hero','Homepage Hero',$2,'VIDEO',$3,50,45,true,true,true,$4,$5,$5)`,
      [
        cuid(),
        heroVideo.id,
        heroVideo.alt || "Marlo Hotels hero video",
        heroVideo.posterUrl || null,
        now,
      ]
    );
  }

  const homepage = await client.query(
    `SELECT id, data FROM "ContentEntry" WHERE module='homepage' AND key='visual-editor' LIMIT 1`
  );
  if (homepage.rows[0]) {
    const data =
      typeof homepage.rows[0].data === "string"
        ? JSON.parse(homepage.rows[0].data)
        : structuredClone(homepage.rows[0].data);
    data.hero = {
      ...(data.hero || {}),
      mediaType: "VIDEO",
      videoUrl: heroVideo.url,
      videoAssetId: heroVideo.id,
      videoAutoplay: true,
      videoLoop: true,
      videoMuted: true,
      videoPlaysInline: true,
      poster: heroVideo.posterUrl
        ? {
            src: heroVideo.posterUrl,
            alt: heroVideo.alt || "Hero video poster",
          }
        : data.hero?.poster,
    };
    await client.query(
      `UPDATE "ContentEntry" SET data=$2::jsonb, status='PUBLISHED', "updatedAt"=NOW() WHERE id=$1`,
      [homepage.rows[0].id, JSON.stringify(data)]
    );
  }

  console.log(
    "Attached official Hero video:",
    heroVideo.url,
    `(${(Number(heroVideo.size) / (1024 * 1024)).toFixed(1)} MB)`
  );
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  const { rows } = await client.query(`SELECT * FROM "MediaAsset"`);
  let deleted = 0;

  for (const asset of rows) {
    if (!isDemo(asset)) continue;
    await client.query(
      `UPDATE "MediaPlacement" SET "assetId" = NULL WHERE "assetId" = $1`,
      [asset.id]
    );
    await client.query(`DELETE FROM "MediaAsset" WHERE id = $1`, [asset.id]);
    await removeFile(asset.url);
    if (asset.posterUrl) await removeFile(asset.posterUrl);
    deleted += 1;
    console.log("Deleted", asset.url, `(${asset.size} bytes)`);
  }

  const homepage = await client.query(
    `SELECT id, data FROM "ContentEntry" WHERE module='homepage' AND key='visual-editor' LIMIT 1`
  );
  if (homepage.rows[0]) {
    const data =
      typeof homepage.rows[0].data === "string"
        ? JSON.parse(homepage.rows[0].data)
        : structuredClone(homepage.rows[0].data);
    if (data?.hero && typeof data.hero.videoUrl === "string") {
      if (/hero-demo|demo\.mp4|sample|placeholder/i.test(data.hero.videoUrl)) {
        data.hero.videoUrl = "";
        data.hero.videoAssetId = null;
        data.hero.mobileVideoUrl = "";
        data.hero.mobileVideoAssetId = null;
        await client.query(
          `UPDATE "ContentEntry" SET data=$2::jsonb, "updatedAt"=NOW() WHERE id=$1`,
          [homepage.rows[0].id, JSON.stringify(data)]
        );
        console.log("Cleared demo videoUrl from homepage visual-editor");
      }
    }
  }

  try {
    await unlink(path.join(root, "public", "videos", "hero-demo.mp4"));
    console.log("Deleted public/videos/hero-demo.mp4");
  } catch {
    // absent
  }

  const largest = await client.query(
    `SELECT * FROM "MediaAsset"
     WHERE kind = 'VIDEO' AND "deletedAt" IS NULL AND size >= $1
     ORDER BY size DESC
     LIMIT 1`,
    [KEEP_VIDEO_MIN_BYTES]
  );
  if (largest.rows[0]) {
    await attachOfficialHeroVideo(client, largest.rows[0]);
  } else {
    console.warn(
      "No video >= 80MB found — upload your Hero MP4 in Orbit, then re-run purge."
    );
  }

  console.log(`Purge complete. Removed ${deleted} demo asset(s).`);
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
