import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getOrbitSession } from "@/lib/orbit/auth";

export async function GET() {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const [logs, messages] = await Promise.all([
    db.orbitAuditLog.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
    }),
    db.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        subject: true,
        createdAt: true,
        status: true,
      },
    }),
  ]);

  const unreadMessages = messages.filter((item) => item.status === "UNREAD")
    .length;

  return NextResponse.json({
    recentChanges: logs.map((log) => ({
      id: log.id,
      action: log.action,
      module: log.module,
      summary: log.summary,
      createdAt: log.createdAt.toISOString(),
      href: log.module ? `/orbit/${log.module}` : "/orbit/dashboard",
    })),
    notifications: [
      ...logs.slice(0, 6).map((log) => ({
        id: `log-${log.id}`,
        title: log.summary,
        detail: `${log.module} · ${log.action}`,
        createdAt: log.createdAt.toISOString(),
        href: `/orbit/${log.module}`,
        kind: "activity" as const,
      })),
      ...messages.map((message) => ({
        id: `msg-${message.id}`,
        title: message.name,
        detail: message.subject,
        createdAt: message.createdAt.toISOString(),
        href: "/orbit/contact-messages",
        kind: "message" as const,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10),
    unreadCount: unreadMessages + Math.min(3, logs.length),
    profile: {
      name: "Administrator",
      role: "Orbit Admin",
    },
  });
}
