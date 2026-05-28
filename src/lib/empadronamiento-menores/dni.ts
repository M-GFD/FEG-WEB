import crypto from "crypto";

/** Normaliza DNI para búsqueda y hash (solo dígitos). */
export function normalizeDni(dni: string): string {
  return dni.replace(/\D/g, "").trim();
}

/**
 * Forma canónica alineada al import del padrón Player (parseInt sin ceros a la izquierda).
 * Evita que "053585911" y "53585911" no coincidan al buscar.
 */
export function canonicalDniForLookup(dni: string): string {
  const digits = normalizeDni(dni);
  if (!digits) return "";
  const n = parseInt(digits, 10);
  if (!Number.isFinite(n) || n < 1000) return digits;
  return String(n);
}

/** Hash estable por persona (DNI canónico, sin ceros a la izquierda). */
export function hashDniForLookup(dni: string): string {
  const canonical = canonicalDniForLookup(dni);
  if (!canonical) return "";
  return crypto
    .createHash("sha256")
    .update(`feg-youth-enrollment:${canonical}`)
    .digest("hex");
}
