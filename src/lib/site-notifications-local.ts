import type { SiteNotificationDTO } from "@/lib/site-notifications";

/**
 * Notificaciones sin sesión: leídas y “quitadas” solo en este dispositivo (localStorage).
 * En modo privado / iOS con bloqueo puede no persistir.
 */
const READ_KEY = "feg:site-notif:readIds";
const HIDDEN_KEY = "feg:site-notif:hiddenIds";

function parseIdSet(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return new Set();
    return new Set(v.filter((x) => typeof x === "string" && x.length > 0));
  } catch {
    return new Set();
  }
}

export function loadGuestReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return parseIdSet(localStorage.getItem(READ_KEY));
}

export function loadGuestHiddenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return parseIdSet(localStorage.getItem(HIDDEN_KEY));
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

export function guestMarkReadId(id: string): void {
  const s = loadGuestReadIds();
  s.add(id);
  persistGuestReadIds(s);
}

/** Igual que “Quitar leídas” en servidor: oculta ítems ya marcados como leídos. */
export function guestDismissReadIds(readIds: string[]): void {
  if (readIds.length === 0) return;
  const hidden = loadGuestHiddenIds();
  const read = loadGuestReadIds();
  for (const id of readIds) {
    hidden.add(id);
    read.delete(id);
  }
  persistGuestHiddenIds(hidden);
  persistGuestReadIds(read);
}

export function applyGuestNotificationState(notifications: SiteNotificationDTO[]): SiteNotificationDTO[] {
  const readIds = loadGuestReadIds();
  const hiddenIds = loadGuestHiddenIds();
  return notifications
    .filter((n) => !hiddenIds.has(n.id))
    .map((n) => ({ ...n, read: readIds.has(n.id) }));
}
