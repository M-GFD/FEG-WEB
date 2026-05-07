import { randomUUID } from "crypto";
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

export async function fetchSiteNotificationsForUser(userId: string): Promise<SiteNotificationDTO[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  const { data: notifs, error: notifErr } = await supabase
    .from("SiteNotification")
    .select("id, title, body, linkUrl, createdAt")
    .order("createdAt", { ascending: false })
    .limit(LIST_LIMIT);

  if (notifErr || !notifs?.length) {
    return [];
  }

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

export async function insertSiteNotification(params: {
  title: string;
  body: string | null;
  linkUrl: string | null;
  createdByUserId: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Servicio no configurado" };
  }

  const id = randomUUID();
  const { error } = await supabase.from("SiteNotification").insert({
    id,
    title: params.title,
    body: params.body,
    linkUrl: params.linkUrl,
    createdByUserId: params.createdByUserId,
  });

  if (error) {
    console.error("[SiteNotification] insert", error);
    return { ok: false, error: "No se pudo guardar la notificación" };
  }

  return { ok: true, id };
}

export async function markSiteNotificationReadForUser(
  userId: string,
  notificationId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { ok: false, error: "Servicio no configurado" };
  }

  const { data: existing, error: selErr } = await supabase
    .from("SiteNotificationRead")
    .select("id")
    .eq("userId", userId)
    .eq("notificationId", notificationId)
    .maybeSingle();

  if (selErr) {
    console.error("[SiteNotificationRead] select", selErr);
    return { ok: false, error: "Error al marcar como leída" };
  }

  const readAt = new Date().toISOString();

  if (existing?.id) {
    const { error: upErr } = await supabase
      .from("SiteNotificationRead")
      .update({ readAt })
      .eq("id", existing.id as string);

    if (upErr) {
      console.error("[SiteNotificationRead] update", upErr);
      return { ok: false, error: "Error al marcar como leída" };
    }
    return { ok: true };
  }

  const { error: insErr } = await supabase.from("SiteNotificationRead").insert({
    id: randomUUID(),
    userId,
    notificationId,
    readAt,
  });

  if (insErr) {
    console.error("[SiteNotificationRead] insert", insErr);
    return { ok: false, error: "Error al marcar como leída" };
  }

  return { ok: true };
}
