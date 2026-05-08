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
  guestDismissReadIds,
  guestMarkAllReadIds,
  guestMarkReadId,
} from "@/lib/site-notifications-local";
import type { SiteNotificationDTO } from "@/lib/site-notifications";

type Ctx = {
  items: SiteNotificationDTO[];
  loading: boolean;
  dismissingReads: boolean;
  markingAllRead: boolean;
  load: () => Promise<void>;
  dismissReadNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markRead: (id: string) => Promise<boolean>;
};

const SiteNotificationsContext = createContext<Ctx | null>(null);

export function useSiteNotifications(): Ctx {
  const v = useContext(SiteNotificationsContext);
  if (!v) {
    throw new Error("useSiteNotifications debe usarse dentro de SiteNotificationsProvider");
  }
  return v;
}

/** Un único estado para todos los botones ✉️ (hay dos componentes montados: móvil + desktop). */
export function SiteNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<SiteNotificationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissingReads, setDismissingReads] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
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

  const dismissReadNotifications = useCallback(async () => {
    const hasRead = items.some((n) => n.read);
    if (!hasRead || dismissingReads) return;

    if (status === "unauthenticated") {
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
        guestDismissReadIds(items.filter((n) => n.read).map((n) => n.id));
        await load();
      }
    } catch {
      /* noop */
    } finally {
      setDismissingReads(false);
    }
  }, [items, dismissingReads, load, status]);

  const markAllAsRead = useCallback(async () => {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0 || markingAllRead || dismissingReads) {
      return;
    }

    const snapshot = items.map((n) => ({ ...n }));

    setItems((prev) =>
      prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
    );

    setMarkingAllRead(true);
    try {
      if (status === "unauthenticated") {
        guestMarkAllReadIds(unreadIds);
        await load();
        return;
      }

      const res = await fetch("/api/site-notifications/read-all", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });

      let data: { ok?: boolean };
      try {
        data = await parseApiJson<{ ok: boolean }>(res);
      } catch {
        data = { ok: false };
      }

      if (data.ok) {
        await load();
        return;
      }

      if (res.status === 401 || res.status === 403) {
        guestMarkAllReadIds(unreadIds);
        await load();
        return;
      }

      setItems(snapshot);
    } catch {
      setItems(snapshot);
    } finally {
      setMarkingAllRead(false);
    }
  }, [items, markingAllRead, dismissingReads, load, status]);

  const markRead = useCallback(async (id: string): Promise<boolean> => {
    const applyGuestRead = () => {
      guestMarkReadId(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    if (status === "unauthenticated") {
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
        applyGuestRead();
        return true;
      }
    } catch {
      /* noop */
    }
    return false;
  }, [status]);

  const value = useMemo<Ctx>(
    () => ({
      items,
      loading,
      dismissingReads,
      markingAllRead,
      load,
      dismissReadNotifications,
      markAllAsRead,
      markRead,
    }),
    [
      items,
      loading,
      dismissingReads,
      markingAllRead,
      load,
      dismissReadNotifications,
      markAllAsRead,
      markRead,
    ]
  );

  return (
    <SiteNotificationsContext.Provider value={value}>{children}</SiteNotificationsContext.Provider>
  );
}
