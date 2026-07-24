import { notFound } from "next/navigation";
import { BlogStudioEditor } from "@/components/orbit/blog-studio-editor";
import { ContactStudioEditor } from "@/components/orbit/contact-studio-editor";
import { ContentManager } from "@/components/orbit/content-manager";
import { HomepageVisualEditor } from "@/components/orbit/homepage-visual-editor";
import { MediaManager } from "@/components/orbit/media-manager";
import {
  OperationalManager,
} from "@/components/orbit/operational-manager";
import { PageStudioEditor } from "@/components/orbit/page-studio-editor";
import { PasskeySettings } from "@/components/orbit/passkey-settings";
import { RoomsStudioEditor } from "@/components/orbit/rooms-studio-editor";
import { SiteSettingsStudio } from "@/components/orbit/site-settings-studio";
import { getDb } from "@/lib/db";
import { getOrbitRoomEntries } from "@/content/rooms";
import { getContactContent } from "@/lib/contact-content";
import { getHomepageContent } from "@/lib/homepage-content";
import {
  HOMEPAGE_SECTIONS,
  type HomepageSectionKey,
} from "@/lib/homepage-schema";
import { isNextNavigationError, orbitLog } from "@/lib/orbit/logger";
import {
  moduleBySlug,
  PAGE_PUBLIC_PATH,
} from "@/lib/orbit/modules";
import { PAGE_STUDIO_SECTIONS, type StudioSectionData } from "@/lib/orbit/page-studio";
import { getStudioDefaults } from "@/lib/orbit/page-studio-defaults";
import { getPaymentLogoSettings } from "@/lib/site-settings";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ module: string }>;
  searchParams?: Promise<{ section?: string; inventory?: string }>;
};

function ModuleUnavailable({ label }: { label: string }) {
  return (
    <div className="p-6 sm:p-10">
      <div className="orbit-panel mx-auto max-w-2xl rounded-2xl p-10 text-center">
        <h2 className="font-display text-3xl font-semibold text-[#10251e]">
          {label} temporarily unavailable
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#62716b]">
          Orbit could not load this module from the database. Confirm
          PostgreSQL, DATABASE_URL, and Prisma migrations, then reload. Details
          are written to the PM2 server logs.
        </p>
      </div>
    </div>
  );
}

export default async function OrbitModulePage(props: PageProps) {
  const { params } = props;
  try {
    return await renderOrbitModulePage(props);
  } catch (error) {
    if (isNextNavigationError(error)) throw error;
    const { module: slug } = await params;
    orbitLog("error", `Orbit module page failed (${slug})`, error);
    return (
      <ModuleUnavailable
        label={moduleBySlug.get(slug)?.label ?? "Module"}
      />
    );
  }
}

async function renderOrbitModulePage({ params, searchParams }: PageProps) {
  const { module: slug } = await params;
  const moduleConfig = moduleBySlug.get(slug);
  if (!moduleConfig) notFound();

  const db = getDb();
  if (slug === "homepage") {
    const requested = (await searchParams)?.section;
    const initialSection = HOMEPAGE_SECTIONS.some(
      (item) => item.key === requested
    )
      ? (requested as HomepageSectionKey)
      : "hero";
    const initialPersisted = db
      ? Boolean(
          await db.contentEntry.findUnique({
            where: {
              module_key: { module: "homepage", key: "visual-editor" },
            },
            select: { id: true },
          })
        )
      : true;
    return (
      <HomepageVisualEditor
        initialContent={await getHomepageContent()}
        initialSection={initialSection}
        initialPersisted={initialPersisted}
      />
    );
  }

  if (slug === "media-library") {
    const assets = db
      ? await db.mediaAsset.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 48,
          include: {
            _count: { select: { placements: true } },
            placements: { select: { key: true, label: true } },
          },
        })
      : [];
    return (
      <MediaManager
        initialAssets={assets.map((asset) => ({
          id: asset.id,
          filename: asset.filename,
          originalName: asset.originalName,
          url: asset.url,
          mimeType: asset.mimeType,
          kind: asset.kind,
          size: asset.size,
          width: asset.width,
          height: asset.height,
          alt: asset.alt,
          title: asset.title,
          caption: asset.caption,
          seoTitle: asset.seoTitle,
          seoDescription: asset.seoDescription,
          folder: asset.folder,
          checksum: asset.checksum,
          focalX: asset.focalX,
          focalY: asset.focalY,
          posterUrl: asset.posterUrl,
          currentVersion: asset.currentVersion,
          deletedAt: asset.deletedAt?.toISOString() ?? null,
          createdAt: asset.createdAt.toISOString(),
          usageCount: asset._count.placements,
          usedOn: asset.placements.map((item) => item.label || item.key),
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

  if (slug === "rooms") {
    const roomEntries = await getOrbitRoomEntries();
    return <RoomsStudioEditor initialEntries={roomEntries} />;
  }

  if (slug === "blog") {
    const entries = db
      ? await db.contentEntry.findMany({
          where: { module: "blog" },
          orderBy: { updatedAt: "desc" },
        })
      : [];
    return (
      <BlogStudioEditor
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

  if (slug === "contact") {
    return (
      <ContactStudioEditor initialContent={await getContactContent()} />
    );
  }

  if (slug === "site-settings") {
    const entries = db
      ? await db.contentEntry.findMany({
          where: {
            module: slug,
            NOT: { key: "payment-methods" },
          },
          orderBy: { updatedAt: "desc" },
        })
      : [];
    const payment = await getPaymentLogoSettings();
    return (
      <SiteSettingsStudio
        module={moduleConfig}
        paymentMarks={payment.marks}
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

  const studioSections = PAGE_STUDIO_SECTIONS[slug];
  const showInventory = (await searchParams)?.inventory === "1";

  if (studioSections && !showInventory) {
    const studioEntry = db
      ? await db.contentEntry.findUnique({
          where: {
            module_key: { module: slug, key: "page-studio" },
          },
        })
      : null;
    const defaults = getStudioDefaults(slug);
    const saved =
      studioEntry?.data && typeof studioEntry.data === "object"
        ? (studioEntry.data as Record<string, Partial<StudioSectionData>>)
        : null;
    const initialDocument: Record<string, StudioSectionData> = {};
    for (const section of studioSections) {
      const base = defaults[section.key];
      const patch = saved?.[section.key];
      initialDocument[section.key] = {
        ...base,
        ...patch,
        image: {
          assetId: patch?.image?.assetId ?? null,
          src: String(patch?.image?.src || ""),
          alt: String(patch?.image?.alt || base.image.alt || section.label),
        },
        gallery: Array.isArray(patch?.gallery) ? patch.gallery : [],
        videoUrl: String(patch?.videoUrl || ""),
        videoAssetId: patch?.videoAssetId ?? null,
        hours: String(patch?.hours ?? base.hours ?? ""),
        features: String(patch?.features ?? base.features ?? ""),
        faq: String(patch?.faq ?? base.faq ?? ""),
        items: String(patch?.items ?? base.items ?? ""),
      };
    }

    return (
      <PageStudioEditor
        moduleSlug={slug}
        moduleLabel={moduleConfig.label}
        sections={studioSections}
        publicPath={PAGE_PUBLIC_PATH[slug] || "/"}
        initialDocument={initialDocument}
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
