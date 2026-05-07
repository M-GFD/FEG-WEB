/**
 * Web Push (PWA): suscripción en POST /api/push/subscribe; clave pública en GET /api/push/vapid-public.
 * Envío al publicar noticias: broadcastNewsPublishedPush; avisos internos: broadcastSiteNotificationPush.
 */

export {
  broadcastNewsPublishedPush,
  broadcastSiteNotificationPush,
} from "./push-web";
export type { WebPushBroadcastStats } from "./push-web";

export async function notifyResultadosPublicados(
  tournamentId: string,
  tournamentName: string
) {
  // TODO: segmentar suscripciones por torneo
  return { tournamentId, tournamentName };
}
