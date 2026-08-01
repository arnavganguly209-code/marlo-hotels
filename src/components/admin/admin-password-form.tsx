"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ADMIN_USER_ID } from "@/lib/admin/auth-public";

export function AdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Could not update password.");
        return;
      }
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Connection issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
    >
      <label className="block">
        <span className="text-[10px] font-semibold tracking-[0.24em] text-[#D9B46B] uppercase">
          User ID
        </span>
        <input
          value={ADMIN_USER_ID}
          readOnly
          className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-cream-200/70 outline-none"
        />
        <span className="mt-1.5 block text-xs text-cream-200/45">
          User ID cannot be changed.
        </span>
      </label>

      <label className="mt-5 block">
        <span className="text-[10px] font-semibold tracking-[0.24em] text-[#D9B46B] uppercase">
          Current Password
        </span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-transparent px-3 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-[10px] font-semibold tracking-[0.24em] text-[#D9B46B] uppercase">
          New Password
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-transparent px-3 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-[10px] font-semibold tracking-[0.24em] text-[#D9B46B] uppercase">
          Confirm New Password
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-transparent px-3 text-sm text-ivory outline-none focus:border-[#D9B46B]/50"
        />
      </label>

      {error ? (
        <p className="mt-5 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mt-5 text-sm text-emerald-300" role="status">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#D8A53F] to-[#C9922A] px-6 text-[11px] font-semibold tracking-[0.22em] text-charcoal-950 uppercase disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        Update Password
      </button>
    </form>
  );
}
