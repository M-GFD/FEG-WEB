import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  PUBLIC_ERROR_GENERIC,
  PUBLIC_ERROR_VALIDATION,
  logServerError,
} from "@/lib/public-api-error";
import { z } from "zod";

const schema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

/**
 * Registra Web Push vía Supabase REST (misma credencial que el resto de la app).
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Servicio no disponible temporalmente." },
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
      return NextResponse.json({ error: PUBLIC_ERROR_VALIDATION }, { status: 400 });
    }

    const { endpoint, keys } = parsed.data;

    const { data: existing, error: selErr } = await supabase
      .from("PushSubscription")
      .select("id")
      .eq("endpoint", endpoint)
      .maybeSingle();

    if (selErr) {
      logServerError("[api/push/subscribe] select", selErr);
      return NextResponse.json({ error: PUBLIC_ERROR_GENERIC }, { status: 500 });
    }

    if (existing?.id) {
      const patch: { keys: typeof keys; userId?: string } = { keys };
      if (userId) patch.userId = userId;
      const { error: upErr } = await supabase
        .from("PushSubscription")
        .update(patch)
        .eq("id", existing.id);
      if (upErr) {
        logServerError("[api/push/subscribe] update", upErr);
        return NextResponse.json({ error: PUBLIC_ERROR_GENERIC }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabase.from("PushSubscription").insert({
        id: randomUUID(),
        endpoint,
        keys,
        userId,
      });
      if (insErr) {
        logServerError("[api/push/subscribe] insert", insErr);
        return NextResponse.json({ error: PUBLIC_ERROR_GENERIC }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    logServerError("[api/push/subscribe]", e);
    return NextResponse.json({ error: PUBLIC_ERROR_GENERIC }, { status: 500 });
  }
}
