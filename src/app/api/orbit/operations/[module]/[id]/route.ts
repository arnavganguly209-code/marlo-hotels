import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";

const statusSchema = z.object({ status: z.string().min(1).max(40) });
type Context = { params: Promise<{ module: string; id: string }> };

async function authorized(request: Request) {
  return (await getOrbitSession()) && (await assertSameOrigin(request));
}

export async function PATCH(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { module, id } = await params;
  const status = parsed.data.status.toUpperCase();

  switch (module) {
    case "bookings":
      if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
        return NextResponse.json({ error: "Invalid booking status" }, { status: 400 });
      }
      await db.booking.update({
        where: { id },
        data: { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" },
      });
      break;
    case "contact-messages":
      if (!["UNREAD", "READ", "REPLIED", "ARCHIVED"].includes(status)) {
        return NextResponse.json({ error: "Invalid message status" }, { status: 400 });
      }
      await db.contactMessage.update({
        where: { id },
        data: {
          status: status as "UNREAD" | "READ" | "REPLIED" | "ARCHIVED",
          handled: ["REPLIED", "ARCHIVED"].includes(status),
          repliedAt: status === "REPLIED" ? new Date() : undefined,
        },
      });
      break;
    case "reviews":
      if (!["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) {
        return NextResponse.json({ error: "Invalid review status" }, { status: 400 });
      }
      await db.review.update({
        where: { id },
        data: { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" },
      });
      break;
    case "users":
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return NextResponse.json({ error: "Invalid user status" }, { status: 400 });
      }
      await db.orbitUser.update({
        where: { id },
        data: { active: status === "ACTIVE" },
      });
      break;
    case "security":
      if (status !== "REVOKED") {
        return NextResponse.json({ error: "Invalid security action" }, { status: 400 });
      }
      await db.orbitSession.update({ where: { id }, data: { revokedAt: new Date() } });
      break;
    default:
      return NextResponse.json({ error: "Unsupported operation" }, { status: 400 });
  }

  await writeAuditLog({
    action: "STATUS_CHANGE",
    module,
    entityId: id,
    summary: `Changed status to ${status}`,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: Context) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  const { module, id } = await params;

  switch (module) {
    case "bookings":
      await db.booking.delete({ where: { id } });
      break;
    case "contact-messages":
      await db.contactMessage.delete({ where: { id } });
      break;
    case "newsletter":
      await db.newsletterSubscriber.delete({ where: { id } });
      break;
    case "reviews":
      await db.review.delete({ where: { id } });
      break;
    case "users":
      await db.orbitUser.delete({ where: { id } });
      break;
    case "backup":
      await db.orbitBackup.delete({ where: { id } });
      break;
    default:
      return NextResponse.json({ error: "Unsupported operation" }, { status: 400 });
  }

  await writeAuditLog({
    action: "DELETE",
    module,
    entityId: id,
    summary: `Deleted ${module} record`,
  });
  return NextResponse.json({ ok: true });
}
