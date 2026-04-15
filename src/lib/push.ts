/**
 * Push notifications - hooks para enviar notificaciones
 * Los clubes/prensa pueden disparar eventos que envían push a suscriptores
 *
 * Uso típico:
 * - Resultados publicados -> notificar a jugadores del torneo
 * - Noticia importante -> notificar a todos los suscriptores
 * - Aviso de torneo -> notificar a clubes/jugadores
 *
 * Requiere: tabla PushSubscription, endpoint para suscribirse,
 * y un job/API para enviar (ej: web-push con VAPID keys)
 */

export async function notifyResultadosPublicados(
  tournamentId: string,
  tournamentName: string
) {
  // TODO: Obtener suscripciones relevantes y enviar push
  // await sendPush({ title: "Resultados publicados", body: tournamentName });
  return { tournamentId, tournamentName };
}

export async function notifyNuevaNoticia(title: string, excerpt: string) {
  // TODO: Enviar a todos los suscriptores
  return { title, excerpt };
}
