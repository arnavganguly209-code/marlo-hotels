import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  assertSameOrigin,
  getOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { syncSiteMediaIntoLibrary } from "@/lib/orbit/sync-site-media";

export async function POST(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await syncSiteMediaIntoLibrary();
  await writeAuditLog({
    action: "SYNC_SITE_MEDIA",
    module: "media-library",
    summary: `Synced site media (${result.imported} imported, ${result.scanned} scanned)`,
  });
  revalidatePath("/orbit/media-library");

  return NextResponse.json({
    ok: true,
    message:
      result.imported > 0
        ? `Imported ${result.imported} site image(s) into Media Library.`
        : `Media Library is up to date (${result.scanned} site images scanned).`,
    ...result,
  });
}
