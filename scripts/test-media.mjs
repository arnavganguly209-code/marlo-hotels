/**
 * Smoke tests for Orbit media foundation + hero placement.
 * Usage: node --env-file=.env scripts/test-media.mjs
 */
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mediaRoot = process.env.ORBIT_UPLOAD_DIR
  ? path.resolve(process.env.ORBIT_UPLOAD_DIR)
  : path.join(root, "public", "media");

const failures = [];
function assert(condition, message) {
  if (!condition) failures.push(message);
  else console.log("OK:", message);
}

const connectionString = process.env.DATABASE_URL?.trim();
assert(!!connectionString, "DATABASE_URL is configured");

const client = new Client({ connectionString });
await client.connect();

const tables = await client.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('MediaAsset','MediaVersion','MediaPlacement','MediaFolder')
`);
assert(tables.rows.length >= 3, "Media tables exist in PostgreSQL");

const hero = await client.query(
  `SELECT p.key, p."assetId", a.url, a."mimeType", a.checksum, a.size
   FROM "MediaPlacement" p
   LEFT JOIN "MediaAsset" a ON a.id = p."assetId"
   WHERE p.key = 'home.hero'`
);
assert(hero.rows.length === 1, "home.hero placement exists");
assert(!!hero.rows[0]?.url, "home.hero has media URL");
assert(
  String(hero.rows[0]?.mimeType || "").startsWith("image/"),
  "home.hero points to an image"
);

if (hero.rows[0]?.url) {
  const relative = hero.rows[0].url.replace(/^\/media\//, "");
  const absolute = path.join(mediaRoot, relative);
  try {
    await access(absolute);
    assert(true, `Hero file exists on disk (${relative})`);
  } catch {
    assert(false, `Hero file missing on disk (${absolute})`);
  }
}

const versions = await client.query(
  `SELECT COUNT(*)::int AS count FROM "MediaVersion"`
);
assert(versions.rows[0].count >= 1, "At least one media version recorded");

const duplicates = await client.query(`
  SELECT checksum, COUNT(*)::int AS count
  FROM "MediaAsset"
  WHERE "deletedAt" IS NULL
  GROUP BY checksum
  HAVING COUNT(*) > 1
`);
assert(
  true,
  `Duplicate checksum groups: ${duplicates.rows.length} (informational)`
);

await client.end();

if (failures.length) {
  console.error("\nFAILED:");
  for (const failure of failures) console.error("-", failure);
  process.exit(1);
}

console.log("\nAll media smoke tests passed.");
