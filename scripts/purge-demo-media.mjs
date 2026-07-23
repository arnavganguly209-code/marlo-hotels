/**
 * Permanently purge demo / placeholder Orbit media.
 * Preserves videos >= 80MB (the real Hero upload).
 *
 * Usage: node --env-file=.env scripts/purge-demo-media.mjs
 */
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

  // Scrub homepage visual-editor demo video URLs
  const homepage = await client.query(
    `SELECT id, data FROM "ContentEntry" WHERE module='homepage' AND key='visual-editor' LIMIT 1`
  );
  if (homepage.rows[0]) {
    const data = homepage.rows[0].data;
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

  console.log(`Purge complete. Removed ${deleted} demo asset(s).`);
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
