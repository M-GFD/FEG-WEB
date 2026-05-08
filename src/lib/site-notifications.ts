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

async function fetchSiteNotificationsListViaSupabase(
  userId: string | null
): Promise<SiteNotificationDTO[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: notifs, error: notifErr } = await supabase
    .from("SiteNotification")
    .select("id, title, body, linkUrl, createdAt")
    .order("createdAt", { ascending: false })
    .limit(LIST_LIMIT);

  if (notifErr || !notifs) {
    console.error("[SiteNotification] supabase fetch list", notifErr);
    return null;
  }

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

  const { data: reads, error: readsErr } = await supabase
    .from("SiteNotificationRead")
    .select("notificationId, dismissedAt")
    .eq("userId", userId);

  if (readsErr) {
    console.error("[SiteNotificationRead] supabase fetch reads", readsErr);
    return mapRecentToGuestBaseDto(typed);
  }

  const readRows = (reads ?? []) as Array<{
    notificationId: string;
    dismissedAt: string | null;
  }>;

  return mapNotificationsWithReads(
    typed,
    readRows.map((r) => ({
      notificationId: r.notificationId,
      dismissedAt: r.dismissedAt,
    }))
  );
}

/**
 * Listado reciente. Sin sesión: avisos como no leídos (estado leído/oculto solo en el dispositivo).
 * Si Prisma no conecta pero Supabase sí (p. ej. push OK, listado vacío), se usa Supabase como respaldo.
 */
export async function fetchSiteNotificationsList(userId: string | null): Promise<SiteNotificationDTO[]> {
  await purgeExpiredSiteNotifications();

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

    if (!userId) {
      return mapRecentToGuestBaseDto(notifs);
    }

    const reads = await prisma.siteNotificationRead.findMany({
      where: { userId },
      select: { notificationId: true, dismissedAt: true },
    });

    return mapNotificationsWithReads(notifs, reads);
  } catch (e) {
    console.error("[SiteNotification] fetch prisma", e);
  }

  const fallback = await fetchSiteNotificationsListViaSupabase(userId);
  return fallback ?? [];
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

/** Marca como leídas (sin quitar del listado) los ids indicados, si existen como avisos. */
export async function markSiteNotificationIdsReadForUser(
  userId: string,
  notificationIds: string[]
): Promise<{ ok: boolean; error?: string }> {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const raw of notificationIds) {
    const notificationId = String(raw ?? "").trim();
    if (!notificationId || seen.has(notificationId)) continue;
    seen.add(notificationId);
    ids.push(notificationId);
  }
  if (ids.length === 0) return { ok: true };

  const existing = await prisma.siteNotification.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  const validIds = existing.map((r) => r.id);

  if (validIds.length === 0) {
    return { ok: true };
  }

  const readAt = new Date();

  const valueRows = Prisma.join(
    validIds.map((notificationId) =>
      Prisma.sql`(gen_random_uuid()::text, ${userId}, ${notificationId}, ${readAt}, NULL)`
    )
  );

  try {
    await prisma.$executeRaw`
      INSERT INTO "SiteNotificationRead" ("id", "userId", "notificationId", "readAt", "dismissedAt")
      VALUES ${valueRows}
      ON CONFLICT ("userId", "notificationId")
      DO UPDATE SET
        "readAt" = EXCLUDED."readAt",
        "dismissedAt" = NULL
    `;
  } catch (e) {
    console.error("[SiteNotificationRead] prisma batch upsert (raw)", e);
    try {
      for (const notificationId of validIds) {
        await prisma.siteNotificationRead.upsert({
          where: {
            userId_notificationId: { userId, notificationId },
          },
          create: { userId, notificationId },
          update: {
            readAt,
            dismissedAt: null,
          },
        });
      }
    } catch (e2) {
      console.error("[SiteNotificationRead] prisma secuencial fallback", e2);
      if (e2 instanceof Prisma.PrismaClientKnownRequestError) {
        return { ok: false, error: `Error al marcar (${e2.code}): ${e2.message}` };
      }
      return { ok: false, error: "Error al marcar como leídas" };
    }
  }

  return { ok: true };
}

/** Oculta un aviso para este usuario (no borra la fila global). */
export async function dismissSiteNotificationForUser(
  userId: string,
  notificationId: string
): Promise<{ ok: boolean; error?: string }> {
  const id = String(notificationId ?? "").trim();
  if (!id) return { ok: false, error: "notificationId requerido" };

  const exists = await prisma.siteNotification.findFirst({
    where: { id },
    select: { id: true },
  });
  if (!exists) return { ok: true };

  const now = new Date();
  try {
    await prisma.siteNotificationRead.upsert({
      where: {
        userId_notificationId: { userId, notificationId: id },
      },
      create: {
        userId,
        notificationId: id,
        readAt: now,
        dismissedAt: now,
      },
      update: {
        dismissedAt: now,
      },
    });
    return { ok: true };
  } catch (e) {
    console.error("[SiteNotificationRead] dismiss one", e);
    return { ok: false, error: "No se pudo eliminar del listado" };
  }
}
