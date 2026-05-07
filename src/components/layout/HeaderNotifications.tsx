"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { parseApiJson } from "@/lib/parse-api-response";
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SiteNotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissingReads, setDismissingReads] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    if (status !== "authenticated" || !session?.user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/site-notifications", { credentials: "same-origin" });
      const data = await parseApiJson<{ ok: boolean; notifications?: SiteNotificationDTO[] }>(res);
      if (data.ok && Array.isArray(data.notifications)) {
        setItems(data.notifications);
      }
    } catch {
      /* silencioso: sin bloquear UI */
    } finally {
      setLoading(false);
    }
  }, [session?.user, status]);

  useEffect(() => {
    if (status === "authenticated") {
      void load();
    }
  }, [status, load]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  async function dismissReadNotifications() {
    const hasRead = items.some((n) => n.read);
    if (!hasRead || dismissingReads) return;
    setDismissingReads(true);
    try {
      const res = await fetch("/api/site-notifications/dismiss-read", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = await parseApiJson<{ ok: boolean }>(res);
      if (data.ok) {
        await load();
      }
    } catch {
      /* noop */
    } finally {
      setDismissingReads(false);
    }
  }

  async function markRead(id: string) {
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
      }
    } catch {
      /* noop */
    }
  }

  function onItemActivate(n: SiteNotificationDTO) {
    void markRead(n.id);
    setOpen(false);
    const href = n.linkUrl?.trim();
    if (!href) return;
    if (href.startsWith("/")) {
      router.push(href);
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  }

  if (status === "loading") {
    return <div className={`h-9 w-9 shrink-0 ${className}`} aria-hidden />;
  }

  if (status !== "authenticated" || !session?.user) {
    return null;
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
        aria-label={unread ? `Notificaciones, ${unread} sin leer` : "Notificaciones"}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-lg leading-none backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2 ${iconClass}`}
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

            {items.map((n) => (
              <div key={n.id} role="none" className="border-b border-black/[0.04] last:border-b-0">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    if (n.linkUrl?.trim()) {
                      onItemActivate(n);
                    } else {
                      void markRead(n.id);
                      setOpen(false);
                    }
                  }}
                  className={`flex w-full flex-col gap-0.5 px-3 py-2.5 text-left text-sm transition hover:bg-black/[0.04] ${n.read ? "text-neutral-700" : "bg-emerald-50/80 font-medium text-[var(--feg-ink)]"}`}
                >
                  <span className="line-clamp-2">{n.title}</span>
                  {n.body ? (
                    <span className="line-clamp-2 text-xs font-normal text-neutral-500">{n.body}</span>
                  ) : null}
                  <span className="text-[10px] font-normal uppercase tracking-wide text-neutral-400">
                    {formatShortDate(n.createdAt)}
                    {n.linkUrl?.trim() ? " · Ver enlace" : ""}
                  </span>
                </button>
              </div>
            ))}
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
