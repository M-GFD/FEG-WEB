/**
 * Respuestas de API seguras: el cliente no recibe stack, SQL ni mensajes de motor de DB.
 */
export const PUBLIC_ERROR_GENERIC =
  "No se pudo completar la operación. Si el problema continúa, contactá al administrador.";

export const PUBLIC_ERROR_VALIDATION = "Datos inválidos.";

export function logServerError(context: string, err: unknown): void {
  console.error(`[${context}]`, err);
}
