"use client";

import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { parseApiJson } from "@/lib/parse-api-response";
import {
  applyGuestNotificationState,
  guestHideNotificationId,
  guestMarkReadIds,
} from "@/lib/site-notifications-local";
import type { SiteNotificationDTO } from "@/lib/site-notifications";

type Ctx = {
  items: SiteNotificationDTO[];
  loading: boolean;
  load: () => Promise<void>;
  /** Marca como leídas en servidor (o localStorage si invitado). */
  markAsReadByIds: (ids: string[]) => Promise<void>;
  /** Quita un aviso del listado para este usuario / dispositivo. */
  dismissNotification: (id: string) => Promise<void>;
};

const SiteNotificationsContext = createContext<Ctx | null>(null);

export function useSiteNotifications(): Ctx {
  const v = useContext(SiteNotificationsContext);
  if (!v) {
    throw new Error("useSiteNotifications debe usarse dentro de SiteNotificationsProvider");
  }
  return v;
}

/**
 * Un solo estado compartido: hay dos campanas ✉️ montadas (móvil + desktop).
 */
export function SiteNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<SiteNotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const loadSeq = useRef(0);

  const load = useCallback(async () => {
    const id = ++loadSeq.current;
    setLoading(true);
    try {
      const res = await fetch("/api/site-notifications", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const data = await parseApiJson<{ ok: boolean; notifications?: SiteNotificationDTO[] }>(res);
      if (id !== loadSeq.current) return;
      if (data.ok && Array.isArray(data.notifications)) {
        const list =
          status === "unauthenticated"
            ? applyGuestNotificationState(data.notifications)
            : data.notifications;
        setItems(list);
      }
    } catch {
      /* silencioso */
    } finally {
      if (id === loadSeq.current) {
        setLoading(false);
      }
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        void load();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  const markAsReadByIds = useCallback(
    async (ids: string[]) => {
      const unique = [...new Set(ids.filter(Boolean))];
      if (unique.length === 0) return;

      setItems((prev) => prev.map((n) => (unique.includes(n.id) ? { ...n, read: true } : n)));

      if (status === "unauthenticated") {
        guestMarkReadIds(unique);
        return;
      }

      try {
        const res = await fetch("/api/site-notifications/mark-read", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationIds: unique }),
        });
        let data: { ok?: boolean };
        try {
          data = await parseApiJson<{ ok: boolean }>(res);
        } catch {
          data = { ok: false };
        }
        if (data.ok) return;
        if (res.status === 401 || res.status === 403) {
          guestMarkReadIds(unique);
          return;
        }
        await load();
      } catch {
        await load();
      }
    },
    [status, load]
  );

  const dismissNotification = useCallback(
    async (notificationId: string) => {
      const id = notificationId.trim();
      if (!id) return;

      setItems((prev) => prev.filter((n) => n.id !== id));

      if (status === "unauthenticated") {
        guestHideNotificationId(id);
        return;
      }

      try {
        const res = await fetch("/api/site-notifications/dismiss", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id }),
        });
        let data: { ok?: boolean };
        try {
          data = await parseApiJson<{ ok: boolean }>(res);
        } catch {
          data = { ok: false };
        }
        if (data.ok) return;
        if (res.status === 401 || res.status === 403) {
          guestHideNotificationId(id);
          return;
        }
        await load();
      } catch {
        await load();
      }
    },
    [status, load]
  );

  const value = useMemo<Ctx>(
    () => ({
      items,
      loading,
      load,
      markAsReadByIds,
      dismissNotification,
    }),
    [items, loading, load, markAsReadByIds, dismissNotification]
  );

  return (
    <SiteNotificationsContext.Provider value={value}>{children}</SiteNotificationsContext.Provider>
  );
}
