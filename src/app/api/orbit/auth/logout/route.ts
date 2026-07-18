import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  revokeOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";
import { orbitLog } from "@/lib/orbit/logger";

export async function POST(request: Request) {
  try {
    if (!(await assertSameOrigin(request))) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    await writeAuditLog({
      action: "LOGOUT",
      module: "security",
      summary: "Orbit administrator signed out",
    });
    await revokeOrbitSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    orbitLog("error", "Orbit logout failed", error);
    try {
      await revokeOrbitSession();
    } catch {
      // still return ok so the client can clear local state
    }
    return NextResponse.json({ ok: true });
  }
}
