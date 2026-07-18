"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/layout/logo";
import { NavPanel } from "@/components/layout/nav-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  { label: "Rooms & Suites", href: "/rooms" },
  { label: "Dining", href: "/dining" },
  { label: "Spa", href: "/spa" },
  { label: "Experiences", href: "/experiences" },
  { label: "Offers", href: "/offers" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 transition-all duration-700",
          scrolled
            ? "glass-dark border-x-0 border-t-0 py-3 shadow-luxury-sm"
            : "border-transparent bg-gradient-to-b from-charcoal-950/60 to-transparent py-5"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8">
          <Logo tone="light" />

          <nav aria-label="Primary" className="hidden items-center gap-9 xl:flex">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "link-underline text-[11px] font-medium tracking-[0.24em] uppercase transition-colors duration-300",
                  pathname.startsWith(link.href)
                    ? "text-gold-400"
                    : "text-cream-100/85 hover:text-gold-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link href="/booking">Reserve Now</Link>
            </Button>
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
