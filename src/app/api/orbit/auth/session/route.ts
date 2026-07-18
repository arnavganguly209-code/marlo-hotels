import { NextResponse } from "next/server";
import { getOrbitSession } from "@/lib/orbit/auth";
import { orbitLog } from "@/lib/orbit/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getOrbitSession();
    return NextResponse.json(
      { authenticated: Boolean(session) },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    orbitLog("warn", "Orbit session probe failed", error);
    return NextResponse.json({ authenticated: false });
  }
}
