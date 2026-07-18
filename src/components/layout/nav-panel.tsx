"use client";

import gsap from "gsap";
import {
  BedDouble,
  BookOpen,
  Compass,
  Flower2,
  Gift,
  Home,
  Image as ImageIcon,
  Phone,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { mainNav, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  "bed-double": BedDouble,
  utensils: UtensilsCrossed,
  flower: Flower2,
  compass: Compass,
  image: ImageIcon,
  gift: Gift,
  "book-open": BookOpen,
  phone: Phone,
};

type NavPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function NavPanel({ open, onClose }: NavPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    const items = panel.querySelectorAll("[data-nav-item]");
    const ctx = gsap.context(() => {
      if (open) {
        gsap.set([overlay, panel], { visibility: "visible" });
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .to(overlay, { autoAlpha: 1, duration: 0.5 }, 0)
          .fromTo(
            panel,
            { xPercent: 110 },
            { xPercent: 0, duration: 0.8 },
            0.05
          )
          .fromTo(
            items,
            { autoAlpha: 0, x: 44 },
            { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.055 },
            0.35
          );
      } else {
        gsap
          .timeline({
            defaults: { ease: "power3.inOut" },
            onComplete: () =>
              gsap.set([overlay, panel], { visibility: "hidden" }),
          })
          .to(panel, { xPercent: 110, duration: 0.55 }, 0)
          .to(overlay, { autoAlpha: 0, duration: 0.45 }, 0.05);
      }
    });

    return () => ctx.revert();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        ref={overlayRef}
        onClick={onClose}
        aria-hidden="true"
        className="invisible fixed inset-0 z-40 bg-charcoal-950/60 opacity-0 backdrop-blur-sm"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="glass-dark invisible fixed top-0 right-0 z-50 flex h-dvh w-[88vw] max-w-sm flex-col overflow-y-auto px-8 py-8 md:top-4 md:right-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <p className="eyebrow">Menu</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-full border border-ivory/20 text-cream-100 transition-colors duration-300 hover:border-gold-400 hover:text-gold-400"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="mt-10 flex-1">
          <ul className="space-y-1.5">
            {mainNav.map((item) => {
              const Icon = iconMap[item.icon] ?? Home;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href} data-nav-item>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-300",
                      active
                        ? "bg-ivory/10 text-gold-400"
                        : "text-cream-100/85 hover:bg-ivory/5 hover:text-gold-300"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-full border transition-colors duration-300",
                        active
                          ? "border-gold-500/60 text-gold-400"
                          : "border-ivory/15 group-hover:border-gold-400/50"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-light tracking-[0.14em]">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div data-nav-item className="mt-8 border-t border-ivory/10 pt-6">
          <Button asChild variant="gold" size="md" className="w-full">
            <Link href="/booking" onClick={onClose}>
              Reserve Now
            </Link>
          </Button>
          <p className="mt-5 text-center text-xs font-light tracking-wider text-cream-200/60">
            {siteConfig.contact.reservations}
            <span className="mx-2 text-gold-500">·</span>
            {siteConfig.contact.reservationsEmail}
          </p>
        </div>
      </aside>
    </>
  );
}
