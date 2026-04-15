import { auth } from "./auth";
import type { Role } from "@prisma/client";

const ROLE_HIERARCHY: Record<Role, number> = {
  PUBLIC: 0,
  CLUB: 1,
  PRESS: 2,
  DIRECTOR: 3,
  TREASURER: 4,
  ADMIN: 5,
};

export function hasRole(userRole: Role, required: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required];
}

/** Moderación de galería / prensa: solo rol PRESS o ADMIN (no directivos ni tesorería). */
export function canModeratePress(role: Role): boolean {
  return role === "PRESS" || role === "ADMIN";
}

export function requireRole(required: Role) {
  return async () => {
    const session = await auth();
    if (!session?.user) return null;
    if (!hasRole(session.user.role, required)) return null;
    return session;
  };
}

export function requireClubAccess(clubId: string) {
  return async () => {
    const session = await auth();
    if (!session?.user) return null;
    if (session.user.role === "ADMIN") return session;
    if (session.user.clubId === clubId && hasRole(session.user.role, "CLUB")) return session;
    return null;
  };
}
