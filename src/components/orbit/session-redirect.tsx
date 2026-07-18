"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Soft redirect for already-authenticated admins.
 * Runs only in the browser so a bad session never crashes /orbit SSR.
 */
export function OrbitSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/orbit/auth/session", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok || cancelled) return;
        const data = (await response.json()) as { authenticated?: boolean };
        if (data.authenticated && !cancelled) {
          router.replace("/orbit/dashboard");
        }
      } catch {
        // Stay on the login page — never surface a hard failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
