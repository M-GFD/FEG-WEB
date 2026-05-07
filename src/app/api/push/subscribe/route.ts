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

function flatErrorMessage(error: unknown): string {
  const parts: string[] = [];
  let cur: unknown = error;
  let depth = 0;
  while (cur != null && depth < 8) {
    if (cur instanceof Error) {
      if (cur.message) parts.push(cur.message);
      cur = cur.cause;
    } else if (typeof cur === "object" && "message" in cur && typeof (cur as { message: unknown }).message === "string") {
      parts.push((cur as { message: string }).message);
      break;
    } else {
      break;
    }
    depth++;
  }
  return parts.join(" ");
}

function prismaErrorMessage(error: unknown): string {
  const msg = flatErrorMessage(error);
  if (/tenant or user not found/i.test(msg)) {
    return (
      "Supabase rechazó la conexión del pooler (muy frecuente con Prisma). Revisá: " +
      "(1) En DATABASE_URL con puerto 6543 debe ir al final ?pgbouncer=true (o copiá de nuevo desde el modal Conectar → Transaction pooler). " +
      "(2) DIRECT_URL para migraciones suele ser el Session pooler en puerto 5432 con usuario postgres.TU_REF (mismo modal). " +
      "(3) Si la contraseña tiene símbolos (! @ # etc.), codificá la contraseña en la URL (ej. ! → %21). " +
      "(4) En el dashboard: botón Conectar arriba del proyecto → pestañas URI. Si el fallo sigue, reseteá la contraseña de la base en Database settings."
    );
  }
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
    return flatErrorMessage(error) || "Error al guardar la suscripción";
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
