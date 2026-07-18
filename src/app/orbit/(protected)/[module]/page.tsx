import { notFound } from "next/navigation";
import { ContentManager } from "@/components/orbit/content-manager";
import { MediaManager } from "@/components/orbit/media-manager";
import {
  OperationalManager,
} from "@/components/orbit/operational-manager";
import { PasskeySettings } from "@/components/orbit/passkey-settings";
import { getDb } from "@/lib/db";
import { moduleBySlug } from "@/lib/orbit/modules";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ module: string }> };

export default async function OrbitModulePage({ params }: PageProps) {
  const { module: slug } = await params;
  const moduleConfig = moduleBySlug.get(slug);
  if (!moduleConfig) notFound();

  const db = getDb();
  if (slug === "media-library") {
    const assets = db
      ? await db.mediaAsset.findMany({
          orderBy: { createdAt: "desc" },
          take: 250,
        })
      : [];
    return (
      <MediaManager
        initialAssets={assets.map((asset) => ({
          ...asset,
          createdAt: asset.createdAt.toISOString(),
        }))}
      />
    );
  }

  if (db && slug === "bookings") {
    const bookings = await db.booking.findMany({
      include: { room: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return (
      <OperationalManager
        title="Bookings"
        eyebrow="Reservation management"
        description="Manage upcoming, confirmed, cancelled and completed stays with guest and payment visibility."
        apiModule="bookings"
        rows={bookings.map((item) => ({
          id: item.id,
          primary: item.guestName,
          secondary: `${item.reference} · ${item.guestEmail}`,
          status: item.status,
          values: {
            room: item.room.name,
            stay: `${item.checkIn.toLocaleDateString()} → ${item.checkOut.toLocaleDateString()}`,
            guests: `${item.adults} adults, ${item.children} children`,
            payment: item.paymentStatus,
            total: item.totalAmount ? formatCurrency(Number(item.totalAmount)) : "—",
          },
          createdAt: item.createdAt.toISOString(),
        }))}
        columns={[
          { key: "room", label: "Room" },
          { key: "stay", label: "Stay" },
          { key: "guests", label: "Guests" },
          { key: "payment", label: "Payment" },
          { key: "total", label: "Total" },
        ]}
        statusOptions={["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]}
      />
    );
  }

  if (db && slug === "newsletter") {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
    return (
      <OperationalManager
        title="Newsletter"
        eyebrow="Audience management"
        description="Search, export and maintain the Marlo Hotels subscriber audience."
        apiModule="newsletter"
        rows={subscribers.map((item) => ({
          id: item.id,
          primary: item.email,
          secondary: "Active subscriber",
          values: {},
          createdAt: item.createdAt.toISOString(),
        }))}
        columns={[]}
      />
    );
  }

  if (db && slug === "contact-messages") {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    return (
      <OperationalManager
        title="Contact Messages"
        eyebrow="Guest enquiries"
        description="Read, reply, archive and manage every guest enquiry received from the public website."
        apiModule="contact-messages"
        rows={messages.map((item) => ({
          id: item.id,
          primary: item.name,
          secondary: item.subject,
          status: item.status,
          values: {
            email: item.email,
            phone: item.phone ?? "—",
            message: item.message,
          },
          createdAt: item.createdAt.toISOString(),
        }))}
        columns={[
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "message", label: "Message" },
        ]}
        statusOptions={["UNREAD", "READ", "REPLIED", "ARCHIVED"]}
        replyField="email"
      />
    );
  }

  if (db && slug === "reviews") {
    const reviews = await db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    return (
      <OperationalManager
        title="Reviews"
        eyebrow="Reputation management"
        description="Moderate verified guest feedback, ratings and featured reviews."
        apiModule="reviews"
        rows={reviews.map((item) => ({
          id: item.id,
          primary: item.guestName,
          secondary: item.title ?? item.origin ?? "Guest review",
          status: item.status,
          values: {
            rating: `${item.rating}/5`,
            source: item.source ?? "Direct",
            review: item.body,
          },
          createdAt: item.createdAt.toISOString(),
        }))}
        columns={[
          { key: "rating", label: "Rating" },
          { key: "source", label: "Source" },
          { key: "review", label: "Review" },
        ]}
        statusOptions={["DRAFT", "PUBLISHED", "ARCHIVED"]}
      />
    );
  }

  if (db && slug === "users") {
    const users = await db.orbitUser.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return (
      <OperationalManager
        title="Users"
        eyebrow="Access management"
        description="Administrator accounts, assigned roles and access state."
        apiModule="users"
        rows={users.map((item) => ({
          id: item.id,
          primary: item.name,
          secondary: item.email,
          status: item.active ? "ACTIVE" : "INACTIVE",
          values: {
            role: item.role,
            lastLogin: item.lastLoginAt?.toLocaleString() ?? "Never",
          },
          createdAt: item.createdAt.toISOString(),
        }))}
        columns={[
          { key: "role", label: "Role" },
          { key: "lastLogin", label: "Last login" },
        ]}
        statusOptions={["ACTIVE", "INACTIVE"]}
      />
    );
  }

  if (db && slug === "security") {
    const sessions = await db.orbitSession.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return (
      <>
        <PasskeySettings />
        <OperationalManager
          title="Security"
          eyebrow="Session security"
          description="Monitor active sessions, expiry, revocation and administrative access."
          apiModule="security"
          rows={sessions.map((item) => ({
            id: item.id,
            primary: item.revokedAt ? "Revoked session" : "Administrator session",
            secondary: item.userAgent ?? "Unknown user agent",
            status: item.revokedAt ? "REVOKED" : item.expiresAt < new Date() ? "EXPIRED" : "ACTIVE",
            values: {
              expires: item.expiresAt.toLocaleString(),
              lastSeen: item.lastSeenAt.toLocaleString(),
            },
            createdAt: item.createdAt.toISOString(),
          }))}
          columns={[
            { key: "lastSeen", label: "Last seen" },
            { key: "expires", label: "Expires" },
          ]}
          statusOptions={["ACTIVE", "REVOKED", "EXPIRED"]}
          canDelete={false}
        />
      </>
    );
  }

  if (db && slug === "system-logs") {
    const logs = await db.orbitAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
    });
    return (
      <OperationalManager
        title="System Logs"
        eyebrow="Immutable audit trail"
        description="Administrative actions and security-sensitive changes across Orbit."
        apiModule="system-logs"
        rows={logs.map((item) => ({
          id: item.id,
          primary: item.action,
          secondary: item.summary,
          values: {
            module: item.module,
            entity: item.entityId ?? "—",
          },
          createdAt: item.createdAt.toISOString(),
        }))}
        columns={[
          { key: "module", label: "Module" },
          { key: "entity", label: "Entity" },
        ]}
        canDelete={false}
        readOnly
      />
    );
  }

  if (db && slug === "backup") {
    const backups = await db.orbitBackup.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return (
      <OperationalManager
        title="Backup"
        eyebrow="Recovery operations"
        description="Tracked database and media backup manifests with integrity checks."
        apiModule="backup"
        rows={backups.map((item) => ({
          id: item.id,
          primary: item.filename,
          secondary: item.storagePath ?? "Storage pending",
          status: item.status,
          values: {
            size: item.size ? `${(item.size / 1024 / 1024).toFixed(2)} MB` : "—",
            checksum: item.checksum?.slice(0, 16) ?? "—",
          },
          createdAt: item.createdAt.toISOString(),
        }))}
        columns={[
          { key: "size", label: "Size" },
          { key: "checksum", label: "Checksum" },
        ]}
        canDelete
        readOnly
      />
    );
  }

  const entries = db
    ? await db.contentEntry.findMany({
        where: { module: slug },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <ContentManager
      module={moduleConfig}
      initialEntries={entries.map((entry) => ({
        id: entry.id,
        module: entry.module,
        key: entry.key,
        title: entry.title,
        slug: entry.slug,
        status: entry.status,
        data: entry.data as Record<string, unknown>,
        seo: entry.seo as Record<string, unknown> | null,
        scheduledAt: entry.scheduledAt?.toISOString() ?? null,
        updatedAt: entry.updatedAt.toISOString(),
      }))}
    />
  );
}
