"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { adminNav } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {adminNav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "rounded-lg px-3 py-2.5 text-[12px] font-medium tracking-[0.04em] transition",
              active
                ? "bg-[#C09252]/18 text-[#D9B46B]"
                : "text-cream-200/75 hover:bg-white/5 hover:text-ivory"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-[#0B1713] text-cream-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#0F1F1A] lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-ivory">
            Marlo Hotels
          </p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.28em] text-[#D9B46B] uppercase">
            Administration
          </p>
        </div>
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-[#0F1F1A] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="font-display text-xl text-ivory">Marlo Hotels</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-white/15"
              >
                <X className="size-4" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#0F1F1A]/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-white/15 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
            <p className="font-display text-xl font-semibold text-ivory lg:hidden">
              Marlo Hotels
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full border border-white/15 text-cream-200/80"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>
            <span className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-emerald-300 uppercase sm:inline-flex">
              <Shield className="size-3.5" />
              Secure Session
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[10px] font-semibold tracking-[0.2em] text-cream-200 uppercase transition hover:border-[#D9B46B]/50 hover:text-[#D9B46B]"
            >
              <LogOut className="size-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

        <footer className="border-t border-white/10 px-4 py-4 text-center text-[11px] tracking-[0.08em] text-cream-200/45 sm:px-6">
          Software Developed by{" "}
          <a
            href="https://theglobalorbit.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D9B46B] hover:underline"
          >
            Global Orbit
          </a>
        </footer>
      </div>
    </div>
  );
}
