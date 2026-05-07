"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

/** true si la app corre como PWA instalada (varía entre Android, iOS y modo pantalla). */
function isStandalonePwa(): boolean {
  try {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (nav.standalone === true) return true;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches
    );
  } catch {
    return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }
}

/** Quitar bandera antigua que impedía volver a mostrar el banner al reabrir la PWA. */
function clearLegacyBannerDismissFlag() {
  try {
    sessionStorage.removeItem("feg_push_banner_dismissed");
  } catch {
    /* ignore */
  }
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

/** Segundos en segundo plano tras los cuales volvemos a ofrecer el banner (reabrir desde inicio / multitarea). */
const RESHOW_AFTER_HIDDEN_SEC = 45;

export function PwaPushRegister() {
  const [showBanner, setShowBanner] = useState(false);
  const [busy, setBusy] = useState(false);
  const lastHiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    clearLegacyBannerDismissFlag();
    if (!process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY) return;

    let cancelled = false;

    const offerBannerIfEligible = () => {
      if (Notification.permission !== "default") return;
      if (!isStandalonePwa()) return;
      setShowBanner(true);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenAtRef.current = Date.now();
        return;
      }
      const at = lastHiddenAtRef.current;
      lastHiddenAtRef.current = null;
      const hiddenSec = at != null ? (Date.now() - at) / 1000 : 0;
      if (hiddenSec >= RESHOW_AFTER_HIDDEN_SEC) {
        offerBannerIfEligible();
      }
    };

    const onPageShow = () => {
      offerBannerIfEligible();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

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

      offerBannerIfEligible();
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
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

  /** Solo oculta en esta visita; al reabrir la PWA o volver tras un rato en segundo plano se vuelve a ofrecer. */
  const onDismiss = () => {
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
          Tocá Activar y aceptá las notificaciones cuando te lo pida el sistema.
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
