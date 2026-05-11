import type { SiteNotificationDTO } from "@/lib/site-notifications";

/**
 * Invitados: leído y “eliminado del listado” solo en este dispositivo (localStorage).
 * Solo se persisten IDs públicos de avisos (no credenciales ni PII).
 */
const READ_KEY = "feg:site-notif:readIds";
const HIDDEN_KEY = "feg:site-notif:hiddenIds";

function parseIdSet(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return new Set();
    return new Set(v.filter((x): x is string => typeof x === "string" && x.length > 0));
  } catch {
    return new Set();
  }
}

function persistGuestReadIds(ids: Set<string>): void {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
  } catch {
    /* noop */
  }
}

function persistGuestHiddenIds(ids: Set<string>): void {
  try {
    localStorage.setItem(HIDDEN_KEY, JSON.stringify([...ids]));
  } catch {
    /* noop */
  }
}

export function guestMarkReadIds(ids: string[]): void {
  if (ids.length === 0 || typeof window === "undefined") return;
  const s = parseIdSet(localStorage.getItem(READ_KEY));
  for (const id of ids) {
    if (id) s.add(id);
  }
  persistGuestReadIds(s);
}

/** Saca el aviso del menú (invitado). */
export function guestHideNotificationId(id: string): void {
  if (!id || typeof window === "undefined") return;
  const hidden = parseIdSet(localStorage.getItem(HIDDEN_KEY));
  hidden.add(id);
  persistGuestHiddenIds(hidden);
  const read = parseIdSet(localStorage.getItem(READ_KEY));
  read.delete(id);
  persistGuestReadIds(read);
}

export function applyGuestNotificationState(notifications: SiteNotificationDTO[]): SiteNotificationDTO[] {
  if (typeof window === "undefined") {
    return notifications;
  }
  const readIds = parseIdSet(localStorage.getItem(READ_KEY));
  const hiddenIds = parseIdSet(localStorage.getItem(HIDDEN_KEY));
  return notifications
    .filter((n) => !hiddenIds.has(n.id))
    .map((n) => ({ ...n, read: readIds.has(n.id) }));
}
