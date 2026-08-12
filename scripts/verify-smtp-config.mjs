#!/usr/bin/env node
/**
 * Verifies Marlo booking SMTP env without printing secrets.
 *
 * Usage (local or VPS):
 *   node --env-file=.env scripts/verify-smtp-config.mjs
 *   node --env-file=.env scripts/verify-smtp-config.mjs --connect
 *
 * --connect runs nodemailer.verify() when SMTP_PASSWORD is set.
 */
import nodemailer from "nodemailer";

const required = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_FROM",
  "BOOKING_NOTIFICATION_EMAIL",
];

function present(key) {
  const value = process.env[key];
  return Boolean(value && String(value).trim());
}

function mask(key) {
  if (key === "SMTP_PASSWORD") {
    return present(key) ? "[set]" : "[missing]";
  }
  const value = process.env[key]?.trim() || "";
  return value ? value : "[missing]";
}

let failed = false;
console.log("==> Marlo Hotels SMTP configuration check");
console.log("    (password values are never printed)\n");

for (const key of required) {
  const ok = present(key);
  console.log(`  ${ok ? "OK " : "MISS"}  ${key}=${mask(key)}`);
  if (!ok) failed = true;
}

const passwordOk = present("SMTP_PASSWORD");
console.log(`  ${passwordOk ? "OK " : "MISS"}  SMTP_PASSWORD=${mask("SMTP_PASSWORD")}`);
if (!passwordOk) failed = true;

const encryption = (process.env.SMTP_ENCRYPTION || "tls").trim().toLowerCase();
const port = Number(process.env.SMTP_PORT || "587");
console.log(`\n  encryption=${encryption}  port=${port}`);

if (failed) {
  console.error("\nFAIL: required SMTP env vars are incomplete.");
  console.error("Set them in the production .env (or PM2 env), then reload PM2.");
  process.exit(1);
}

if (!process.argv.includes("--connect")) {
  console.log("\nOK: SMTP env shape looks correct.");
  console.log("Re-run with --connect after SMTP_PASSWORD is set to test the mail server.");
  process.exit(0);
}

const secure = encryption === "ssl" || encryption === "smtps" || port === 465;
const requireTLS =
  encryption === "tls" ||
  encryption === "starttls" ||
  encryption === "start_tls" ||
  (!secure && port === 587);

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST.trim(),
  port,
  secure,
  requireTLS,
  auth: {
    user: process.env.SMTP_USER.trim(),
    pass: process.env.SMTP_PASSWORD.trim(),
  },
  tls: { minVersion: "TLSv1.2" },
});

try {
  await transport.verify();
  console.log("\nOK: SMTP server accepted authentication (verify succeeded).");
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown SMTP error";
  console.error("\nFAIL: SMTP verify failed.");
  console.error(`  error=${message}`);
  process.exit(1);
}
