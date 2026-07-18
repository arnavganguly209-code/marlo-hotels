"use client";

import { Bell, ExternalLink, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { moduleBySlug } from "@/lib/orbit/modules";

export function OrbitHeader() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const slug = pathname.split("/")[2] ?? "dashboard";
  const title =
    slug === "dashboard" ? "Dashboard" : moduleBySlug.get(slug)?.label ?? "Orbit";

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/orbit/auth/logout", { method: "POST" });
    } finally {
      router.replace("/orbit");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#17362b]/8 bg-[#f7f6f1]/88 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
      <div className="pl-12 lg:pl-0">
        <p className="text-[9px] font-semibold tracking-[0.3em] text-[#a67a30] uppercase">
          Marlo Orbit
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold text-[#10251e]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden xl:block">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#1a3c31]/40" />
          <input
            type="search"
            aria-label="Search Orbit"
            placeholder="Search Orbit"
            className="h-10 w-56 rounded-xl border border-[#17362b]/10 bg-white/70 pr-4 pl-10 text-xs text-[#10251e] outline-none transition focus:border-[#c4943c]/50"
          />
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-xl border border-[#17362b]/10 bg-white/70 text-[#21483b] transition hover:border-[#c4943c]/40 hover:text-[#a67a30]"
        >
          <Bell className="size-[17px]" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#c4943c]" />
        </button>
        <Link
          href="/"
          target="_blank"
          className="hidden h-10 items-center gap-2 rounded-xl border border-[#17362b]/10 bg-white/70 px-4 text-[10px] font-semibold tracking-[0.17em] text-[#21483b] uppercase transition hover:border-[#c4943c]/40 hover:text-[#a67a30] sm:flex"
        >
          View site <ExternalLink className="size-3.5" />
        </Link>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="flex h-10 items-center gap-2 rounded-xl bg-[#10251e] px-4 text-[10px] font-semibold tracking-[0.17em] text-[#ead39f] uppercase transition hover:bg-[#18372d] disabled:opacity-50"
        >
          <LogOut className="size-3.5" />
          <span className="hidden sm:inline">{loggingOut ? "Signing out" : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
