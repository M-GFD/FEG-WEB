"use client";

import { getSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseApiJson } from "@/lib/parse-api-response";
import {
  applyGuestNotificationState,
  guestDismissReadIds,
  guestMarkReadId,
} from "@/lib/site-notifications-local";
import type { SiteNotificationDTO } from "@/lib/site-notifications";

type HeaderTheme = "dark" | "light";

type Props = {
  /** Tema bajo el header (desktop); en móvil se usa variante fija legible sobre la cápsula. */
  theme?: HeaderTheme;
  className?: string;
};

function formatShortDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function HeaderNotifications({ theme = "light", className = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SiteNotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissingReads, setDismissingReads] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-notifications", { credentials: "same-origin" });
      const data = await parseApiJson<{ ok: boolean; notifications?: SiteNotificationDTO[] }>(res);
      if (data.ok && Array.isArray(data.notifications)) {
        const session = await getSession();
        const list = session?.user
          ? data.notifications
          : applyGuestNotificationState(data.notifications);
        setItems(list);
      }
    } catch {
      /* silencioso: sin bloquear UI */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e: PointerEvent) {
      const el = wrapRef.current;
      if (!el?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  async function dismissReadNotifications() {
    const hasRead = items.some((n) => n.read);
    if (!hasRead || dismissingReads) return;

    const session = await getSession();
    if (!session?.user) {
      guestDismissReadIds(items.filter((n) => n.read).map((n) => n.id));
      await load();
      return;
    }

    setDismissingReads(true);
    try {
      const res = await fetch("/api/site-notifications/dismiss-read", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await parseApiJson<{ ok: boolean }>(res);
      if (data.ok) {
        await load();
        return;
      }
      if (res.status === 401 || res.status === 403) {
        const s = await getSession();
        if (!s?.user) {
          guestDismissReadIds(items.filter((n) => n.read).map((n) => n.id));
          await load();
        }
      }
    } catch {
      /* noop */
    } finally {
      setDismissingReads(false);
    }
  }

  async function markRead(id: string): Promise<boolean> {
    const applyGuestRead = () => {
      guestMarkReadId(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const session = await getSession();
    if (!session?.user) {
      applyGuestRead();
      return true;
    }

    try {
      const res = await fetch("/api/site-notifications/read", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      const data = await parseApiJson<{ ok: boolean }>(res);
      if (data.ok) {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        return true;
      }
      if (res.status === 401 || res.status === 403) {
        const s = await getSession();
        if (!s?.user) {
          applyGuestRead();
          return true;
        }
      }
    } catch {
      /* noop */
    }
    return false;
  }

  function openNotificationLink(href: string) {
    const h = href.trim();
    if (!h) return;
    if (h.startsWith("/")) {
      router.push(h);
    } else {
      window.open(h, "_blank", "noopener,noreferrer");
    }
  }

  const unread = items.filter((n) => !n.read).length;
  const hasReadVisible = items.some((n) => n.read);

  const iconClass =
    theme === "dark"
      ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
      : "text-[var(--feg-green)]";

  return (
    <div ref={wrapRef} className={`relative z-[70] shrink-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-busy={loading}
        aria-label={unread ? `Notificaciones, ${unread} sin leer` : "Notificaciones"}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/70 text-lg leading-none backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2 md:h-9 md:w-9 ${iconClass}`}
      >
        <span aria-hidden>✉️</span>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 min-h-[9px] min-w-[9px] rounded-full bg-red-500 ring-2 ring-white/90" />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-2 border-b border-black/5 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--feg-green)]">
              Notificaciones
            </p>
            <button
              type="button"
              title="Ocultar del listado las notificaciones que ya marcaste como leídas"
              disabled={!hasReadVisible || dismissingReads || loading}
              onClick={() => void dismissReadNotifications()}
              className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {dismissingReads ? "…" : "Quitar leídas"}
            </button>
          </div>

          <div className="max-h-[min(22rem,50vh)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-neutral-500">Cargando…</p>
            ) : null}

            {!loading && items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-neutral-500">No hay notificaciones</p>
            ) : null}

            {items.map((n) => {
              const href = n.linkUrl?.trim() ?? "";
              return (
                <div
                  key={n.id}
                  role="none"
                  className="flex gap-2 border-b border-black/[0.04] px-3 py-2.5 last:border-b-0"
                >
                  <div className="flex w-4 shrink-0 justify-center pt-1.5" aria-hidden>
                    {!n.read ? (
                      <span className="h-2 w-2 rounded-full bg-red-500 ring-1 ring-red-500/30" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-transparent" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      role="menuitem"
                      aria-label={
                        n.read
                          ? `${n.title}. Marcada como leída.`
                          : `${n.title}. Sin leer. Pulsar para marcar como leída.`
                      }
                      className={`flex w-full flex-col gap-0.5 rounded-md px-0 py-1 text-left text-sm transition hover:bg-black/[0.04] touch-manipulation ${n.read ? "text-neutral-700" : "bg-emerald-50/80 font-medium text-[var(--feg-ink)]"}`}
                      onClick={() => void markRead(n.id)}
                    >
                      <span className="line-clamp-2">{n.title}</span>
                      {n.body ? (
                        <span className="line-clamp-2 text-xs font-normal text-neutral-500">{n.body}</span>
                      ) : null}
                      <span className="text-[10px] font-normal uppercase tracking-wide text-neutral-400">
                        {formatShortDate(n.createdAt)}
                      </span>
                    </button>
                    {href ? (
                      <button
                        type="button"
                        className="mt-1.5 text-left text-[11px] font-semibold text-[var(--feg-green-2)] hover:underline"
                        onClick={() => openNotificationLink(href)}
                      >
                        Abrir enlace
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-black/5 px-3 py-2 text-center">
            <button
              type="button"
              className="text-[11px] font-medium text-[var(--feg-green-2)] hover:underline"
              onClick={() => {
                setOpen(false);
                void load();
              }}
            >
              Actualizar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
