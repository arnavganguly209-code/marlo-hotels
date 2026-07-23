import {
  Activity,
  BedDouble,
  CalendarDays,
  DollarSign,
  Edit3,
  FilePlus2,
  ImagePlus,
  Mail,
  MessageSquare,
  Newspaper,
  Plus,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { MetricCard } from "@/components/orbit/metric-card";
import { getDb } from "@/lib/db";
import { orbitLog } from "@/lib/orbit/logger";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type DashboardData = {
  revenueValue: number;
  previousRevenueValue: number;
  visitorValue: number;
  previousVisitorValue: number;
  occupancy: number;
  mediaCount: number;
  mediaStorageBytes: number;
  roomCount: number;
  diningCount: number;
  pageCount: number;
  pendingChanges: number;
  lastPublish: Date | null;
  homepageUpdatedAt: Date | null;
  recentActivity: Array<{
    summary: string;
    module: string;
    createdAt: Date;
  }>;
  recentBookings: Array<{
    id: string;
    guestName: string;
    reference: string;
    checkIn: Date;
    totalAmount: { toString(): string } | null;
    status: string;
    room: { name: string };
  }>;
  recentMessages: Array<{
    name: string;
    subject: string;
    createdAt: Date;
  }>;
  recentSubscribers: Array<{
    email: string;
    createdAt: Date;
  }>;
  recentReviews: Array<{
    guestName: string;
    rating: number;
    body: string;
    createdAt: Date;
  }>;
  recentPosts: Array<{
    title: string;
    published: boolean;
    updatedAt: Date;
  }>;
};

async function loadDashboardData(): Promise<DashboardData | null> {
  const db = getDb();
  if (!db) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  try {
    const [
      revenue,
      previousRevenue,
      visitors,
      previousVisitors,
      totalRooms,
      occupiedRooms,
      recentBookings,
      recentMessages,
      recentSubscribers,
      recentReviews,
      recentPosts,
      mediaCount,
      mediaStorage,
      roomCount,
      diningCount,
      pageCount,
      pendingChanges,
      homepageEntry,
      lastPublished,
      recentActivity,
    ] = await Promise.all([
      db.booking.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      db.booking.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: previousMonthStart, lt: monthStart },
        },
        _sum: { totalAmount: true },
      }),
      db.websiteMetric.aggregate({
        where: { date: { gte: monthStart } },
        _sum: { visitors: true },
      }),
      db.websiteMetric.aggregate({
        where: { date: { gte: previousMonthStart, lt: monthStart } },
        _sum: { visitors: true },
      }),
      db.room.count({ where: { published: true } }),
      db.booking.aggregate({
        where: {
          status: "CONFIRMED",
          checkIn: { lte: now },
          checkOut: { gt: now },
        },
        _sum: { rooms: true },
      }),
      db.booking.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { room: { select: { name: true } } },
      }),
      db.contactMessage.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      db.newsletterSubscriber.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      db.review.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      db.post.findMany({ take: 5, orderBy: { updatedAt: "desc" } }),
      db.mediaAsset.count({ where: { deletedAt: null } }),
      db.mediaAsset.aggregate({
        where: { deletedAt: null },
        _sum: { size: true },
      }),
      db.room.count(),
      db.restaurant.count(),
      db.contentEntry.count({
        where: { OR: [{ module: "seo" }, { module: "menus" }, { module: "pages" }] },
      }),
      db.contentEntry.count({ where: { status: { not: "PUBLISHED" } } }),
      db.contentEntry.findUnique({
        where: { module_key: { module: "homepage", key: "visual-editor" } },
      }),
      db.contentEntry.findFirst({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        select: { publishedAt: true },
      }),
      db.orbitAuditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: { summary: true, module: true, createdAt: true },
      }),
    ]);

    const revenueValue = Number(revenue._sum.totalAmount ?? 0);
    const previousRevenueValue = Number(previousRevenue._sum.totalAmount ?? 0);
    const visitorValue = visitors._sum.visitors ?? 0;
    const previousVisitorValue = previousVisitors._sum.visitors ?? 0;
    const occupancy = totalRooms
      ? Math.round(((occupiedRooms._sum.rooms ?? 0) / totalRooms) * 100)
      : 0;

    return {
      revenueValue,
      previousRevenueValue,
      visitorValue,
      previousVisitorValue,
      occupancy,
      mediaCount,
      mediaStorageBytes: mediaStorage._sum.size ?? 0,
      roomCount,
      diningCount,
      pageCount,
      pendingChanges,
      lastPublish: lastPublished?.publishedAt ?? homepageEntry?.publishedAt ?? null,
      homepageUpdatedAt: homepageEntry?.updatedAt ?? null,
      recentActivity,
      recentBookings,
      recentMessages,
      recentSubscribers,
      recentReviews,
      recentPosts,
    };
  } catch (error) {
    orbitLog("error", "Orbit dashboard data query failed", error);
    return null;
  }
}

