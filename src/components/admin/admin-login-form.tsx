"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Loader2, Lock, User } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Unable to sign in.");
        return;
      }
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="admin-login-card relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-[rgb(245_240_228_/_0.16)] p-8 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_0.55)] backdrop-blur-[28px] backdrop-saturate-150 sm:p-10"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

      <div className="flex justify-center">
        <Logo tone="light" />
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] font-semibold tracking-[0.32em] text-[#D9B46B] uppercase">
          Hotel Administration
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.02em] text-[#FFFCF7]">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-cream-200/70">
          Sign in to manage bookings, rooms and guest services.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="text-[10px] font-semibold tracking-[0.28em] text-[#D9B46B] uppercase">
            User ID
          </span>
          <div className="mt-2 flex items-center gap-3 border-b border-white/20 pb-2">
            <User className="size-4 text-[#D9B46B]" />
            <input
              type="text"
              autoComplete="username"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-[#F8F4EC] outline-none placeholder:text-white/40"
              placeholder="Enter User ID"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold tracking-[0.28em] text-[#D9B46B] uppercase">
            Password
          </span>
          <div className="mt-2 flex items-center gap-3 border-b border-white/20 pb-2">
            <Lock className="size-4 text-[#D9B46B]" />
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-[#F8F4EC] outline-none placeholder:text-white/40"
              placeholder="Enter password"
            />
          </div>
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#D8A53F] to-[#C9922A] text-[11px] font-semibold tracking-[0.24em] text-charcoal-950 uppercase shadow-[0_14px_36px_-10px_rgb(201_146_42_/_0.55)] transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        Login
      </button>
    </form>
  );
}
