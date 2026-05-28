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

export function hashDniForLookup(dni: string): string {
  const normalized = normalizeDni(dni);
  if (!normalized) return "";
  return crypto.createHash("sha256").update(`feg-youth-enrollment:${normalized}`).digest("hex");
}
