/**
 * Headless Orbit homepage editor verification.
 * Uses ORBIT_ADMIN_PASSKEY from env; never prints secrets.
 */
import "dotenv/config";
import { chromium } from "playwright";

const baseUrl = (process.env.ORBIT_TEST_BASE_URL || "http://localhost:3010").replace(
  /\/$/,
  ""
);
const passkey = process.env.ORBIT_ADMIN_PASSKEY;
if (!passkey) {
  console.error("ORBIT_ADMIN_PASSKEY missing");
  process.exit(1);
}

const sections = [
  "Hero Section",
  "About Section",
  "Rooms Section",
  "Featured Suites",
  "Dining Section",
  "Spa Section",
  "Infinity Pool Section",
  "Weddings & Events",
  "Gallery Section",
  "Experiences Section",
  "Nearby Attractions",
  "Guest Reviews",
  "Awards",
  "Instagram Section",
  "Journal Section",
  "Footer CTA",
  "Footer",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

try {
  await page.goto(`${baseUrl}/orbit`, { waitUntil: "networkidle" });
  await page.getByRole("textbox", { name: /orbit passkey/i }).fill(passkey);
  await page.getByRole("button", { name: /enter orbit/i }).click();
  await page.waitForURL(/\/orbit\/(dashboard|[a-z-]+)/, { timeout: 15000 });

  await page.goto(`${baseUrl}/orbit/homepage`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Home Page" }).waitFor();

  const missing = [];
  for (const label of sections) {
    const button = page.getByRole("button", { name: new RegExp(label, "i") });
    if ((await button.count()) === 0) {
      missing.push(label);
      continue;
    }
    await button.first().click();
    await page.waitForTimeout(250);
    const bodyText = await page.locator("main, body").innerText();
    if (!bodyText || bodyText.trim().length < 40) {
      missing.push(`${label} (empty panel)`);
    }
    // Ensure no blank "Select…" only forms for required known fields
    const inputs = page.locator('input[type="text"], textarea');
    const count = await inputs.count();
    let emptyRequired = 0;
    for (let i = 0; i < Math.min(count, 12); i += 1) {
      const value = await inputs.nth(i).inputValue();
      const visible = await inputs.nth(i).isVisible();
      if (visible && !value.trim()) emptyRequired += 1;
    }
    // Hero/about should have several filled fields; allow a few optional empties
    if (["Hero Section", "About Section"].includes(label) && emptyRequired > 6) {
      missing.push(`${label} (too many blank fields: ${emptyRequired})`);
    }
  }

  // Hero logo size controls exist
  await page.getByRole("button", { name: /Hero Section/i }).click();
  const logoWidth = page.getByLabel(/Logo Desktop Width/i);
  if ((await logoWidth.count()) === 0) {
    // Fallback: look for text label
    const hasLogoControls = (await page.getByText(/Logo Desktop Width/i).count()) > 0;
    if (!hasLogoControls) missing.push("Hero logo size controls missing");
  } else {
    const before = await logoWidth.inputValue();
    await logoWidth.fill(String(Number(before || "156") + 10));
    const preview = page.getByText(/Live Preview/i);
    if ((await preview.count()) === 0) missing.push("Live Preview missing");
  }

  if (missing.length) {
    console.error("FAIL orbit sections:", missing.join("; "));
    process.exitCode = 1;
  } else {
    console.log(`PASS orbit editor: ${sections.length} sections present and populated`);
  }

  const serious = consoleErrors.filter(
    (msg) =>
      !msg.includes("favicon") &&
      !msg.includes("Download the React DevTools")
  );
  if (serious.length) {
    console.error("FAIL console errors:", serious.slice(0, 8).join(" | "));
    process.exitCode = 1;
  } else {
    console.log("PASS orbit console clean");
  }
} finally {
  await browser.close();
}
