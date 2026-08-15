import { NextResponse } from "next/server";
import { paypalPublicConfig } from "@/lib/paypal";

export async function GET() {
  const config = paypalPublicConfig();
  // Never include client secret.
  return NextResponse.json({
    clientId: config.clientId || null,
    environment: config.environment,
    currency: config.currency,
    configured: config.configured,
  });
}
