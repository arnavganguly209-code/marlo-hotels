import { config as loadDotenv } from "dotenv";
import { defineConfig } from "prisma/config";

// Ensure Prisma CLI sees the same .env as Next.js / npm scripts.
loadDotenv({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Used by Prisma Migrate; the runtime client connects through the
    // driver adapter configured in src/lib/db.ts.
    url: process.env.DATABASE_URL ?? "",
  },
});
