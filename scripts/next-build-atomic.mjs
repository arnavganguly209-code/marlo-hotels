#!/usr/bin/env node
/**
 * Build Next.js into `.next.new` while leaving live `.next` intact,
 * then atomically swap directories. Used by scripts/deploy-vps.sh.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const cfgPath = path.join(root, "next.config.ts");
const bakPath = path.join(root, "next.config.ts.__deploy_bak");
const newDir = path.join(root, ".next.new");
const liveDir = path.join(root, ".next");

function fail(message, code = 1) {
  console.error(`FATAL: ${message}`);
  process.exit(code);
}

if (!fs.existsSync(cfgPath)) {
  fail("next.config.ts missing");
}

const original = fs.readFileSync(cfgPath, "utf8");
fs.writeFileSync(bakPath, original);

let patched = original;
if (/distDir\s*:/.test(patched)) {
  patched = patched.replace(/distDir\s*:\s*["'][^"']+["']/, 'distDir: ".next.new"');
} else if (/const nextConfig:\s*NextConfig\s*=\s*\{/.test(patched)) {
  patched = patched.replace(
    /const nextConfig:\s*NextConfig\s*=\s*\{/,
    'const nextConfig: NextConfig = {\n  distDir: ".next.new",'
  );
} else {
  fs.unlinkSync(bakPath);
  fail("Could not patch next.config.ts with distDir: \".next.new\"");
}

fs.rmSync(newDir, { recursive: true, force: true });
fs.writeFileSync(cfgPath, patched);

function restoreConfig() {
  try {
    fs.writeFileSync(cfgPath, original);
    fs.rmSync(bakPath, { force: true });
  } catch (error) {
    console.error("WARN: failed to restore next.config.ts", error);
  }
}

const build = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: root,
});

restoreConfig();

if (build.status !== 0) {
  fs.rmSync(newDir, { recursive: true, force: true });
  fail("next build failed — live .next was not modified", build.status || 1);
}

if (!fs.existsSync(path.join(newDir, "BUILD_ID"))) {
  fs.rmSync(newDir, { recursive: true, force: true });
  fail(".next.new/BUILD_ID missing after build — live .next was not modified");
}

const stamp =
  fs.existsSync(path.join(liveDir, "BUILD_ID"))
    ? fs.readFileSync(path.join(liveDir, "BUILD_ID"), "utf8").trim()
    : "pre";
const backupDir = path.join(root, `.next.bak.${stamp}.${process.pid}`);

if (fs.existsSync(liveDir)) {
  fs.rmSync(backupDir, { recursive: true, force: true });
  fs.renameSync(liveDir, backupDir);
  console.log(`==> Atomic swap: moved live .next -> ${path.basename(backupDir)}`);
}

fs.renameSync(newDir, liveDir);
const buildId = fs
  .readFileSync(path.join(liveDir, "BUILD_ID"), "utf8")
  .trim();
console.log(`==> Atomic swap: .next.new -> .next (BUILD_ID=${buildId})`);

fs.writeFileSync(path.join(root, ".next.atomic-backup"), backupDir, "utf8");
