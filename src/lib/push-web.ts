import webpush from "web-push";
import { prisma } from "@/lib/db";
import { getBaseUrl } from "@/lib/app-url";
import { FEG_LOGO_PUBLIC_PATH } from "@/lib/feegBrand";
import {
  getWebPushVapidPrivateKey,
  getWebPushVapidPublicKey,
  getWebPushVapidSubject,
} from "@/lib/web-push-vapid";

let vapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  const publicKey = getWebPushVapidPublicKey();
  const privateKey = getWebPushVapidPrivateKey();
  const subject =
    getWebPushVapidSubject() || "mailto:feg-notificaciones@localhost";

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

export async function broadcastNewsPublishedPush(params: {
  title: string;
  slug: string;
  excerpt?: string | null;
}): Promise<{ sent: number; failed: number; removedStale: number; skippedConfig: boolean }> {
  if (!ensureVapidConfigured()) {
    console.warn(
      "[broadcastNewsPublishedPush] Configura clave pública (WEB_PUSH_VAPID_PUBLIC_KEY, VAPID_PUBLIC_KEY, …) y privada (WEB_PUSH_VAPID_PRIVATE_KEY, VAPID_PRIVATE_KEY, …). Ver src/lib/web-push-vapid.ts"
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

  let rows: { id: string; endpoint: string; keys: unknown }[] = [];
  try {
    rows = await prisma.pushSubscription.findMany({
      select: { id: true, endpoint: true, keys: true },
    });
  } catch (e) {
    console.error("[broadcastNewsPublishedPush] findMany", e);
    return { sent: 0, failed: 0, removedStale: 0, skippedConfig: false };
  }

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
              /* ignore */
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
