import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  assertSameOrigin,
  getOrbitSession,
} from "@/lib/orbit/auth";
import { cleanupUnreferencedMedia } from "@/lib/orbit/scrub-media-refs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  try {
    const result = await cleanupUnreferencedMedia({ limit: 200 });
    revalidateTag("media");
    revalidatePath("/");
    revalidatePath("/orbit/media-library");
    return NextResponse.json({
      ok: true,
      removed: result.removed,
      ids: result.ids,
      message:
        result.removed > 0
          ? `Removed ${result.removed} unreferenced media file(s).`
          : "No unreferenced media found.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Cleanup failed",
        code: "SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
