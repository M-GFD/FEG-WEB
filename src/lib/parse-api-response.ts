/**
 * Lee el cuerpo de una Response como JSON.
 * Si el servidor devolvió HTML (p. ej. error 500, login, proxy), evita el error críptico de JSON.parse.
 */
export async function parseApiJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const ct = (res.headers.get("content-type") ?? "").toLowerCase();
  const trimmed = text.trimStart();

  if (trimmed.startsWith("<!") || trimmed.startsWith("<html")) {
    const authHint =
      res.status === 401 || res.status === 403
        ? " Puede que la sesión haya caducado: recargá la página e iniciá sesión de nuevo."
        : "";
    throw new Error(
      `El servidor respondió con HTML (${res.status}) en lugar de JSON.${authHint} ` +
        `En Herramientas de desarrollador → Red, revisá la petición a /api/… (URL final y código de estado).`
    );
  }

  const looksJson =
    ct.includes("application/json") || trimmed.startsWith("{") || trimmed.startsWith("[");

  if (looksJson) {
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`La respuesta no era JSON válido (HTTP ${res.status}).`);
    }
  }

  throw new Error(
    text.trim().slice(0, 280) || `Respuesta inesperada del servidor (HTTP ${res.status}).`
  );
}
