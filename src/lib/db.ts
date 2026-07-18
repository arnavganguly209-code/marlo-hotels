import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma client singleton.
 *
 * Returns `null` when DATABASE_URL is not configured so that API routes
 * degrade gracefully in environments without a provisioned database
 * (e.g. local preview before the VPS Postgres instance exists).
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export function getDb(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient() ?? undefined;
  }
  return globalForPrisma.prisma ?? null;
}
