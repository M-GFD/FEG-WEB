function firstTrimmed(...values: (string | undefined)[]): string {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return "";
}

/**
 * Clave VAPID pública (no es secreta). Debe formar par con la privada.
 *
 * Nombres aceptados (el primero que exista gana):
 * - NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY / WEB_PUSH_VAPID_PUBLIC_KEY (recomendado)
 * - NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PUBLIC_KEY (típico en tutoriales)
 * - PUBLIC_VAPID_KEY
 */
export function getWebPushVapidPublicKey(): string {
  return firstTrimmed(
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY,
    process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PUBLIC_KEY,
    process.env.PUBLIC_VAPID_KEY
  );
}

/**
 * Clave VAPID privada (solo servidor).
 *
 * - WEB_PUSH_VAPID_PRIVATE_KEY, VAPID_PRIVATE_KEY, PRIVATE_VAPID_KEY
 */
export function getWebPushVapidPrivateKey(): string {
  return firstTrimmed(
    process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
    process.env.VAPID_PRIVATE_KEY,
    process.env.PRIVATE_VAPID_KEY
  );
}

export function getWebPushVapidSubject(): string {
  return firstTrimmed(
    process.env.WEB_PUSH_VAPID_SUBJECT,
    process.env.VAPID_SUBJECT
  );
}
