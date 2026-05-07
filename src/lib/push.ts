/**
 * Push notifications (PWA + Web Push + VAPID).
 *
 * - Suscripción: POST /api/push/subscribe (no requiere cuenta).
 * - Envío masivo: `broadcastNewsPublishedPush` en `push-web.ts`.
 */

export { broadcastNewsPublishedPush } from "./push-web";

export async function notifyResultadosPublicados(
  tournamentId: string,
  tournamentName: string
) {
  // TODO: segmentar suscripciones por torneo y enviar push
  return { tournamentId, tournamentName };
}
