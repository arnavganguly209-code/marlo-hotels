// One-off content audit: verifies that every Unsplash photo referenced in
// src/ resolves, so no photography ships broken.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function collectFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "generated") continue;
      collectFiles(path, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(path);
    }
  }
  return out;
}

const urls = new Set();
for (const file of collectFiles("src")) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(
    /https:\/\/images\.unsplash\.com\/[a-zA-Z0-9\-_.]+/g
  )) {
    urls.add(match[0]);
  }
}

console.log(`Checking ${urls.size} unique images…`);
const bad = [];
for (const url of urls) {
  try {
    const response = await fetch(`${url}?w=50&q=10`, { redirect: "follow" });
    if (!response.ok) bad.push(`${response.status} ${url}`);
  } catch (error) {
    bad.push(`FETCH-ERROR ${url} (${error.message})`);
  }
}

if (bad.length) {
  console.log("BROKEN IMAGES:");
  for (const line of bad) console.log(" ", line);
  process.exitCode = 1;
} else {
  console.log("All images resolve.");
}
