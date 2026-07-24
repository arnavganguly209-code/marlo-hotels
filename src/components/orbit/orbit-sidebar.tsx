"use client";

import {
  BadgePercent,
  BedDouble,
  BookOpen,
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
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  "layout-template": PanelsTopLeft,
  "book-open": BookOpen,
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

/** Flat page list — no Website / Homepage nesting. */
const PRIMARY_NAV: { slug: string; label: string; icon: string }[] = [
  { slug: "homepage", label: "Homepage", icon: "layout-template" },
  { slug: "about", label: "About", icon: "book-open" },
  { slug: "rooms", label: "Rooms", icon: "bed-double" },
  { slug: "dining", label: "Dining", icon: "utensils" },
  { slug: "spa", label: "Spa", icon: "flower-2" },
  { slug: "gallery", label: "Gallery", icon: "images" },
  { slug: "offers", label: "Offers", icon: "badge-percent" },
  { slug: "experiences", label: "Experiences", icon: "compass" },
  { slug: "wedding", label: "Wedding", icon: "heart-handshake" },
  { slug: "meetings", label: "Meetings", icon: "presentation" },
  { slug: "blog", label: "Blog", icon: "notebook-pen" },
  { slug: "contact", label: "Contact", icon: "messages-square" },
  { slug: "footer", label: "Footer", icon: "menu-square" },
  { slug: "media-library", label: "Media Library", icon: "folder-image" },
  { slug: "seo", label: "SEO", icon: "search-check" },
  { slug: "site-settings", label: "Settings", icon: "settings-2" },
];

const ADMIN_NAV: { slug: string; label: string; icon: string }[] = [
  { slug: "testimonials", label: "Testimonials", icon: "quote" },
  { slug: "bookings", label: "Bookings", icon: "calendar-check" },
  { slug: "contact-messages", label: "Messages", icon: "messages-square" },
  { slug: "newsletter", label: "Newsletter", icon: "mail-plus" },
  { slug: "reviews", label: "Reviews", icon: "star" },
  { slug: "users", label: "Users", icon: "users-round" },
  { slug: "security", label: "Security", icon: "shield-check" },
  { slug: "backup", label: "Backup", icon: "database-backup" },
  { slug: "system-logs", label: "Logs", icon: "scroll-text" },
];

function NavLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = icons[icon] ?? PanelsTopLeft;
  return (
    <Link
      href={href}
      onClick={onClick}
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
          active ? "text-[#d0a654]" : "text-white/35 group-hover:text-[#d0a654]"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

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
            "mb-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition",
            pathname === "/orbit/dashboard"
              ? "bg-[#d0a654] text-[#101913] shadow-[0_12px_30px_-15px_#d0a654]"
              : "text-white/65 hover:bg-white/5 hover:text-white"
          )}
        >
          <LayoutDashboard className="size-[18px]" />
          Dashboard
        </Link>

        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => {
            const href = `/orbit/${item.slug}`;
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={item.slug}>
                <NavLink
                  href={href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                  onClick={() => setOpen(false)}
                />
              </li>
            );
          })}
        </ul>

        <p className="mt-8 mb-2 px-4 text-[9px] font-semibold tracking-[0.3em] text-white/25 uppercase">
          Admin
        </p>
        <ul className="space-y-0.5">
          {ADMIN_NAV.map((item) => {
            const href = `/orbit/${item.slug}`;
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={item.slug}>
                <NavLink
                  href={href}
                  label={item.label}
                  icon={item.icon}
                  active={active}
                  onClick={() => setOpen(false)}
                />
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/8 px-6 py-5">
        <p className="text-[9px] tracking-[0.24em] text-white/25 uppercase">
          Orbit CMS
        </p>
        <p className="mt-1 text-xs text-white/45">Marlo Hotels</p>
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
          "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/8 bg-[var(--orbit-sidebar)] shadow-2xl transition-transform duration-500 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content}
      </aside>
    </>
  );
}
