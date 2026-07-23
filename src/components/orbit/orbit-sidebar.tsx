"use client";

import {
  BadgePercent,
  BedDouble,
  CalendarCheck,
  Compass,
  DatabaseBackup,
  Flower2,
  HeartHandshake,
  Images,
  LayoutDashboard,
  Menu,
  MessagesSquare,
  NotebookPen,
  PanelsTopLeft,
  Presentation,
  Quote,
  ScrollText,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Star,
  UtensilsCrossed,
  UsersRound,
  X,
  MailPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { orbitModules } from "@/lib/orbit/modules";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  "layout-template": PanelsTopLeft,
  "bed-double": BedDouble,
  utensils: UtensilsCrossed,
  "flower-2": Flower2,
  images: Images,
  "badge-percent": BadgePercent,
  compass: Compass,
  "heart-handshake": HeartHandshake,
  presentation: Presentation,
  "notebook-pen": NotebookPen,
  quote: Quote,
  star: Star,
  "mail-plus": MailPlus,
  "calendar-check": CalendarCheck,
  "messages-square": MessagesSquare,
  "folder-image": Images,
  "search-check": SearchCheck,
  "menu-square": Menu,
  "settings-2": Settings2,
  "users-round": UsersRound,
  "shield-check": ShieldCheck,
  "database-backup": DatabaseBackup,
  "scroll-text": ScrollText,
};

const GROUP_ORDER = ["Website", "Operations", "Platform"] as const;

const GROUP_LABEL: Record<(typeof GROUP_ORDER)[number], string> = {
  Website: "Website",
  Operations: "Operations",
  Platform: "Platform",
};

export function OrbitSidebar({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-24 items-center justify-between border-b border-white/8 px-6">
        <Link href="/orbit/dashboard" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl ?? "/images/brand/logo.png"}
            alt="Marlo Hotels"
            width={230}
            height={90}
            className="h-auto w-36 bg-transparent object-contain"
          />
        </Link>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="grid size-9 place-items-center rounded-full text-white/50 hover:bg-white/5 lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="orbit-scrollbar flex-1 overflow-y-auto px-3 py-5">
        <Link
          href="/orbit/dashboard"
          onClick={() => setOpen(false)}
          className={cn(
            "mb-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
            pathname === "/orbit/dashboard"
              ? "bg-[#d0a654] text-[#101913] shadow-[0_12px_30px_-15px_#d0a654]"
              : "text-white/65 hover:bg-white/5 hover:text-white"
          )}
        >
          <LayoutDashboard className="size-[18px]" />
          Dashboard
        </Link>

        {GROUP_ORDER.map((group) => (
          <div key={group} className="mb-6">
            <p className="mb-2 px-4 text-[9px] font-semibold tracking-[0.3em] text-[#d0a654]/70 uppercase">
              {GROUP_LABEL[group]}
            </p>
            <ul className="space-y-0.5">
              {orbitModules
                .filter((module) => module.group === group)
                .map((module) => {
                  const Icon = icons[module.icon] ?? PanelsTopLeft;
                  const href = `/orbit/${module.slug}`;
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <li key={module.slug}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] transition",
                          active
                            ? "bg-white/8 text-[#e1bd71]"
                            : "text-white/52 hover:bg-white/4 hover:text-white/90"
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition",
                            active
                              ? "text-[#d0a654]"
                              : "text-white/35 group-hover:text-[#d0a654]"
                          )}
                        />
                        <span>{module.label}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 px-6 py-5">
        <p className="text-[9px] tracking-[0.24em] text-white/25 uppercase">
          Orbit Enterprise
        </p>
        <p className="mt-1 text-xs text-white/45">
          Page-based CMS · Marlo Hotels
        </p>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed top-4 left-4 z-40 grid size-11 place-items-center rounded-xl bg-[#10251e] text-[#d0a654] shadow-lg lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[300px] border-r border-white/8 bg-[var(--orbit-sidebar)] shadow-2xl transition-transform duration-500 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content}
      </aside>
    </>
  );
}
