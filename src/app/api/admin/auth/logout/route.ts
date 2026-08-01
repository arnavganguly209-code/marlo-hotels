import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin/auth";

export async function POST() {
  const cleared = clearAdminSessionCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cleared.name, cleared.value, cleared.options);
  return response;
}
