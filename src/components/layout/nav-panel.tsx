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
        className="invisible fixed inset-0 z-40 bg-[rgba(40,36,28,0.28)] opacity-0 backdrop-blur-sm"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="preserve-type invisible fixed top-0 right-0 z-50 flex h-dvh w-[88vw] max-w-sm flex-col overflow-y-auto border border-[#EDE6D8] bg-[#FFFCF7] px-8 py-8 shadow-[0_12px_40px_-16px_rgba(40,32,20,0.14)] md:top-4 md:right-4 md:h-[calc(100dvh-2rem)] md:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.32em] text-[#C09252] uppercase">
            Menu
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-10 place-items-center rounded-full border border-[rgba(74,133,135,0.28)] text-[#4A8587] transition-colors duration-300 hover:border-[#C09252]/55 hover:text-[#C09252]"
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
                        ? "bg-[rgba(192,146,82,0.12)] text-[#C09252]"
                        : "text-[#4A8587] hover:bg-[rgba(74,133,135,0.08)] hover:text-[#C09252]"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 place-items-center rounded-full border transition-colors duration-300",
                        active
                          ? "border-[#C09252]/55 text-[#C09252]"
                          : "border-[rgba(74,133,135,0.28)] group-hover:border-[#C09252]/45"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-semibold tracking-[0.14em]">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div data-nav-item className="mt-8 border-t border-[rgba(74,133,135,0.16)] pt-6">
          <Button asChild variant="gold" size="md" className="w-full">
            <Link href="/booking" onClick={onClose}>
              Reserve Now
            </Link>
          </Button>
          <p className="mt-5 text-center text-xs font-medium tracking-wider text-[#4A8587]/75">
            {siteConfig.contact.reservations}
            <span className="mx-2 text-[#C09252]">·</span>
            {siteConfig.contact.reservationsEmail}
          </p>
        </div>
      </aside>
    </>
  );
}
