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

    const clearCookie = await revokeOrbitSession();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(clearCookie.name, clearCookie.value, clearCookie.options);
    return response;
  } catch (error) {
    orbitLog("error", "Orbit logout failed", error);
    try {
      const clearCookie = await revokeOrbitSession();
      const response = NextResponse.json({ ok: true });
      response.cookies.set(
        clearCookie.name,
        clearCookie.value,
        clearCookie.options
      );
      return response;
    } catch {
      return NextResponse.json({ ok: true });
    }
  }
}
