import webpush from "web-push";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/app-url";
import { FEG_LOGO_PUBLIC_PATH } from "@/lib/feegBrand";

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  const publicKey =
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY || process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  const subject =
    process.env.WEB_PUSH_VAPID_SUBJECT?.trim() ||
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_SUBJECT?.trim() ||
    "mailto:feg-notificaciones@localhost";

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

type PushKeys = { p256dh: string; auth: string };

function isPushKeys(v: unknown): v is PushKeys {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return typeof o.p256dh === "string" && typeof o.auth === "string";
}

const CHUNK = 40;

/**
 * Envía a todas las suscripciones guardadas (PWA + permiso de notificaciones).
 * No requiere cuenta en la plataforma; `userId` en BD es opcional.
 */
export async function broadcastNewsPublishedPush(params: {
  title: string;
  slug: string;
  excerpt?: string | null;
}): Promise<{ sent: number; failed: number; removedStale: number; skippedConfig: boolean }> {
  if (!ensureVapidConfigured()) {
    console.warn(
      "[broadcastNewsPublishedPush] Faltan NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY (o WEB_PUSH_VAPID_PUBLIC_KEY) y WEB_PUSH_VAPID_PRIVATE_KEY; no se envían pushes."
    );
    return { sent: 0, failed: 0, removedStale: 0, skippedConfig: true };
  }

  const base = getBaseUrl().replace(/\/+$/, "");
  const articleUrl = `${base}/noticias/${encodeURIComponent(params.slug)}`;
  const icon = `${base}${FEG_LOGO_PUBLIC_PATH}`;
  const payload = JSON.stringify({
    title: "Nueva noticia · FEG",
    body: (params.excerpt?.trim() || params.title).slice(0, 240),
    url: articleUrl,
    icon,
    badge: icon,
  });

  const rows = await prisma.pushSubscription.findMany({
    select: { id: true, endpoint: true, keys: true },
  });

  let sent = 0;
  let failed = 0;
  let removedStale = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    await Promise.all(
      chunk.map(async (row) => {
        const keysRaw = row.keys;
        if (!isPushKeys(keysRaw)) {
          failed += 1;
          return;
        }
        const subscription = {
          endpoint: row.endpoint,
          keys: keysRaw,
        };
        try {
          await webpush.sendNotification(subscription, payload, {
            TTL: 86_400,
            urgency: "normal",
          });
          sent += 1;
        } catch (err: unknown) {
          const status =
            err && typeof err === "object" && "statusCode" in err
              ? (err as { statusCode?: number }).statusCode
              : undefined;
          if (status === 410 || status === 404) {
            try {
              await prisma.pushSubscription.delete({ where: { id: row.id } });
              removedStale += 1;
            } catch {
              /* ya borrada u otro error */
            }
          } else {
            failed += 1;
            console.error("[broadcastNewsPublishedPush] send", row.endpoint.slice(0, 48), err);
          }
        }
      })
    );
  }

  return { sent, failed, removedStale, skippedConfig: false };
}
