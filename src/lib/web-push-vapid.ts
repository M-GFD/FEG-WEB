/** Clave VAPID pública (no es secreta). Debe formar par con WEB_PUSH_VAPID_PRIVATE_KEY en el servidor. */
export function getWebPushVapidPublicKey(): string {
  return (
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY?.trim() ||
    process.env.WEB_PUSH_VAPID_PUBLIC_KEY?.trim() ||
    ""
  );
}
