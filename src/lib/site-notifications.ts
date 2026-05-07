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

/** Notificaciones del sitio se borran de la base tras 7 días (lecturas en cascada). */
export const SITE_NOTIFICATION_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export async function purgeExpiredSiteNotifications(): Promise<void> {
  const cutoff = new Date(Date.now() - SITE_NOTIFICATION_RETENTION_MS);
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("SiteNotification")
      .delete()
      .lt("createdAt", cutoff.toISOString());
    if (error) {
      console.error("[SiteNotification] purge supabase", error);
    }
  }
  try {
    await prisma.siteNotification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
  } catch (e) {
    console.error("[SiteNotification] purge prisma", e);
  }
}

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

function mapNotificationsWithReads(
  notifs: Array<{
    id: string;
    title: string;
    body: string | null;
    linkUrl: string | null;
    createdAt: string | Date;
  }>,
  readRows: Array<{ notificationId: string; dismissedAt: string | Date | null | undefined }>
): SiteNotificationDTO[] {
  const byNotif = new Map<string, { dismissedAt?: string | Date | null }>();
  for (const r of readRows) {
    byNotif.set(r.notificationId, { dismissedAt: r.dismissedAt });
  }

  const out: SiteNotificationDTO[] = [];
  for (const n of notifs) {
    const meta = byNotif.get(n.id);
    if (meta?.dismissedAt) continue;
    const createdAt =
      typeof n.createdAt === "string" ? n.createdAt : n.createdAt.toISOString();
    out.push({
      id: n.id,
      title: n.title,
      body: n.body,
      linkUrl: n.linkUrl,
      createdAt,
      read: meta != null,
    });
  }
  return out;
}

async function getRecentSiteNotificationIds(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: notifs, error: notifErr } = await supabase
      .from("SiteNotification")
      .select("id")
      .order("createdAt", { ascending: false })
      .limit(LIST_LIMIT);

    if (!notifErr && notifs) {
      return (notifs as { id: string }[]).map((n) => n.id);
    }
    if (notifErr) {
      console.error("[SiteNotification] supabase ids", notifErr);
    }
  }

  try {
    const rows = await prisma.siteNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
      select: { id: true },
    });
    return rows.map((r) => r.id);
  } catch (e) {
    console.error("[SiteNotification] prisma ids", e);
    return [];
  }
}

function mapRecentToGuestBaseDto(
  notifs: Array<{
    id: string;
    title: string;
    body: string | null;
    linkUrl: string | null;
    createdAt: string | Date;
  }>
): SiteNotificationDTO[] {
  return notifs.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    linkUrl: n.linkUrl,
    createdAt: typeof n.createdAt === "string" ? n.createdAt : n.createdAt.toISOString(),
    read: false,
  }));
}

/**
 * Listado de avisos: con `userId` aplica lecturas y “Quitar leídas” en servidor;
 * sin usuario devuelve todas las recientes como no leídas (estado local en el cliente).
 */
export async function fetchSiteNotificationsList(userId: string | null): Promise<SiteNotificationDTO[]> {
  await purgeExpiredSiteNotifications();

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: notifs, error: notifErr } = await supabase
      .from("SiteNotification")
      .select("id, title, body, linkUrl, createdAt")
      .order("createdAt", { ascending: false })
      .limit(LIST_LIMIT);

    if (!notifErr && notifs) {
      const typed = notifs as Array<{
        id: string;
        title: string;
        body: string | null;
        linkUrl: string | null;
        createdAt: string;
      }>;
      if (!userId) {
        return mapRecentToGuestBaseDto(typed);
      }
      const { data: reads } = await supabase
        .from("SiteNotificationRead")
        .select("notificationId, dismissedAt")
        .eq("userId", userId);

      return mapNotificationsWithReads(
        typed,
        (reads ?? []) as Array<{ notificationId: string; dismissedAt: string | null }>
      );
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

    if (!userId) {
      return mapRecentToGuestBaseDto(notifs);
    }

    const reads = await prisma.siteNotificationRead.findMany({
      where: { userId },
      select: { notificationId: true, dismissedAt: true },
    });

    return mapNotificationsWithReads(notifs, reads);
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
  await purgeExpiredSiteNotifications();

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
          .update({ readAt, dismissedAt: null })
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
        dismissedAt: null,
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[SiteNotificationRead] prisma upsert", e);
    return { ok: false, error: "Error al marcar como leída" };
  }
}

/** Marca como leídas varias notificaciones (orden de la lista actual). */
export async function markSiteNotificationIdsReadForUser(
  userId: string,
  notificationIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  const seen = new Set<string>();
  for (const raw of notificationIds) {
    const notificationId = String(raw ?? "").trim();
    if (!notificationId || seen.has(notificationId)) continue;
    seen.add(notificationId);
    const r = await markSiteNotificationReadForUser(userId, notificationId);
    if (!r.ok) {
      return { ok: false, error: r.error ?? "Error al marcar como leídas" };
    }
  }
  return { ok: true };
}

/** Marca como leídas (en servidor) todas las notificaciones recientes del listado. */
export async function markAllRecentSiteNotificationsReadForUser(
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  await purgeExpiredSiteNotifications();
  const ids = await getRecentSiteNotificationIds();
  for (const notificationId of ids) {
    const r = await markSiteNotificationReadForUser(userId, notificationId);
    if (!r.ok) {
      return { ok: false, error: r.error ?? "Error al marcar todas como leídas" };
    }
  }
  return { ok: true };
}

/** Marca como ocultas (solo este usuario) todas las notificaciones que ya tenía leídas. */
export async function dismissReadSiteNotificationsForUser(
  userId: string
): Promise<{ ok: boolean; dismissed?: number; error?: string }> {
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data: rows, error: selErr } = await supabase
      .from("SiteNotificationRead")
      .select("id")
      .eq("userId", userId)
      .is("dismissedAt", null);

    if (selErr) {
      console.error("[SiteNotificationRead] dismiss select", selErr);
    } else if (rows?.length) {
      const { error: upErr } = await supabase
        .from("SiteNotificationRead")
        .update({ dismissedAt: now })
        .eq("userId", userId)
        .is("dismissedAt", null);

      if (!upErr) {
        return { ok: true, dismissed: rows.length };
      }
      console.error("[SiteNotificationRead] dismiss update supabase", upErr);
    } else {
      return { ok: true, dismissed: 0 };
    }
  }

  try {
    const result = await prisma.siteNotificationRead.updateMany({
      where: {
        userId,
        dismissedAt: null,
      },
      data: { dismissedAt: new Date(now) },
    });
    return { ok: true, dismissed: result.count };
  } catch (e) {
    console.error("[SiteNotificationRead] dismiss prisma", e);
    return {
      ok: false,
      error:
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2021"
          ? "Falta la columna dismissedAt. Ejecutá la migración en la base de datos."
          : "No se pudo limpiar las leídas",
    };
  }
}
