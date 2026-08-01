"use client";

import { useEffect } from "react";

/**
 * Keeps the Orbit session idle clock sliding while the admin UI is open,
 * so Save / media upload do not return Unauthorized mid-edit.
 */
export function OrbitSessionKeepAlive() {
  useEffect(() => {
    let cancelled = false;

    async function ping() {
      try {
        await fetch("/api/orbit/auth/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
      } catch {
        // Ignore — next user action will surface auth errors if needed.
      }
    }

    void ping();
    const id = window.setInterval(() => {
      if (!cancelled) void ping();
    }, 4 * 60_000);

    const onFocus = () => {
      void ping();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
