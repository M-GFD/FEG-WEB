import crypto from "crypto";

/** Normaliza DNI para búsqueda y hash (solo dígitos). */
export function normalizeDni(dni: string): string {
  return dni.replace(/\D/g, "").trim();
}

export function hashDniForLookup(dni: string): string {
  const normalized = normalizeDni(dni);
  if (!normalized) return "";
  return crypto.createHash("sha256").update(`feg-youth-enrollment:${normalized}`).digest("hex");
}
