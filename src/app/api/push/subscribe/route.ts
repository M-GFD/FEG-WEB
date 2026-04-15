import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: {
      endpoint: parsed.data.endpoint,
      keys: parsed.data.keys,
      userId: session.user.id,
    },
    update: {
      keys: parsed.data.keys,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
