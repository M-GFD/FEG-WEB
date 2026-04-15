import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { canModeratePress, hasRole } from "./rbac";

/** Primer segmento bajo /gestion (sin contar "gestion"). */
export type GestionArea =
  | "admin"
  | "prensa"
  | "club"
  | "tesoreria"
  | "directorio"
  | "perfil";

const GESTION_AREAS = new Set<string>([
  "admin",
  "prensa",
  "club",
  "tesoreria",
  "directorio",
  "perfil",
]);

/**
 * Tras login o al entrar a /gestion: destino por rol.
 * ADMIN → administración; PRESS → prensa; CLUB → operaciones de club;
 * DIRECTOR → panel directivo (rankings/actividad); TREASURER → tesorería.
 */
export function gestionHomeForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/gestion/admin";
    case "PRESS":
      return "/gestion/prensa";
    case "CLUB":
      return "/gestion/club";
    case "DIRECTOR":
      return "/gestion/club";
    case "TREASURER":
      return "/gestion/tesoreria";
    default:
      return "/gestion/perfil";
  }
}

/** ADMIN: todas las áreas. Resto: solo la suya + perfil. DIRECTOR también usa /gestion/club (resultados). */
export function canAccessGestionArea(role: Role, area: string): boolean {
  if (role === "PUBLIC") return false;
  if (role === "ADMIN") return GESTION_AREAS.has(area);

  if (area === "perfil") return true;

  switch (area) {
    case "admin":
      return false;
    case "prensa":
      return canModeratePress(role);
    case "club":
      return role === "CLUB" || role === "DIRECTOR";
    case "tesoreria":
      return hasRole(role, "TREASURER");
    case "directorio":
      return role === "DIRECTOR";
    default:
      return false;
  }
}

export function gestionAreaFromPathname(pathname: string): GestionArea | null {
  if (!pathname.startsWith("/gestion")) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const seg = parts[1];
  if (!GESTION_AREAS.has(seg)) return null;
  return seg as GestionArea;
}

export function canAccessGestionPath(role: Role, pathname: string): boolean {
  const area = gestionAreaFromPathname(pathname);
  if (area == null) {
    // /gestion o /gestion/ (sin subruta) lo maneja el middleware con redirect
    return true;
  }
  return canAccessGestionArea(role, area);
}

/** Convierte URLs antiguas /dashboard/* → /gestion/... */
export function mapLegacyDashboardPath(pathname: string): string {
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return "/gestion";
  }
  if (pathname.startsWith("/dashboard/admin")) {
    return pathname.replace(/^\/dashboard/, "/gestion");
  }
  if (pathname.startsWith("/dashboard/prensa")) {
    return pathname.replace(/^\/dashboard/, "/gestion");
  }
  if (pathname.startsWith("/dashboard/tesoreria")) {
    return pathname.replace(/^\/dashboard/, "/gestion");
  }
  if (pathname.startsWith("/dashboard/torneos")) {
    return pathname.replace("/dashboard/torneos", "/gestion/club/torneos");
  }
  if (pathname.startsWith("/dashboard/fotos")) {
    return pathname.replace("/dashboard/fotos", "/gestion/club/fotos");
  }
  return "/gestion";
}

/** Validación en server components / layouts bajo /gestion. */
export function requireGestionArea(role: Role, area: GestionArea): void {
  if (!canAccessGestionArea(role, area)) {
    redirect("/auth/unauthorized");
  }
}
