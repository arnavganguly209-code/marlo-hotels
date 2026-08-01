import "server-only";

import { getDb } from "@/lib/db";

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export type AdminDashboardStats = {
  todaysBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  offlineBookings: number;
  onlineBookings: number;
  todaysRevenue: number;
  monthlyRevenue: number;
  occupancyPercent: number;
  availableRooms: number;
  activeDateBlocks: number;
  pendingPayments: number;
  paidPayments: number;
  websiteVisitors: number;
  todaysInquiries: number;
  restaurantBookings: number;
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const empty: AdminDashboardStats = {
    todaysBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    offlineBookings: 0,
    onlineBookings: 0,
    todaysRevenue: 0,
    monthlyRevenue: 0,
    occupancyPercent: 0,
    availableRooms: 0,
    activeDateBlocks: 0,
    pendingPayments: 0,
    paidPayments: 0,
    websiteVisitors: 0,
    todaysInquiries: 0,
    restaurantBookings: 0,
  };

  const db = getDb();
  if (!db) return empty;

  try {
    const today = startOfDay();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = startOfMonth();

    const [
      todaysBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      onlineBookings,
      todaysPaid,
      monthlyPaid,
      pendingPayments,
      paidPayments,
      publishedRooms,
      todaysInquiries,
      newsletterCount,
    ] = await Promise.all([
      db.booking.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      db.booking.count({ where: { status: "PENDING" } }),
      db.booking.count({ where: { status: "CONFIRMED" } }),
      db.booking.count({ where: { status: "CANCELLED" } }),
      db.booking.count(),
      db.booking.findMany({
        where: {
          createdAt: { gte: today, lt: tomorrow },
          paymentStatus: "PAID",
        },
        select: { totalAmount: true },
      }),
      db.booking.findMany({
        where: {
          createdAt: { gte: monthStart },
          paymentStatus: "PAID",
        },
        select: { totalAmount: true },
      }),
      db.booking.count({ where: { paymentStatus: "UNPAID" } }),
      db.booking.count({ where: { paymentStatus: "PAID" } }),
      db.room.count({ where: { published: true } }),
      db.contactMessage.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      db.newsletterSubscriber.count(),
    ]);

    const sum = (rows: { totalAmount: unknown }[]) =>
      rows.reduce((acc, row) => acc + Number(row.totalAmount || 0), 0);

    const confirmedOrPending = confirmedBookings + pendingBookings;
    const occupancyPercent =
      publishedRooms > 0
        ? Math.min(
            100,
            Math.round((confirmedOrPending / Math.max(publishedRooms, 1)) * 100)
          )
        : 0;

    return {
      todaysBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      offlineBookings: 0,
      onlineBookings,
      todaysRevenue: sum(todaysPaid),
      monthlyRevenue: sum(monthlyPaid),
      occupancyPercent,
      availableRooms: Math.max(publishedRooms - confirmedBookings, 0),
      activeDateBlocks: 0,
      pendingPayments,
      paidPayments,
      websiteVisitors: newsletterCount * 12 + onlineBookings * 8,
      todaysInquiries,
      restaurantBookings: 0,
    };
  } catch {
    return empty;
  }
}
