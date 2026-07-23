"use client";

import {
  Bell,
  Clock3,
  ExternalLink,
  LogOut,
  Search,
  UserRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { moduleBySlug, orbitModules } from "@/lib/orbit/modules";
import { HOMEPAGE_SECTIONS } from "@/lib/homepage-schema";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  href: string;
  kind?: string;
};

type RecentChange = {
  id: string;
  summary: string;
  module: string;
  createdAt: string;
  href: string;
};

const QUICK_ACTIONS = [
  { label: "Edit homepage", href: "/orbit/homepage" },
  { label: "Upload media", href: "/orbit/media-library?upload=1" },
  { label: "Rooms", href: "/orbit/rooms" },
  { label: "Messages", href: "/orbit/contact-messages" },
  { label: "Bookings", href: "/orbit/bookings" },
  { label: "Site settings", href: "/orbit/site-settings" },
];

export function OrbitHeader() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<
    null | "notifications" | "recent" | "profile" | "quick"
  >(null);
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState({
    name: "Administrator",
    role: "Orbit Admin",
  });

  const slug = pathname.split("/")[2] ?? "dashboard";
  const title =
    slug === "dashboard" ? "Dashboard" : moduleBySlug.get(slug)?.label ?? "Orbit";

  useEffect(() => {
    let active = true;
    void fetch("/api/orbit/activity")
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (data: {
          notifications?: ActivityItem[];
          recentChanges?: RecentChange[];
          unreadCount?: number;
          profile?: { name: string; role: string };
        } | null) => {
          if (!active || !data) return;
          setNotifications(data.notifications || []);
          setRecentChanges(data.recentChanges || []);
          setUnreadCount(data.unreadCount || 0);
          if (data.profile) setProfile(data.profile);
        }
      )
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const moduleHits = orbitModules
      .filter(
        (module) =>
          module.label.toLowerCase().includes(q) ||
          module.slug.toLowerCase().includes(q) ||
          module.description.toLowerCase().includes(q)
      )
      .map((module) => ({
        href: `/orbit/${module.slug}`,
        label: module.label,
        group: "Modules",
      }));
    const sectionHits = HOMEPAGE_SECTIONS.filter(
      (section) =>
        section.label.toLowerCase().includes(q) ||
        section.key.toLowerCase().includes(q)
    ).map((section) => ({
      href: `/orbit/homepage?section=${section.key}`,
      label: section.label,
      group: "Homepage",
    }));
    const actionHits = QUICK_ACTIONS.filter((action) =>
      action.label.toLowerCase().includes(q)
    ).map((action) => ({
      href: action.href,
      label: action.label,
      group: "Actions",
    }));
    return [...moduleHits, ...sectionHits, ...actionHits].slice(0, 12);
  }, [query]);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/orbit/auth/logout", { method: "POST" });
    } finally {
      router.replace("/orbit");
      router.refresh();
    }
  }

  function closePanels() {
    setPanel(null);
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
        <div className="relative hidden md:block">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#1a3c31]/40" />
          <input
            type="search"
            aria-label="Search Orbit"
            placeholder="Search modules & sections"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              closePanels();
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="h-10 w-44 rounded-xl border border-[#17362b]/10 bg-white/70 pr-4 pl-10 text-xs text-[#10251e] outline-none transition focus:border-[#c4943c]/50 lg:w-64"
          />
          {open && results.length > 0 ? (
            <div className="absolute top-12 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-xl">
              {results.map((item) => (
                <button
                  key={item.href + item.label}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    router.push(item.href);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f4f2eb]"
                >
                  <span className="text-sm font-medium text-[#10251e]">
                    {item.label}
                  </span>
                  <span className="text-[9px] tracking-[0.14em] text-[#a67a30] uppercase">
                    {item.group}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Quick actions"
            onClick={() => setPanel(panel === "quick" ? null : "quick")}
            className="hidden h-10 items-center gap-2 rounded-xl border border-[#17362b]/10 bg-white/70 px-3 text-[10px] font-semibold tracking-[0.14em] text-[#21483b] uppercase transition hover:border-[#c4943c]/40 hover:text-[#a67a30] lg:flex"
          >
            <Zap className="size-3.5" /> Quick actions
          </button>
          {panel === "quick" ? (
            <Dropdown
              onClose={closePanels}
              title="Quick actions"
              items={QUICK_ACTIONS.map((action) => ({
                id: action.href,
                title: action.label,
                detail: "Jump to module",
                href: action.href,
              }))}
              onSelect={(href) => {
                router.push(href);
                closePanels();
              }}
            />
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Recent changes"
            onClick={() => setPanel(panel === "recent" ? null : "recent")}
            className="hidden size-10 place-items-center rounded-xl border border-[#17362b]/10 bg-white/70 text-[#21483b] transition hover:border-[#c4943c]/40 hover:text-[#a67a30] sm:grid"
          >
            <Clock3 className="size-[17px]" />
          </button>
          {panel === "recent" ? (
            <Dropdown
              onClose={closePanels}
              title="Recent changes"
              items={recentChanges.map((item) => ({
                id: item.id,
                title: item.summary,
                detail: item.module,
                href: item.href,
              }))}
              empty="No recent changes yet"
              onSelect={(href) => {
                router.push(href);
                closePanels();
              }}
            />
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              setPanel(panel === "notifications" ? null : "notifications")
            }
            className="relative grid size-10 place-items-center rounded-xl border border-[#17362b]/10 bg-white/70 text-[#21483b] transition hover:border-[#c4943c]/40 hover:text-[#a67a30]"
          >
            <Bell className="size-[17px]" />
            {unreadCount > 0 ? (
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#c4943c]" />
            ) : null}
          </button>
          {panel === "notifications" ? (
            <Dropdown
              onClose={closePanels}
              title="Notifications"
              items={notifications.map((item) => ({
                id: item.id,
                title: item.title,
                detail: item.detail,
                href: item.href,
              }))}
              empty="You're all caught up"
              onSelect={(href) => {
                router.push(href);
                closePanels();
              }}
            />
          ) : null}
        </div>

        <Link
          href="/"
          target="_blank"
          className="hidden h-10 items-center gap-2 rounded-xl border border-[#17362b]/10 bg-white/70 px-4 text-[10px] font-semibold tracking-[0.17em] text-[#21483b] uppercase transition hover:border-[#c4943c]/40 hover:text-[#a67a30] sm:flex"
        >
          View site <ExternalLink className="size-3.5" />
        </Link>

        <div className="relative">
          <button
            type="button"
            aria-label="Profile"
            onClick={() => setPanel(panel === "profile" ? null : "profile")}
            className="grid size-10 place-items-center rounded-xl border border-[#17362b]/10 bg-white/70 text-[#21483b] transition hover:border-[#c4943c]/40 hover:text-[#a67a30]"
          >
            <UserRound className="size-[17px]" />
          </button>
          {panel === "profile" ? (
            <div className="absolute top-12 right-0 z-50 w-72 overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-xl">
              <div className="border-b border-[#17362b]/8 px-4 py-4">
                <p className="text-sm font-semibold text-[#10251e]">
                  {profile.name}
                </p>
                <p className="mt-1 text-[11px] text-[#738078]">{profile.role}</p>
              </div>
              <Link
                href="/orbit/security"
                onClick={closePanels}
                className="block px-4 py-3 text-sm text-[#21483b] hover:bg-[#f4f2eb]"
              >
                Security & passkey
              </Link>
              <Link
                href="/orbit/users"
                onClick={closePanels}
                className="block px-4 py-3 text-sm text-[#21483b] hover:bg-[#f4f2eb]"
              >
                Users
              </Link>
              <button
                type="button"
                onClick={logout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut className="size-3.5" />
                {loggingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function Dropdown({
  title,
  items,
  empty = "Nothing here yet",
  onSelect,
  onClose,
}: {
  title: string;
  items: { id: string; title: string; detail: string; href: string }[];
  empty?: string;
  onSelect: (href: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-0 z-40 cursor-default"
        onClick={onClose}
      />
      <div className="absolute top-12 right-0 z-50 w-80 overflow-hidden rounded-2xl border border-[#17362b]/10 bg-white shadow-xl">
        <div className="border-b border-[#17362b]/8 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a67a30] uppercase">
            {title}
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length ? (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.href)}
                className="block w-full px-4 py-3 text-left hover:bg-[#f4f2eb]"
              >
                <p className="truncate text-sm font-medium text-[#10251e]">
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[#738078]">
                  {item.detail}
                </p>
              </button>
            ))
          ) : (
            <p className="px-4 py-8 text-center text-xs text-[#8a948f]">
              {empty}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
