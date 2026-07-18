import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  revokeOrbitSession,
  writeAuditLog,
} from "@/lib/orbit/auth";

export async function POST(request: Request) {
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
}
