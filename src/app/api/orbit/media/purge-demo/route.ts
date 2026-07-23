import { revalidatePath, revalidateTag } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { removeMediaFile } from "@/lib/orbit/media-storage";
import { scrubDeletedMediaFromContent } from "@/lib/orbit/scrub-media-refs";

export const dynamic = "force-dynamic";

const KEEP_VIDEO_MIN_BYTES = 80 * 1024 * 1024; // keep ~109MB hero upload

function isDemoAsset(asset: {
  url: string;
  originalName: string;
  filename: string;
  kind: string;
  size: number;
}): boolean {
  const hay = `${asset.url} ${asset.originalName} ${asset.filename}`.toLowerCase();
  if (/hero-demo|sample|placeholder|flowers|demo\.mp4|unsplash/.test(hay)) {
    return true;
  }
  if (asset.url.includes("images.unsplash.com")) return true;
  if (asset.kind === "VIDEO" && asset.size < KEEP_VIDEO_MIN_BYTES) {
    return true;
  }
  return false;
}

async function authorized(request: Request) {
  return (await getOrbitSession()) && (await assertSameOrigin(request));
}

/**
 * Permanently purge demo / placeholder media.
 * Keeps the real large Hero video (~109MB) and non-demo uploads.
 */
export async function POST(request: Request) {
  if (!(await authorized(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const assets = await db.mediaAsset.findMany();
  const deleted: string[] = [];

  for (const asset of assets) {
    if (!isDemoAsset(asset)) continue;

    await db.mediaPlacement.updateMany({
      where: { assetId: asset.id },
      data: { assetId: null },
    });
    await scrubDeletedMediaFromContent({
      assetId: asset.id,
      url: asset.url,
    });
    try {
      await db.mediaAsset.delete({ where: { id: asset.id } });
    } catch {
      await db.mediaAsset.update({
        where: { id: asset.id },
        data: { deletedAt: new Date() },
      });
    }
    await removeMediaFile(asset.url);
    if (asset.posterUrl) await removeMediaFile(asset.posterUrl);
    deleted.push(asset.url);
  }

  const homepage = await db.contentEntry.findUnique({
    where: { module_key: { module: "homepage", key: "visual-editor" } },
  });
  if (homepage?.data && typeof homepage.data === "object") {
    const data = structuredClone(homepage.data) as Record<string, unknown>;
    const hero = data.hero as Record<string, unknown> | undefined;
    if (hero && typeof hero.videoUrl === "string") {
      if (/hero-demo|demo\.mp4|sample|placeholder/i.test(hero.videoUrl)) {
        hero.videoUrl = "";
        hero.videoAssetId = null;
        hero.mobileVideoUrl = "";
        hero.mobileVideoAssetId = null;
        await db.contentEntry.update({
          where: { id: homepage.id },
          data: { data: data as Prisma.InputJsonValue },
        });
      }
    }
  }

  const demoPath = path.join(process.cwd(), "public", "videos", "hero-demo.mp4");
  try {
    await unlink(demoPath);
    deleted.push("/videos/hero-demo.mp4");
  } catch {
    // already gone
  }

  let attachedHero: string | null = null;
  const heroVideo = await db.mediaAsset.findFirst({
    where: {
      kind: "VIDEO",
      deletedAt: null,
      size: { gte: KEEP_VIDEO_MIN_BYTES },
    },
    orderBy: { size: "desc" },
  });
  if (heroVideo) {
    await db.mediaPlacement.upsert({
      where: { key: "home.hero" },
      create: {
        key: "home.hero",
        label: "Homepage Hero",
        assetId: heroVideo.id,
        mediaType: "VIDEO",
        alt: heroVideo.alt || "Marlo Hotels hero video",
        videoAutoplay: true,
        videoLoop: true,
        videoMuted: true,
        posterUrl: heroVideo.posterUrl,
      },
      update: {
        assetId: heroVideo.id,
        mediaType: "VIDEO",
        alt: heroVideo.alt || "Marlo Hotels hero video",
        videoAutoplay: true,
        videoLoop: true,
        videoMuted: true,
        posterUrl: heroVideo.posterUrl,
      },
    });

    const entry = await db.contentEntry.findUnique({
      where: { module_key: { module: "homepage", key: "visual-editor" } },
    });
    if (entry?.data && typeof entry.data === "object") {
      const data = structuredClone(entry.data) as Record<string, unknown>;
      const hero = {
        ...((data.hero as Record<string, unknown>) || {}),
        mediaType: "VIDEO",
        videoUrl: heroVideo.url,
        videoAssetId: heroVideo.id,
        videoAutoplay: true,
        videoLoop: true,
        videoMuted: true,
        videoPlaysInline: true,
      };
      data.hero = hero;
      await db.contentEntry.update({
        where: { id: entry.id },
        data: {
          data: data as Prisma.InputJsonValue,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });
    }
    attachedHero = heroVideo.url;
  }

  await writeAuditLog({
    action: "PURGE_DEMO_MEDIA",
    module: "media-library",
    summary: `Purged ${deleted.length} demo media asset(s)${
      attachedHero ? `; attached Hero ${attachedHero}` : ""
    }`,
  });

  revalidateTag("homepage");
  revalidateTag("media");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/orbit/media-library");
  revalidatePath("/orbit/homepage");

  return NextResponse.json({
    ok: true,
    deletedCount: deleted.length,
    deleted,
    attachedHero,
    message: attachedHero
      ? `Demo media purged. Official Hero video attached: ${attachedHero}`
      : "Demo media purged. Upload a Hero MP4 (>=80MB) then run Purge again to attach it.",
  });
}
