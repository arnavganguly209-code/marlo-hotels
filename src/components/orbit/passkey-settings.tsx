"use client";

import { CheckCircle2, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
};

function PasskeyField({ id, label, value, onChange, autoComplete }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[10px] font-medium tracking-[0.24em] text-[#d0a654]/80 uppercase"
      >
        {label}
      </label>
      <div className="mt-2 flex items-center rounded-xl border border-white/10 bg-black/20 px-4 transition focus-within:border-[#d0a654]/70">
        <KeyRound className="size-4 shrink-0 text-[#d0a654]/70" />
        <input
          id={id}
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none"
        />
      </div>
    </div>
  );
}

export function PasskeySettings() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setDone(false);
    try {
      const response = await fetch("/api/orbit/security/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPasskey: current,
          newPasskey: next,
          confirmPasskey: confirm,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to change the passkey.");
        return;
      }
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      setError("Orbit could not reach the server. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#d0a654]/12 text-[#d0a654]">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-xl font-medium text-white">
            Administrator Passkey
          </h2>
          <p className="mt-1 text-sm font-light text-white/50">
            Rotate the Orbit administrator passkey. The change takes effect
            immediately for all future logins.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="mt-7 grid gap-5 md:grid-cols-3"
      >
        <PasskeyField
          id="passkey-current"
          label="Current passkey"
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasskeyField
          id="passkey-new"
          label="New passkey"
          value={next}
          onChange={setNext}
          autoComplete="new-password"
        />
        <PasskeyField
          id="passkey-confirm"
          label="Confirm new passkey"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        <div className="md:col-span-3">
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-300/15 bg-red-950/25 px-4 py-3 text-xs leading-relaxed text-red-200"
            >
              {error}
            </p>
          ) : null}
          {done ? (
            <p className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-300/15 bg-emerald-950/25 px-4 py-3 text-xs leading-relaxed text-emerald-200">
              <CheckCircle2 className="size-4 shrink-0" />
              The administrator passkey was updated. Use it for the next sign-in.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending || !current || !next || !confirm}
            className="orbit-gold-button inline-flex h-12 items-center justify-center gap-3 rounded-xl px-8 text-[11px] font-semibold tracking-[0.22em] uppercase disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Updating
              </>
            ) : (
              "Update Passkey"
            )}
          </button>
          <p className="mt-3 text-[11px] font-light text-white/35">
            Minimum 8 characters. Existing sessions remain active until they
            expire or are revoked.
          </p>
        </div>
      </form>
    </section>
  );
}
