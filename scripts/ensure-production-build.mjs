/**
 * Refuse to start Next.js unless a production build exists.
 * Prevents PM2 restart loops with:
 * "Could not find a production build in the .next directory."
 */
import { accessSync, constants } from "node:fs";
import path from "node:path";

const buildId = path.join(process.cwd(), ".next", "BUILD_ID");

try {
  accessSync(buildId, constants.R_OK);
} catch {
  console.error(
    [
      "FATAL: No production build found (.next/BUILD_ID missing).",
      "Run `npm run build` successfully before starting the server.",
      "Refusing to start so PM2 does not enter a restart loop.",
    ].join("\n")
  );
  process.exit(1);
}
