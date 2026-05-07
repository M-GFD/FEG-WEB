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

/**
 * Registra la suscripción Web Push (PWA). No exige sesión: userId solo si hay login.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

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
      userId,
    },
    update: {
      keys: parsed.data.keys,
      ...(userId ? { userId } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
