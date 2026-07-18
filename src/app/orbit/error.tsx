"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function OrbitError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[orbit] client boundary captured error", error);
  }, [error]);

  return (
    <div className="grid min-h-svh place-items-center bg-[#081310] px-6 text-center text-[#f8f2e7]">
      <div className="max-w-md">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-[#d0a654] uppercase">
          Orbit
        </p>
        <h1 className="font-display mt-4 text-3xl font-medium">
          Something interrupted Orbit
        </h1>
        <p className="mt-3 text-sm font-light text-white/55">
          The administration console recovered from a server error. You can retry
          or return to the secure login.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-[11px] text-white/35">
            Digest {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-[#d0a654] px-5 py-3 text-[11px] font-semibold tracking-[0.2em] text-[#101913] uppercase"
          >
            Try again
          </button>
          <Link
            href="/orbit"
            className="rounded-xl border border-white/15 px-5 py-3 text-[11px] font-semibold tracking-[0.2em] text-white/80 uppercase"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
