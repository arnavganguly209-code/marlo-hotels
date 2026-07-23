"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo, type LogoDisplaySettings } from "@/components/layout/logo";
import { NavPanel } from "@/components/layout/nav-panel";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "Dining", href: "/dining" },
  { label: "Spa", href: "/spa" },
  { label: "Experiences", href: "/experiences" },
  { label: "Offers", href: "/offers" },
];

export function Header({
  logoUrl,
  logoDisplay,
}: {
  logoUrl?: string;
  logoDisplay?: LogoDisplaySettings;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `/rooms?q=${encodeURIComponent(q)}`;
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[rgb(10_24_20_/_0.72)] shadow-[0_18px_50px_-28px_rgb(0_0_0_/_0.65)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[4.5rem] max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Logo tone="light" src={logoUrl} display={logoDisplay} />

          <nav
            aria-label="Primary"
            className="ml-2 hidden flex-1 items-center justify-center gap-8 xl:flex"
          >
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] font-medium tracking-[0.22em] uppercase transition-colors duration-300",
                  pathname.startsWith(link.href)
                    ? "text-gold-400"
                    : "text-cream-50/90 hover:text-gold-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
            <form
              onSubmit={onSearch}
              className="hidden items-center rounded-full border border-white/15 bg-[rgb(10_24_20_/_0.55)] px-3.5 py-2 backdrop-blur-xl md:flex"
              role="search"
            >
              <Search className="size-3.5 text-gold-400/80" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search..."
                aria-label="Search"
                className="w-28 bg-transparent pl-2 text-xs text-cream-50 outline-none placeholder:text-cream-100/45 lg:w-36"
              />
            </form>

            <Link
              href="/booking"
              className="hidden h-10 items-center rounded-full border border-gold-400/80 px-5 text-[10px] font-semibold tracking-[0.2em] text-gold-300 uppercase transition hover:bg-gold-500/10 md:inline-flex"
            >
              Reserve Now
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="grid size-11 place-items-center rounded-full bg-gold-500 text-charcoal-950 shadow-gold transition-transform duration-300 hover:scale-105"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <NavPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
