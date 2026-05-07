"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { broadcastSiteNotificationPush } from "@/lib/push";
import { insertSiteNotification } from "@/lib/site-notifications";
import { canModeratePress } from "@/lib/rbac";

async function requireModeratePress() {
  const session = await auth();
  if (!session?.user || !canModeratePress(session.user.role)) {
    return null;
  }
  return session;
}

function normalizeOptionalUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/")) return t;
  return null;
}

export async function createSiteNotificationFromGestion(input: {
  title: string;
  body?: string;
  linkUrl?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireModeratePress();
  if (!session) {
    return { ok: false, error: "No autorizado" };
  }

  const title = input.title.trim();
  if (!title || title.length > 200) {
    return { ok: false, error: "Título inválido (máx. 200 caracteres)." };
  }

  const body = input.body?.trim() ?? "";
  if (body.length > 2000) {
    return { ok: false, error: "El texto es demasiado largo (máx. 2000 caracteres)." };
  }

  const linkUrl = normalizeOptionalUrl(input.linkUrl ?? "");
  if (input.linkUrl?.trim() && !linkUrl) {
    return { ok: false, error: "Enlace inválido (usá una URL https o una ruta que empiece con /)." };
  }

  const result = await insertSiteNotification({
    title,
    body: body || null,
    linkUrl,
    createdByUserId: session.user.id,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  void broadcastSiteNotificationPush({
    title,
    body: body || null,
    linkUrl,
  }).catch((err) => {
    console.error("[createSiteNotificationFromGestion] push", err);
  });

  revalidatePath("/gestion/prensa");
  revalidatePath("/");
  return { ok: true };
}
