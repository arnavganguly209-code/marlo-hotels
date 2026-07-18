"use client";

import { Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function OrbitLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passkey, setPasskey] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("reason") === "session-expired"
      ? "Your secure session expired. Sign in again."
      : null
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/orbit/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey }),
      });
      const result = (await response.json()) as {
        error?: string;
        remainingAttempts?: number;
      };
      if (!response.ok) {
        const remaining =
          typeof result.remainingAttempts === "number"
            ? ` ${result.remainingAttempts} attempt${result.remainingAttempts === 1 ? "" : "s"} remaining.`
            : "";
        setError(`${result.error ?? "Unable to sign in."}${remaining}`);
        return;
      }
      const requested = searchParams.get("next");
      router.replace(
        requested?.startsWith("/orbit/") ? requested : "/orbit/dashboard"
      );
      router.refresh();
    } catch {
      setError("Orbit could not reach the server. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-9" noValidate>
      <label
        htmlFor="orbit-passkey"
        className="text-[10px] font-medium tracking-[0.28em] text-[#d6bd83] uppercase"
      >
        Orbit passkey
      </label>
      <div className="group mt-3 flex items-center rounded-xl border border-white/12 bg-black/20 px-4 transition focus-within:border-[#d0a654]/70 focus-within:bg-black/30">
        <KeyRound className="size-4 shrink-0 text-[#d0a654]" />
        <input
          id="orbit-passkey"
          type={visible ? "text" : "password"}
          value={passkey}
          onChange={(event) => setPasskey(event.target.value)}
          autoComplete="current-password"
          autoFocus
          required
          placeholder="Enter secure passkey"
          className="h-14 min-w-0 flex-1 bg-transparent px-3 text-sm tracking-[0.12em] text-white outline-none placeholder:tracking-normal placeholder:text-white/28"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide passkey" : "Show passkey"}
          className="grid size-9 place-items-center rounded-full text-white/45 transition hover:bg-white/5 hover:text-[#d0a654]"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-red-300/15 bg-red-950/25 px-4 py-3 text-xs leading-relaxed text-red-200"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !passkey}
        className="orbit-gold-button mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-xl text-[11px] font-semibold tracking-[0.25em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Verifying
          </>
        ) : (
          <>
            <LockKeyhole className="size-4" />
            Enter Orbit
          </>
        )}
      </button>

      <p className="mt-5 flex items-center justify-center gap-2 text-[10px] tracking-[0.14em] text-white/35">
        <LockKeyhole className="size-3" />
        Encrypted · HttpOnly session · 30-minute inactivity timeout
      </p>
    </form>
  );
}
