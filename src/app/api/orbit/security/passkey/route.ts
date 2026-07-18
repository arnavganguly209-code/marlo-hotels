import { NextResponse } from "next/server";
import { z } from "zod";
import {
  assertSameOrigin,
  getOrbitSession,
  rotatePasskey,
  verifyPasskey,
  writeAuditLog,
} from "@/lib/orbit/auth";

const rotateSchema = z
  .object({
    currentPasskey: z.string().min(1).max(512),
    newPasskey: z
      .string()
      .min(8, "The new passkey must be at least 8 characters.")
      .max(512),
    confirmPasskey: z.string().min(1).max(512),
  })
  .refine((value) => value.newPasskey === value.confirmPasskey, {
    message: "The passkey confirmation does not match.",
    path: ["confirmPasskey"],
  });

export async function POST(request: Request) {
  if (!(await assertSameOrigin(request))) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!(await getOrbitSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = rotateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  if (!(await verifyPasskey(parsed.data.currentPasskey))) {
    await writeAuditLog({
      action: "PASSKEY_ROTATION_REJECTED",
      module: "security",
      summary: "Passkey change rejected — current passkey invalid",
    });
    return NextResponse.json(
      { error: "The current passkey is not valid." },
      { status: 401 }
    );
  }

  try {
    await rotatePasskey(parsed.data.newPasskey);
  } catch {
    return NextResponse.json(
      {
        error:
          "Passkey rotation requires a configured database. Set DATABASE_URL to change the passkey.",
      },
      { status: 503 }
    );
  }

  await writeAuditLog({
    action: "PASSKEY_ROTATED",
    module: "security",
    summary: "Administrator passkey was changed",
  });
  return NextResponse.json({ ok: true });
}
