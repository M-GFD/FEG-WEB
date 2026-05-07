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

function prismaErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (
    /relation .*PushSubscription.* does not exist/i.test(msg) ||
    /42P01/i.test(msg)
  ) {
    return "La tabla de suscripciones no existe en la base de datos. Ejecutá prisma/migrations/20260508_push_subscription.sql en el mismo Postgres que usa DATABASE_URL (p. ej. SQL Editor de Supabase), o `npx prisma db push` desde entorno con acceso.";
  }
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "P2021") {
      return "La tabla de suscripciones no existe en la base de datos. Ejecutá prisma/migrations/20260508_push_subscription.sql en el mismo Postgres que usa DATABASE_URL (p. ej. SQL Editor de Supabase), o `npx prisma db push` desde entorno con acceso.";
    }
    if (code === "P1001") {
      return "No se pudo conectar a la base de datos (verificá DATABASE_URL en Vercel).";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Error al guardar la suscripción";
}

/**
 * Registra Web Push. No exige cuenta: `userId` solo si hay sesión.
 * Sin sesión: solo actualiza `keys`; no pisa `userId` existente.
 */
export async function POST(req: Request) {
  try {
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
  } catch (e) {
    console.error("[api/push/subscribe]", e);
    const message = prismaErrorMessage(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
