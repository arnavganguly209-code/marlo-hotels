import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAdminSession,
  rotateAdminPassword,
  verifyAdminCredentials,
  ADMIN_USER_ID,
} from "@/lib/admin/auth";

const schema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid new password (min. 8 characters)." },
      { status: 400 }
    );
  }

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    return NextResponse.json(
      { error: "New password and confirmation do not match." },
      { status: 400 }
    );
  }

  const currentOk = await verifyAdminCredentials(
    ADMIN_USER_ID,
    parsed.data.currentPassword
  );
  if (!currentOk) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  try {
    await rotateAdminPassword(parsed.data.newPassword);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update password.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
