import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

function supabasePushErrorMessage(error: { message?: string; code?: string }): string {
  const msg = error.message ?? "";
  if (/permission denied|row-level security|rls/i.test(msg)) {
    return "No se pudo guardar la suscripción. Revisá SUPABASE_SERVICE_ROLE_KEY en Vercel.";
  }
  if (/relation|does not exist|42P01|Could not find/i.test(msg)) {
    return "La tabla PushSubscription no existe. Ejecutá prisma/migrations/20260508_push_subscription.sql en el SQL Editor de Supabase.";
  }
  return msg || "Error al guardar la suscripción";
}

/**
 * Registra Web Push vía Supabase REST (misma credencial que el resto de la app).
 * Evita depender de DATABASE_URL / pooler de Prisma para este flujo.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Configuración incompleta: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 }
      );
    }

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

    const { endpoint, keys } = parsed.data;

    const { data: existing, error: selErr } = await supabase
      .from("PushSubscription")
      .select("id")
      .eq("endpoint", endpoint)
      .maybeSingle();

    if (selErr) {
      console.error("[api/push/subscribe] select", selErr);
      return NextResponse.json({ error: supabasePushErrorMessage(selErr) }, { status: 500 });
    }

    if (existing?.id) {
      const patch: { keys: typeof keys; userId?: string } = { keys };
      if (userId) patch.userId = userId;
      const { error: upErr } = await supabase
        .from("PushSubscription")
        .update(patch)
        .eq("id", existing.id);
      if (upErr) {
        console.error("[api/push/subscribe] update", upErr);
        return NextResponse.json({ error: supabasePushErrorMessage(upErr) }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabase.from("PushSubscription").insert({
        id: randomUUID(),
        endpoint,
        keys,
        userId,
      });
      if (insErr) {
        console.error("[api/push/subscribe] insert", insErr);
        return NextResponse.json({ error: supabasePushErrorMessage(insErr) }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/push/subscribe]", e);
    const message = e instanceof Error ? e.message : "Error al guardar la suscripción";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
