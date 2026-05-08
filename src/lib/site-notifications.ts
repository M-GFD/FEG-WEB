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

async function resolveExistingSiteNotificationIds(ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  try {
    const rows = await prisma.siteNotification.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    return rows.map((r) => r.id);
  } catch (e) {
    console.error("[SiteNotification] prisma resolve ids", e);
    const supabase = getSupabaseAdmin();
    if (!supabase) return [];
    const { data, error } = await supabase.from("SiteNotification").select("id").in("id", ids);
    if (error || !data) {
      console.error("[SiteNotification] supabase resolve ids", error);
      return [];
    }
    return (data as { id: string }[]).map((r) => r.id);
  }
}

async function markReadsViaSupabase(
  userId: string,
  notificationIds: string[],
  readAt: Date
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const readAtIso = readAt.toISOString();

  for (const notificationId of notificationIds) {
    const { data: existing, error: selErr } = await supabase
      .from("SiteNotificationRead")
      .select("id")
      .eq("userId", userId)
      .eq("notificationId", notificationId)
      .maybeSingle();

    if (selErr) {
      console.error("[SiteNotificationRead] supabase mark-read select", selErr);
      return false;
    }

    if (existing?.id) {
      const { error: upErr } = await supabase
        .from("SiteNotificationRead")
        .update({ readAt: readAtIso, dismissedAt: null })
        .eq("id", existing.id as string);
      if (upErr) {
        console.error("[SiteNotificationRead] supabase mark-read update", upErr);
        return false;
      }
    } else {
      const { error: insErr } = await supabase.from("SiteNotificationRead").insert({
        id: randomUUID(),
        userId,
        notificationId,
        readAt: readAtIso,
      });
      if (insErr) {
        console.error("[SiteNotificationRead] supabase mark-read insert", insErr);
        return false;
      }
    }
  }

  return true;
}

async function dismissViaSupabase(
  userId: string,
  notificationId: string,
  now: Date
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Sin cliente Supabase" };
  }

  const nowIso = now.toISOString();

  const { data: existing, error: selErr } = await supabase
    .from("SiteNotificationRead")
    .select("id")
    .eq("userId", userId)
    .eq("notificationId", notificationId)
    .maybeSingle();

  if (selErr) {
    console.error("[SiteNotificationRead] supabase dismiss select", selErr);
    return { ok: false, error: "Error al eliminar del listado" };
  }

  if (existing?.id) {
    const { error: upErr } = await supabase
      .from("SiteNotificationRead")
      .update({ dismissedAt: nowIso })
      .eq("id", existing.id as string);
    if (upErr) {
      console.error("[SiteNotificationRead] supabase dismiss update", upErr);
      return { ok: false, error: "Error al eliminar del listado" };
    }
    return { ok: true };
  }

  const { error: insErr } = await supabase.from("SiteNotificationRead").insert({
    id: randomUUID(),
    userId,
    notificationId,
    readAt: nowIso,
    dismissedAt: nowIso,
  });
  if (insErr) {
    console.error("[SiteNotificationRead] supabase dismiss insert", insErr);
    return { ok: false, error: "Error al eliminar del listado" };
  }
  return { ok: true };
}

async function siteNotificationExists(notificationId: string): Promise<boolean> {
  try {
    const row = await prisma.siteNotification.findFirst({
      where: { id: notificationId },
      select: { id: true },
    });
    return !!row;
  } catch (e) {
    console.error("[SiteNotification] prisma exists", e);
    const supabase = getSupabaseAdmin();
    if (!supabase) return false;
    const { data, error } = await supabase
      .from("SiteNotification")
      .select("id")
      .eq("id", notificationId)
      .maybeSingle();
    if (error) {
      console.error("[SiteNotification] supabase exists", error);
      return false;
    }
    return !!data;
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

  const validIds = await resolveExistingSiteNotificationIds(ids);
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
    return { ok: true };
  } catch (e) {
    console.error("[SiteNotificationRead] prisma batch upsert (raw)", e);
  }

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
    return { ok: true };
  } catch (e2) {
    console.error("[SiteNotificationRead] prisma secuencial", e2);
  }

  const supabaseOk = await markReadsViaSupabase(userId, validIds, readAt);
  if (!supabaseOk) {
    return { ok: false, error: "Error al marcar como leídas" };
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

  const exists = await siteNotificationExists(id);
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
    console.error("[SiteNotificationRead] dismiss prisma", e);
  }

  return dismissViaSupabase(userId, id, now);
}
