import { getAdminDashboardStats } from "@/lib/admin/stats";
import { formatCurrency } from "@/lib/utils";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.08)]">
      <p className="text-[10px] font-semibold tracking-[0.22em] text-[#D9B46B] uppercase">
        {label}
      </p>
      <p className="font-display mt-3 text-3xl font-semibold tracking-[-0.02em] text-ivory tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-xs text-cream-200/50">{hint}</p>
      ) : null}
    </article>
  );
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Today's Booking", value: String(stats.todaysBookings) },
    { label: "Pending Booking", value: String(stats.pendingBookings) },
    { label: "Confirmed Booking", value: String(stats.confirmedBookings) },
    { label: "Cancelled Booking", value: String(stats.cancelledBookings) },
    { label: "Offline Booking", value: String(stats.offlineBookings) },
    { label: "Online Booking", value: String(stats.onlineBookings) },
    {
      label: "Today's Revenue",
      value: formatCurrency(stats.todaysRevenue),
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(stats.monthlyRevenue),
    },
    {
      label: "Room Occupancy %",
      value: `${stats.occupancyPercent}%`,
    },
    { label: "Available Rooms", value: String(stats.availableRooms) },
    { label: "Active Date Blocks", value: String(stats.activeDateBlocks) },
    { label: "Pending Payments", value: String(stats.pendingPayments) },
    { label: "Paid Payments", value: String(stats.paidPayments) },
    {
      label: "Website Visitors",
      value: String(stats.websiteVisitors),
      hint: "Estimated from engagement signals",
    },
    { label: "Today's Inquiries", value: String(stats.todaysInquiries) },
    {
      label: "Restaurant Bookings",
      value: String(stats.restaurantBookings),
    },
  ];

  return (
    <div>
      <div>
        <p className="text-[10px] font-semibold tracking-[0.28em] text-[#D9B46B] uppercase">
          Overview
        </p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.02em] text-ivory md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-200/65">
          Live operational snapshot for Marlo Hotels — bookings, revenue,
          occupancy and guest inquiries.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
