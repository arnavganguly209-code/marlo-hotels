/**
 * Verify Orbit homepage API returns non-empty current content for every section.
 */
import "dotenv/config";

const baseUrl = (process.env.ORBIT_TEST_BASE_URL || "http://localhost:3010").replace(
  /\/$/,
  ""
);
const cookie = process.env.ORBIT_TEST_COOKIE;
if (!cookie) {
  console.error("ORBIT_TEST_COOKIE missing");
  process.exit(1);
}

const response = await fetch(`${baseUrl}/api/orbit/homepage`, {
  headers: { Cookie: cookie, Origin: baseUrl },
});
const body = await response.json();
if (!response.ok || !body.content) {
  console.error("FAIL homepage GET", body.error || response.status);
  process.exit(1);
}

const content = body.content;
const required = [
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

const issues = [];
for (const key of required) {
  const section = content[key];
  if (!section) {
    issues.push(`${key}: missing`);
    continue;
  }
  if (section.enabled === false) {
    issues.push(`${key}: unexpectedly disabled`);
  }
  if ("heading" in section && !String(section.heading || "").trim()) {
    issues.push(`${key}: blank heading`);
  }
  if (key === "hero") {
    if (!section.image?.src) issues.push("hero: blank image");
    if (!section.logo?.src) issues.push("hero: blank logo");
    if (!section.buttonText) issues.push("hero: blank button");
    if (!section.buttonLink) issues.push("hero: blank button link");
  }
  if (Array.isArray(section.items) && section.items.length === 0) {
    issues.push(`${key}: empty items`);
  }
  if (Array.isArray(section.images) && section.images.length === 0) {
    issues.push(`${key}: empty images`);
  }
}

if (issues.length) {
  console.error("FAIL non-empty checks:\n" + issues.join("\n"));
  process.exit(1);
}

console.log(`PASS orbit content non-empty for ${required.length} sections`);
console.log(
  "SAMPLE",
  JSON.stringify({
    heroHeading: content.hero.heading,
    heroImage: content.hero.image.src.split("/").at(-1),
    rooms: content.rooms.items.length,
    gallery: content.gallery.items.length,
    footer: content.footer.description.slice(0, 40),
  })
);