function DatabaseNotice({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="p-6 sm:p-10">
      <div className="orbit-panel mx-auto max-w-2xl rounded-2xl p-10 text-center">
        <h2 className="font-display text-3xl font-semibold text-[#10251e]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#62716b]">{body}</p>
      </div>
    </div>
  );
}

export default async function OrbitDashboardPage() {
  const data = await loadDashboardData();
  if (!data) {
    const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
    return (
      <DatabaseNotice
        title={
          hasDatabase
            ? "Dashboard data temporarily unavailable"
            : "Database configuration required"
        }
        body={
          hasDatabase
            ? "Orbit authenticated successfully, but the database could not be queried. Confirm PostgreSQL is running, DATABASE_URL is correct in the PM2 environment, and Prisma migrations have been applied (npx prisma db push)."
            : "Set DATABASE_URL, apply the Prisma schema, then reload Orbit. Authentication works without a database; CMS metrics require PostgreSQL."
        }
      />
    );
  }

  const now = new Date();
  const percentageChange = (current: number, previous: number) =>
    previous ? Math.round(((current - previous) / previous) * 100) : 0;

  const quickActions = [
    { label: "Add room", href: "/orbit/rooms?create=1", Icon: Plus },
    { label: "Write article", href: "/orbit/blog?create=1", Icon: FilePlus2 },
    { label: "Upload media", href: "/orbit/media-library?upload=1", Icon: ImagePlus },
    { label: "Edit homepage", href: "/orbit/homepage", Icon: Edit3 },
  ];

  const {
    revenueValue,
    previousRevenueValue,
    visitorValue,
    previousVisitorValue,
    occupancy,
    mediaCount,
    mediaStorageBytes,
    roomCount,
    diningCount,
    pageCount,
    pendingChanges,
    lastPublish,
    homepageUpdatedAt,
    recentActivity,
    recentBookings,
    recentMessages,
    recentSubscribers,
    recentReviews,
    recentPosts,
  } = data;

  const storageMb = Math.round(mediaStorageBytes / (1024 * 1024));

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 xl:px-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.28em] text-[var(--orbit-gold-deep)] uppercase">
            Command center
          </p>
          <h2 className="font-display mt-2 text-4xl font-semibold text-[var(--orbit-ink)] xl:text-5xl">
            Good day, Administrator
          </h2>
          <p className="mt-2 text-sm text-[var(--orbit-muted)]">
            Live business and content activity across Marlo Hotels.
          </p>
        </div>
        <p className="text-xs font-medium text-[var(--orbit-muted)]">{formatDate(now)}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
        <MetricCard
          label="Revenue this month"
          value={revenueValue}
          prefix="$"
          change={percentageChange(revenueValue, previousRevenueValue)}
          icon={<DollarSign className="size-5" />}
        />
        <MetricCard
          label="Traffic"
          value={visitorValue}
          change={percentageChange(visitorValue, previousVisitorValue)}
          icon={<Users className="size-5" />}
        />
        <MetricCard
          label="Room occupancy"
          value={occupancy}
          suffix="%"
          icon={<BedDouble className="size-5" />}
        />
        <MetricCard
          label="Bookings"
          value={recentBookings.length}
          icon={<CalendarDays className="size-5" />}
        />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {[
          {
            label: "Website Status",
            value: "Live",
            href: "/",
            hint: "Public site online",
          },
          {
            label: "Homepage",
            value: homepageUpdatedAt
              ? formatDate(homepageUpdatedAt)
              : "Open editor",
            href: "/orbit/homepage",
            hint: "Last homepage update",
          },
          {
            label: "Media",
            value: String(mediaCount),
            href: "/orbit/media-library",
            hint: `${storageMb} MB in library`,
          },
          {
            label: "Pages",
            value: String(pageCount || "—"),
            href: "/orbit/seo",
            hint: "SEO & page records",
          },
          {
            label: "Rooms",
            value: String(roomCount),
            href: "/orbit/rooms",
            hint: "Inventory & pricing",
          },
          {
            label: "Dining",
            value: String(diningCount),
            href: "/orbit/dining",
            hint: "Restaurants & menus",
          },
          {
            label: "Messages",
            value: String(recentMessages.length),
            href: "/orbit/contact-messages",
            hint: "Latest guest enquiries",
          },
          {
            label: "Storage",
            value: `${storageMb} MB`,
            href: "/orbit/media-library",
            hint: "Media library usage",
          },
          {
            label: "Last Publish",
            value: lastPublish ? formatDate(lastPublish) : "—",
            href: "/orbit/homepage",
            hint: "Most recent publish",
          },
          {
            label: "Pending Changes",
            value: String(pendingChanges),
            href: "/orbit/homepage",
            hint: "Draft / unpublished entries",
          },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="orbit-panel rounded-2xl p-5 transition hover:border-[#c4943c]/35"
          >
            <p className="text-[9px] font-semibold tracking-[0.22em] text-[#a67a30] uppercase">
              {card.label}
            </p>
            <p className="font-display mt-3 text-2xl font-semibold text-[#10251e]">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-[#738078]">{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.55fr_1fr]">
        <section className="orbit-panel overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-[#17362b]/8 px-6 py-5">
            <div>
              <h3 className="font-display text-xl font-semibold text-[#10251e]">
                Recent bookings
              </h3>
              <p className="mt-1 text-xs text-[#738078]">Latest reservation activity</p>
            </div>
            <Link
              href="/orbit/bookings"
              className="text-[10px] font-semibold tracking-[0.2em] text-[#a67a30] uppercase"
            >
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="bg-[#f3f3ee] text-[9px] tracking-[0.2em] text-[#738078] uppercase">
                  <th className="px-6 py-3 font-semibold">Guest</th>
                  <th className="px-5 py-3 font-semibold">Room</th>
                  <th className="px-5 py-3 font-semibold">Arrival</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17362b]/7">
                {recentBookings.length ? (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="text-xs text-[#344b42]">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#142820]">{booking.guestName}</p>
                        <p className="mt-0.5 text-[11px] text-[#78847e]">{booking.reference}</p>
                      </td>
                      <td className="px-5 py-4">{booking.room.name}</td>
                      <td className="px-5 py-4">{formatDate(booking.checkIn)}</td>
                      <td className="px-5 py-4">
                        {booking.totalAmount
                          ? formatCurrency(Number(booking.totalAmount))
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#edf4ef] px-2.5 py-1 text-[9px] font-semibold tracking-[0.12em] text-[#286a52] uppercase">
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#78847e]">
                      No bookings have been received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="orbit-panel rounded-2xl p-6">
          <h3 className="font-display text-xl font-semibold text-[#10251e]">
            Quick actions
          </h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {quickActions.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-xl border border-[#17362b]/9 bg-[#fafaf7] p-4 transition hover:-translate-y-0.5 hover:border-[#c4943c]/40 hover:shadow-lg"
              >
                <Icon className="size-5 text-[#a67a30]" />
                <p className="mt-3 text-xs font-semibold text-[#253c33]">{label}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ActivityPanel
          title="Recent activity"
          href="/orbit/system-logs"
          icon={<Activity className="size-4 text-[#a67a30]" />}
          items={recentActivity.map((item) => ({
            title: item.summary,
            detail: item.module,
            date: item.createdAt,
          }))}
        />
        <ActivityPanel
          title="Latest messages"
          href="/orbit/contact-messages"
          icon={<MessageSquare className="size-4 text-[#a67a30]" />}
          items={recentMessages.map((item) => ({
            title: item.name,
            detail: item.subject,
            date: item.createdAt,
          }))}
        />
        <ActivityPanel
          title="Newsletter"
          href="/orbit/newsletter"
          icon={<Mail className="size-4 text-[#a67a30]" />}
          items={recentSubscribers.map((item) => ({
            title: item.email,
            detail: "New subscriber",
            date: item.createdAt,
          }))}
        />
        <ActivityPanel
          title="Latest reviews"
          href="/orbit/reviews"
          icon={<Star className="size-4 text-[#a67a30]" />}
          items={recentReviews.map((item) => ({
            title: item.guestName,
            detail: `${item.rating}/5 · ${item.body.slice(0, 48)}`,
            date: item.createdAt,
          }))}
        />
      </div>

      <div className="mt-5">
        <ActivityPanel
          title="Latest blogs"
          href="/orbit/blog"
          icon={<Newspaper className="size-4 text-[#a67a30]" />}
          items={recentPosts.map((item) => ({
            title: item.title,
            detail: item.published ? "Published" : "Draft",
            date: item.updatedAt,
          }))}
        />
      </div>
    </div>
  );
}

function ActivityPanel({
  title,
  href,
  icon,
  items,
}: {
  title: string;
  href: string;
  icon: ReactNode;
  items: { title: string; detail: string; date: Date }[];
}) {
  return (
    <section className="orbit-panel rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <h3 className="font-display text-lg font-semibold text-[#10251e]">{title}</h3>
        </div>
        <Link href={href} className="text-[9px] font-semibold tracking-[0.16em] text-[#a67a30] uppercase">
          Open
        </Link>
      </div>
      <div className="mt-4 divide-y divide-[#17362b]/7">
        {items.length ? (
          items.slice(0, 4).map((item, index) => (
            <div key={`${item.title}-${index}`} className="py-3 first:pt-0">
              <p className="truncate text-xs font-semibold text-[#273f35]">{item.title}</p>
              <p className="mt-1 truncate text-[11px] text-[#78847e]">{item.detail}</p>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-xs text-[#8a948f]">No activity yet</p>
        )}
      </div>
    </section>
  );
}
