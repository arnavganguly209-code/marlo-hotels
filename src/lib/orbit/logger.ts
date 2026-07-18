/**
 * Orbit production logger — writes to stdout/stderr so PM2 captures errors.
 */
export function orbitLog(
  level: "info" | "warn" | "error",
  message: string,
  detail?: unknown
) {
  const prefix = `[orbit] ${new Date().toISOString()} ${message}`;
  if (detail === undefined) {
    console[level](prefix);
    return;
  }
  console[level](prefix, detail);
}

export function isNextNavigationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = "digest" in error ? String((error as { digest?: unknown }).digest) : "";
  return (
    digest.startsWith("NEXT_REDIRECT") ||
    digest.startsWith("NEXT_NOT_FOUND") ||
    digest === "DYNAMIC_SERVER_USAGE"
  );
}
