import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { newsletterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  const db = getDb();
  if (db) {
    await db.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      create: { email: parsed.data.email },
      update: {},
    });
  }

  return NextResponse.json({ ok: true });
}
