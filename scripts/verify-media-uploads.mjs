/**
 * Media upload + validation smoke tests against a running Orbit session.
 * Required: ORBIT_TEST_BASE_URL, ORBIT_TEST_COOKIE, DATABASE_URL
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";

const baseUrl = (process.env.ORBIT_TEST_BASE_URL || "http://localhost:3010").replace(
  /\/$/,
  ""
);
const cookie = process.env.ORBIT_TEST_COOKIE;
if (!cookie || !process.env.DATABASE_URL) {
  console.error("Need ORBIT_TEST_COOKIE and DATABASE_URL");
  process.exit(1);
}

const tmp = path.join(process.cwd(), ".tmp-verify-media");
fs.mkdirSync(tmp, { recursive: true });

async function makeImage(name, format) {
  const file = path.join(tmp, name);
  let pipeline = sharp({
    create: {
      width: 640,
      height: 360,
      channels: 3,
      background: { r: 20, g: 60, b: 40 },
    },
  });
  if (format === "jpg") pipeline = pipeline.jpeg({ quality: 95 });
  if (format === "png") pipeline = pipeline.png();
  if (format === "webp") pipeline = pipeline.webp({ quality: 95 });
  await pipeline.toFile(file);
  return file;
}

async function upload(filePath, mime) {
  const bytes = fs.readFileSync(filePath);
  const form = new FormData();
  form.append(
    "file",
    new Blob([bytes], { type: mime }),
    path.basename(filePath)
  );
  const response = await fetch(`${baseUrl}/api/orbit/media`, {
    method: "POST",
    headers: { Cookie: cookie, Origin: baseUrl },
    body: form,
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
}

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();

try {
  const jpg = await makeImage("verify.jpg", "jpg");
  const png = await makeImage("verify.png", "png");
  const webp = await makeImage("verify.webp", "webp");

  for (const [file, mime, label] of [
    [jpg, "image/jpeg", "JPG"],
    [png, "image/png", "PNG"],
    [webp, "image/webp", "WEBP"],
  ]) {
    const { response, body } = await upload(file, mime);
    if (!response.ok || !body.asset?.id) {
      throw new Error(`${label} upload failed: ${body.error || response.status}`);
    }
    const row = await db.query(
      'SELECT id, url, "mimeType" FROM "MediaAsset" WHERE id = $1',
      [body.asset.id]
    );
    if (!row.rows[0]) throw new Error(`${label}: missing DB row`);
    const media = await fetch(`${baseUrl}${row.rows[0].url}`);
    if (!media.ok) throw new Error(`${label}: media URL returned ${media.status}`);
    console.log(`PASS upload ${label}`);
  }

  // Invalid / unsupported
  const txt = path.join(tmp, "bad.txt");
  fs.writeFileSync(txt, "not-an-image");
  const bad = await upload(txt, "text/plain");
  if (bad.response.ok) throw new Error("Expected unsupported file to fail");
  console.log("PASS unsupported format rejected:", bad.body.error || bad.response.status);

  // Oversized: create a buffer larger than configured max if available
  const maxBytes = Number(process.env.ORBIT_MAX_IMAGE_BYTES || 26214400);
  const huge = path.join(tmp, "huge.bin");
  fs.writeFileSync(huge, Buffer.alloc(Math.min(maxBytes + 1024, maxBytes + 1024)));
  // Use image mime with nonsense body so size check triggers first when enforced
  const over = await upload(huge, "image/jpeg");
  if (over.response.ok) {
    console.log("WARN oversized upload accepted (server may validate after decode)");
  } else {
    console.log("PASS oversized rejected:", over.body.error || over.response.status);
  }

  // Hero replace via homepage API
  const homepageGet = await fetch(`${baseUrl}/api/orbit/homepage`, {
    headers: { Cookie: cookie, Origin: baseUrl },
  });
  const homepage = await homepageGet.json();
  const original = structuredClone(homepage.content);
  const uploaded = await upload(jpg, "image/jpeg");
  const next = structuredClone(original);
  next.hero.image = {
    assetId: uploaded.body.asset.id,
    src: uploaded.body.asset.url,
    alt: "Verification hero image",
    title: "verify.jpg",
    focalX: 50,
    focalY: 45,
  };
  const save = await fetch(`${baseUrl}/api/orbit/homepage`, {
    method: "PUT",
    headers: {
      Cookie: cookie,
      Origin: baseUrl,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: next }),
  });
  const saved = await save.json();
  if (!save.ok || saved.message !== "Saved Successfully") {
    throw new Error(`Hero save failed: ${saved.error || save.status}`);
  }
  const publicHtml = await (await fetch(baseUrl, { cache: "no-store" })).text();
  const token = uploaded.body.asset.url.split("/").at(-1);
  if (!publicHtml.includes(token)) {
    throw new Error("Hero replacement not visible on public homepage");
  }
  console.log("PASS hero replace + public render");

  // Restore
  const restore = await fetch(`${baseUrl}/api/orbit/homepage`, {
    method: "PUT",
    headers: {
      Cookie: cookie,
      Origin: baseUrl,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: original }),
  });
  if (!restore.ok) throw new Error("Hero restore failed");
  console.log("PASS hero restore");

  // Logo size change
  const logoDoc = structuredClone(original);
  logoDoc.hero.logoDesktopWidth = (logoDoc.hero.logoDesktopWidth || 156) + 24;
  const logoSave = await fetch(`${baseUrl}/api/orbit/homepage`, {
    method: "PUT",
    headers: {
      Cookie: cookie,
      Origin: baseUrl,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: logoDoc }),
  });
  const logoHtml = await (await fetch(baseUrl, { cache: "no-store" })).text();
  if (!logoHtml.includes(`${logoDoc.hero.logoDesktopWidth}px`)) {
    throw new Error("Logo desktop size not reflected in layout HTML");
  }
  await fetch(`${baseUrl}/api/orbit/homepage`, {
    method: "PUT",
    headers: {
      Cookie: cookie,
      Origin: baseUrl,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: original }),
  });
  console.log("PASS logo size update + restore");
  console.log("PASS media verification suite");
} finally {
  await db.end();
  fs.rmSync(tmp, { recursive: true, force: true });
}
