"use client";

import { useCallback, useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isStandalonePwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

async function registerAndPostSubscription(): Promise<boolean> {
  const vapid = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
  if (!vapid || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid),
    });
  }

  const j = sub.toJSON();
  if (!j.endpoint || !j.keys?.auth || !j.keys?.p256dh) {
    return false;
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: j.endpoint,
      keys: { p256dh: j.keys.p256dh, auth: j.keys.auth },
    }),
  });

  return res.ok;
}

/** Banner + registro de Web Push para usuarios con PWA instalada (sin requerir cuenta). */
export function PwaPushRegister() {
  const [showBanner, setShowBanner] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY) return;

    let cancelled = false;

    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (e) {
        console.error("[PwaPushRegister] SW register", e);
        return;
      }

      if (cancelled) return;

      if (Notification.permission === "granted") {
        await registerAndPostSubscription().catch((e) =>
          console.error("[PwaPushRegister] sync subscription", e)
        );
        return;
      }

      const dismissed = (() => {
        try {
          return sessionStorage.getItem("feg_push_banner_dismissed") === "1";
        } catch {
          return false;
        }
      })();

      if (isStandalonePwa() && Notification.permission === "default" && !dismissed) {
        setShowBanner(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onEnable = useCallback(async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setShowBanner(false);
        return;
      }
      const ok = await registerAndPostSubscription();
      setShowBanner(!ok);
    } catch (e) {
      console.error("[PwaPushRegister] activar", e);
    } finally {
      setBusy(false);
    }
  }, []);

  const onDismiss = () => {
    try {
      sessionStorage.setItem("feg_push_banner_dismissed", "1");
    } catch {
      /* ignore */
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Activar notificaciones"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--feg-green)]/20 bg-[var(--feg-bg)]/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--feg-ink)]">
          <span className="font-semibold">Recibí avisos cuando haya noticias nuevas.</span>{" "}
          Activá las notificaciones del navegador para esta app.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-xl border border-[var(--feg-green)]/25 px-4 py-2 text-sm font-medium text-[var(--feg-green)]"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={onEnable}
            disabled={busy}
            className="rounded-xl bg-[var(--feg-green-2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "…" : "Activar"}
          </button>
        </div>
      </div>
    </div>
  );
}
