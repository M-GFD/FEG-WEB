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

function isStandalonePwa(): boolean {
  try {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (nav.standalone === true) return true;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches
    );
  } catch {
    return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }
}

function isCoarsePointer(): boolean {
  try {
    return window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

function shouldOfferPushUi(): boolean {
  if (Notification.permission !== "default") return false;
  return isStandalonePwa() || isCoarsePointer();
}

const RESHOW_AFTER_HIDDEN_SEC = 45;

async function resolveVapidPublicKey(): Promise<string | null> {
  const fromEnv =
    process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY?.trim() ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (fromEnv) return fromEnv;
  try {
    const r = await fetch("/api/push/vapid-public");
    if (!r.ok) return null;
    const j = (await r.json()) as { publicKey?: string | null };
    const k = j.publicKey?.trim();
    return k || null;
  } catch {
    return null;
  }
}

async function registerAndPostSubscription(vapid: string): Promise<{ ok: boolean; error?: string }> {
  if (!vapid || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, error: "Navegador incompatible" };
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
    return { ok: false, error: "Suscripción incompleta" };
  }

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: j.endpoint,
      keys: { p256dh: j.keys.p256dh, auth: j.keys.auth },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    return { ok: false, error: errBody || res.statusText || "Error al guardar" };
  }

  return { ok: true };
}

export function PwaPushRegister() {
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [busy, setBusy] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const lastHiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void resolveVapidPublicKey().then((k) => {
      if (!cancelled) setVapidKey(k);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tryOfferBanner = useCallback(() => {
    if (!vapidKey) return;
    if (!shouldOfferPushUi()) return;
    setShowBanner(true);
  }, [vapidKey]);

  useEffect(() => {
    if (!vapidKey) return;
    let cancelled = false;

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenAtRef.current = Date.now();
        return;
      }
      const at = lastHiddenAtRef.current;
      lastHiddenAtRef.current = null;
      const hiddenSec = at != null ? (Date.now() - at) / 1000 : 0;
      if (hiddenSec >= RESHOW_AFTER_HIDDEN_SEC) {
        tryOfferBanner();
      }
    };

    const onPageShow = () => {
      tryOfferBanner();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);

    void (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (e) {
        console.error("[PwaPushRegister] SW register", e);
        return;
      }

      if (cancelled) return;

      if (Notification.permission === "granted") {
        const r = await registerAndPostSubscription(vapidKey);
        if (!r.ok && r.error) {
          console.error("[PwaPushRegister] sync", r.error);
        }
        return;
      }

      tryOfferBanner();
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [vapidKey, tryOfferBanner]);

  const onEnable = useCallback(async () => {
    if (!vapidKey) return;
    setSubscribeError(null);
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setShowBanner(false);
        return;
      }
      const r = await registerAndPostSubscription(vapidKey);
      if (!r.ok) {
        setSubscribeError(r.error ?? "No se pudo activar");
        return;
      }
      setShowBanner(false);
    } catch (e) {
      console.error("[PwaPushRegister] activar", e);
      setSubscribeError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, [vapidKey]);

  const onDismiss = () => {
    setSubscribeError(null);
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
        <div className="text-sm text-[var(--feg-ink)]">
          <p>
            <span className="font-semibold">Recibí avisos cuando haya noticias nuevas.</span>{" "}
            Tocá Activar y aceptá cuando el sistema pregunte (en iPhone, desde la app en el inicio).
          </p>
          {subscribeError && (
            <p className="mt-2 text-xs text-red-800" role="alert">
              {subscribeError}
            </p>
          )}
        </div>
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
