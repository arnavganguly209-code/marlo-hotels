/**
 * Destructive round-trip smoke test for the Orbit homepage editor.
 *
 * Required:
 *   ORBIT_TEST_BASE_URL=https://staging.example.com
 *   ORBIT_TEST_COOKIE="orbit_session=..."
 *   ORBIT_TEST_ALLOW_WRITE=1
 *
 * Every mutation is restored immediately and the complete original document is
 * restored again in finally. Run on staging or a local production build.
 */
import pg from "pg";

const baseUrl = (process.env.ORBIT_TEST_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);
const cookie = process.env.ORBIT_TEST_COOKIE;

if (
  !cookie ||
  !process.env.DATABASE_URL ||
  process.env.ORBIT_TEST_ALLOW_WRITE !== "1"
) {
  console.error(
    "Set DATABASE_URL, ORBIT_TEST_COOKIE and ORBIT_TEST_ALLOW_WRITE=1 to run homepage round-trip tests."
  );
  process.exit(1);
}
const database = new pg.Client({ connectionString: process.env.DATABASE_URL });
await database.connect();

const expectedSections = [
  "hero",
  "about",
  "rooms",
  "featuredSuites",
  "dining",
  "wellness",
  "pool",
  "events",
  "gallery",
  "experiences",
  "attractions",
  "testimonials",
  "awards",
  "instagram",
  "journal",
  "footerCta",
  "footer",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Cookie: cookie,
      Origin: baseUrl,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

async function readContent() {
  const response = await request("/api/orbit/homepage");
  const body = await response.json();
  if (!response.ok || !body.content) {
    throw new Error(body.error || `Homepage GET failed (${response.status})`);
  }
  return body.content;
}

async function saveContent(content) {
  const response = await request("/api/orbit/homepage", {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
  const body = await response.json();
  if (!response.ok || body.message !== "Saved Successfully") {
    throw new Error(body.error || `Homepage PUT failed (${response.status})`);
  }
  return body.content;
}

const visibleProbePaths = {
  hero: "heading",
  about: "heading",
  rooms: ["items", 0, "name"],
  featuredSuites: ["items", 0, "name"],
  dining: ["items", 0, "name"],
  wellness: "heading",
  pool: "heading",
  events: ["items", 0, "title"],
  gallery: "heading",
  experiences: ["items", 0, "title"],
  attractions: ["items", 0, "name"],
  testimonials: ["items", 0, "quote"],
  awards: ["items", 0, "title"],
  instagram: "handle",
  journal: ["items", 0, "title"],
  footerCta: "heading",
  footer: "description",
};

function getAt(value, path) {
  const keys = Array.isArray(path) ? path : [path];
  return keys.reduce((current, key) => current[key], value);
}

function setAt(value, path, next) {
  const keys = Array.isArray(path) ? path : [path];
  let current = value;
  for (const key of keys.slice(0, -1)) current = current[key];
  current[keys.at(-1)] = next;
}

const original = await readContent();

function collectImages(value, path = []) {
  if (
    value &&
    typeof value === "object" &&
    typeof value.src === "string" &&
    typeof value.alt === "string"
  ) {
    return [{ path, image: value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectImages(item, [...path, index])
    );
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      collectImages(item, [...path, key])
    );
  }
  return [];
}

const availableImages = collectImages(original).map((item) => item.image);

try {
  for (const key of expectedSections) {
    if (!original[key]) throw new Error(`Missing section: ${key}`);
    const candidate = clone(original);
    const path = visibleProbePaths[key];
    const pathKeys = Array.isArray(path) ? path : [path];
    const sectionImages = collectImages(candidate[key]);
    const imagePath = sectionImages[0]?.path;
    const currentImage = sectionImages[0]?.image;
    const replacementImage = currentImage
      ? availableImages.find((item) => item.src !== currentImage.src)
      : null;
    if (imagePath && replacementImage) {
      const nextImage = clone(replacementImage);
      // Keep the probe text when it lives on the same image object we replace.
      if (
        pathKeys.length >= 2 &&
        pathKeys.slice(0, -1).every((part, index) => imagePath[index] === part) &&
        (pathKeys.at(-1) === "alt" || pathKeys.at(-1) === "title")
      ) {
        nextImage[pathKeys.at(-1)] = `${currentImage[pathKeys.at(-1)] || ""} [ORBIT CMS TEST ${key}]`;
      }
      setAt(candidate[key], imagePath, nextImage);
    }
    const current = getAt(candidate[key], path);
    const marker =
      String(current).includes(`[ORBIT CMS TEST ${key}]`)
        ? String(current)
        : `${current} [ORBIT CMS TEST ${key}]`;
    setAt(candidate[key], path, marker);

    const saved = await saveContent(candidate);
    if (getAt(saved[key], path) !== marker) {
      throw new Error(`${key}: save response did not contain updated value`);
    }
    if (
      imagePath &&
      replacementImage &&
      getAt(saved[key], imagePath).src !== replacementImage.src
    ) {
      throw new Error(`${key}: replacement image was not saved`);
    }

    const refreshed = await readContent();
    if (getAt(refreshed[key], path) !== marker) {
      throw new Error(`${key}: refreshed API did not contain updated value`);
    }
    const databaseResult = await database.query(
      'SELECT "data" FROM "ContentEntry" WHERE "module" = $1 AND "key" = $2 LIMIT 1',
      ["homepage", "visual-editor"]
    );
    const databaseContent = databaseResult.rows[0]?.data;
    if (!databaseContent || getAt(databaseContent[key], path) !== marker) {
      throw new Error(`${key}: PostgreSQL did not contain updated value`);
    }
    if (
      imagePath &&
      replacementImage &&
      getAt(databaseContent[key], imagePath).src !== replacementImage.src
    ) {
      throw new Error(`${key}: PostgreSQL did not contain replacement image`);
    }

    const publicResponse = await fetch(baseUrl, { cache: "no-store" });
    if (!publicResponse.ok) {
      throw new Error(`${key}: public homepage returned ${publicResponse.status}`);
    }
    const publicHtml = await publicResponse.text();
    if (!publicHtml.includes(`[ORBIT CMS TEST ${key}]`)) {
      throw new Error(`${key}: public homepage did not render updated content`);
    }
    if (replacementImage) {
      const imageToken = replacementImage.src
        .split("?")[0]
        .split("/")
        .at(-1);
      if (imageToken && !publicHtml.includes(imageToken)) {
        throw new Error(`${key}: public homepage did not render replacement image`);
      }
    }

    await saveContent(original);
    const restored = await readContent();
    if (getAt(restored[key], path) !== getAt(original[key], path)) {
      throw new Error(`${key}: original value was not restored`);
    }
    console.log(
      `PASS ${key}: save, refresh, PostgreSQL, public render, image replacement, restore`
    );
  }

  if (original.gallery.items.length > 1) {
    const reordered = clone(original);
    [reordered.gallery.items[0], reordered.gallery.items[1]] = [
      reordered.gallery.items[1],
      reordered.gallery.items[0],
    ];
    const saved = await saveContent(reordered);
    if (saved.gallery.items[0].src !== reordered.gallery.items[0].src) {
      throw new Error("gallery: reordered images were not persisted");
    }
    await saveContent(original);
    console.log("PASS gallery: drag-order persistence and restore");
  }

  const logoSettings = clone(original);
  logoSettings.hero.logoDesktopWidth += 1;
  await saveContent(logoSettings);
  const layoutHtml = await (await fetch(baseUrl, { cache: "no-store" })).text();
  if (!layoutHtml.includes(`${logoSettings.hero.logoDesktopWidth}px`)) {
    throw new Error("hero logo: responsive desktop size did not reach layout");
  }
  await saveContent(original);
  console.log("PASS hero logo: layout sizing update and restore");

  const disabled = clone(original);
  disabled.awards.enabled = false;
  await saveContent(disabled);
  const disabledHtml = await (await fetch(baseUrl, { cache: "no-store" })).text();
  if (disabledHtml.includes(original.awards.items[0].title)) {
    throw new Error("awards: disabled section remained visible");
  }
  await saveContent(original);
  console.log("PASS section visibility: disable and restore");

  console.log(`PASS all ${expectedSections.length} homepage sections`);
} finally {
  await saveContent(original).catch((error) => {
    console.error("CRITICAL: final restore failed", error);
    process.exitCode = 2;
  });
  await database.end();
}
