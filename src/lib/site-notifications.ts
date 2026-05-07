import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

export type SiteNotificationDTO = {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdAt: string;
  read: boolean;
};

const LIST_LIMIT = 40;

type PostgrestishError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function formatSupabaseError(err: PostgrestishError, context: string): string {
  console.error(`[SiteNotification] ${context}`, err.code, err.message, err.details, err.hint);
  const msg = (err.message ?? "").toLowerCase();
  if (err.code === "PGRST205" || msg.includes("schema cache")) {
    return "Supabase no refrescó el esquema de la API. En SQL Editor ejecutá: NOTIFY pgrst, 'reload schema'; o en Dashboard → Project Settings → API buscá recargar esquema; esperá unos segundos y reintentá.";
  }
  if (msg.includes("does not exist") || msg.includes("not found")) {
    return "La base no tiene la tabla SiteNotification en este proyecto, o la app apunta a otra base. Verificá DATABASE_URL / Supabase y que la migración se ejecutó en el mismo proyecto.";
  }
  if (err.message) {
    return `Error al guardar (API): ${err.message}`;
  }
  return "No se pudo guardar vía Supabase REST.";
}

function mapPrismaInsertError(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021") {
      return "Falta la tabla en la base usada por Prisma. Aplicá la migración o revisá DATABASE_URL / DIRECT_URL.";
    }
    console.error("[SiteNotification] prisma insert", e.code, e.message, e.meta);
    return `Error de base (Prisma ${e.code}): ${e.message}`;
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return `No hay conexión a la base (Prisma): ${e.message}. Revisá DATABASE_URL; con Supabase pooler usá ?pgbouncer=true&connection_limit=1.`;
  }
  console.error("[SiteNotification] prisma insert", e);
  return e instanceof Error ? e.message : "Error desconocido con Prisma";
}

export async function fetchSiteNotificationsForUser(userId: string): Promise<SiteNotificationDTO[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: notifs, error: notifErr } = await supabase
      .from("SiteNotification")
      .select("id, title, body, linkUrl, createdAt")
      .order("createdAt", { ascending: false })
      .limit(LIST_LIMIT);

    if (!notifErr && notifs) {
      const { data: reads } = await supabase
        .from("SiteNotificationRead")
        .select("notificationId")
        .eq("userId", userId);

      const readSet = new Set((reads ?? []).map((r: { notificationId: string }) => r.notificationId));
      return notifs.map((n) => ({
        id: n.id as string,
        title: n.title as string,
        body: (n.body as string | null) ?? null,
        linkUrl: (n.linkUrl as string | null) ?? null,
        createdAt: n.createdAt as string,
        read: readSet.has(n.id as string),
      }));
    }
    if (notifErr) {
      console.error("[SiteNotification] supabase fetch", notifErr);
    }
  }

  try {
    const notifs = await prisma.siteNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
      select: {
        id: true,
        title: true,
        body: true,
        linkUrl: true,
        createdAt: true,
      },
    });

    if (notifs.length === 0) {
      return [];
    }

    const reads = await prisma.siteNotificationRead.findMany({
      where: { userId },
      select: { notificationId: true },
    });
    const readSet = new Set(reads.map((r) => r.notificationId));

    return notifs.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      linkUrl: n.linkUrl,
      createdAt: n.createdAt.toISOString(),
      read: readSet.has(n.id),
    }));
  } catch (e) {
    console.error("[SiteNotification] prisma fetch", e);
    return [];
  }
}

export async function insertSiteNotification(params: {
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdByUserId: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const id = randomUUID();
    const { data, error } = await supabase
      .from("SiteNotification")
      .insert({
        id,
        title: params.title,
        body: params.body,
        linkUrl: params.linkUrl,
        createdByUserId: params.createdByUserId,
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      return { ok: true, id: data.id as string };
    }
    if (error) {
      const supaMsg = formatSupabaseError(error, "supabase insert");
      try {
        const row = await prisma.siteNotification.create({
          data: {
            title: params.title,
            body: params.body,
            linkUrl: params.linkUrl,
            createdByUserId: params.createdByUserId,
          },
        });
        console.warn("[SiteNotification] insert: Supabase falló, OK por Prisma", row.id);
        return { ok: true, id: row.id };
      } catch (e) {
        const prismaMsg = mapPrismaInsertError(e);
        return {
          ok: false,
          error: `${supaMsg} · Respaldo Prisma: ${prismaMsg}`,
        };
      }
    }
    console.warn("[SiteNotification] supabase insert sin fila ni error explícito, intentando Prisma");
  }

  try {
    const row = await prisma.siteNotification.create({
      data: {
        title: params.title,
        body: params.body,
        linkUrl: params.linkUrl,
        createdByUserId: params.createdByUserId,
      },
    });
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: mapPrismaInsertError(e) };
  }
}

export async function markSiteNotificationReadForUser(
  userId: string,
  notificationId: string
): Promise<{ ok: boolean; error?: string }> {
  const readAt = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data: existing, error: selErr } = await supabase
      .from("SiteNotificationRead")
      .select("id")
      .eq("userId", userId)
      .eq("notificationId", notificationId)
      .maybeSingle();

    if (!selErr) {
      if (existing?.id) {
        const { error: upErr } = await supabase
          .from("SiteNotificationRead")
          .update({ readAt })
          .eq("id", existing.id as string);
        if (!upErr) return { ok: true };
        console.error("[SiteNotificationRead] supabase update", upErr);
      } else {
        const { error: insErr } = await supabase.from("SiteNotificationRead").insert({
          id: randomUUID(),
          userId,
          notificationId,
          readAt,
        });
        if (!insErr) return { ok: true };
        console.error("[SiteNotificationRead] supabase insert", insErr);
      }
    } else {
      console.error("[SiteNotificationRead] supabase select", selErr);
    }
  }

  try {
    await prisma.siteNotificationRead.upsert({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
      create: {
        userId,
        notificationId,
      },
      update: {
        readAt: new Date(readAt),
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[SiteNotificationRead] prisma upsert", e);
    return { ok: false, error: "Error al marcar como leída" };
  }
}
