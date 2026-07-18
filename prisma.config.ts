import { defineConfig } from "prisma/config";

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
