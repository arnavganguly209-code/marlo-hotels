import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { getDb } from "@/lib/db";
import { assertSameOrigin } from "@/lib/orbit/auth";

function serialize<T extends { createdAt: Date; repliedAt: Date | null }>(
  message: T
) {
  return {
    ...message,
    createdAt: message.createdAt.toISOString(),
    repliedAt: message.repliedAt?.toISOString() ?? null,
  };
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ messages: [] });
  const filter = new URL(request.url).searchParams.get("filter") || "";
  const messages = await db.contactMessage.findMany({
    where: filter
      ? { subject: { contains: filter, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ messages: messages.map(serialize) });
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as {
    id?: string;
    status?: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";
    handled?: boolean;
  } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "Message id required" }, { status: 400 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  const message = await db.contactMessage.update({
    where: { id: body.id },
    data: {
      status: body.status,
      handled:
        body.handled ??
        (body.status === "REPLIED" || body.status === "ARCHIVED"
          ? true
          : undefined),
      repliedAt: body.status === "REPLIED" ? new Date() : undefined,
    },
  });
  return NextResponse.json({ message: serialize(message) });
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Message id required" }, { status: 400 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
