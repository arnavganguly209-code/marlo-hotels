"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo, type LogoDisplaySettings } from "@/components/layout/logo";
import { NavPanel } from "@/components/layout/nav-panel";
import { resolveSiteSearch } from "@/lib/resolve-site-search";
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
  const router = useRouter();

  function onSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    const href = resolveSiteSearch(q);
    setQuery("");
    router.push(href);
  }

  function onLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const onHome = pathname === "/" || pathname === "";
    if (!onHome) return;
    event.preventDefault();
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollTop();
    window.requestAnimationFrame(scrollTop);
    window.setTimeout(scrollTop, 350);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[rgba(255,255,255,0.45)] bg-[rgba(252,249,243,0.72)] shadow-[0_6px_24px_-12px_rgba(40,32,20,0.12)] backdrop-blur-[22px]">
        <div className="mx-auto flex h-[4.5rem] max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Logo
            tone="light"
            src={logoUrl}
            display={logoDisplay}
            onClick={onLogoClick}
          />

          <nav
            aria-label="Primary"
            className="ml-2 hidden flex-1 items-center justify-center gap-8 xl:flex"
          >
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] font-semibold tracking-[0.26em] uppercase antialiased [text-rendering:optimizeLegibility] transition-colors duration-300",
                  pathname.startsWith(link.href)
                    ? "text-[#C09252]"
                    : "text-[#4A8587] hover:text-[#C09252]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
            <form
              onSubmit={onSearch}
              className="hidden items-center rounded-full border border-[rgba(95,107,78,0.22)] bg-[rgba(255,252,247,0.88)] px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-[20px] md:flex"
              role="search"
            >
              <Search className="size-3.5 shrink-0 text-[#B8954F]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rooms, dining…"
                aria-label="Search the hotel"
                className="w-28 bg-transparent pl-2 text-xs font-medium tracking-wide text-[#4A5340] outline-none placeholder:font-normal placeholder:text-[#8A917C] lg:w-36"
              />
            </form>

            <Link
              href="/booking"
              className="hidden h-10 items-center rounded-full border border-[#B8954F]/75 px-5 text-[10px] font-semibold tracking-[0.2em] text-[#9A7A3E] uppercase transition hover:bg-[rgba(184,149,79,0.12)] md:inline-flex"
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
