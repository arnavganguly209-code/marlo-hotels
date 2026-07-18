import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { orbitLog } from "@/lib/orbit/logger";

/**
 * Prisma client singleton.
 *
 * Returns `null` when DATABASE_URL is not configured, or when the client
 * cannot be constructed, so Orbit pages never crash on a bad DB env.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaInitFailed?: boolean;
};

function createClient(connectionString: string) {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export function getDb(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return null;
  if (globalForPrisma.prismaInitFailed) return null;

  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = createClient(connectionString);
    } catch (error) {
      globalForPrisma.prismaInitFailed = true;
      orbitLog("error", "Prisma client initialization failed", error);
      return null;
    }
  }

  return globalForPrisma.prisma ?? null;
}
