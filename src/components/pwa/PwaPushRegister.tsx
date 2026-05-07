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

function isIosLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

function isCoarsePointer(): boolean {
  try {
    return window.matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
}

/**
 * Ofrecer el flujo real de Web Push solo donde tiene sentido:
 * - iOS / iPad: solo en PWA instalada (standalone). En Safari el permiso no es el de la “app” del inicio.
 * - Android y resto: PWA o Chrome móvil en pestaña (push sí aplica al origen).
 */
function canOfferRealPushOptIn(): boolean {
  if (Notification.permission !== "default") return false;
  if (isIosLike()) {
    return isStandalonePwa();
  }
  return isStandalonePwa() || isCoarsePointer();
}

/** Safari iOS sin PWA: instrucciones; no llamamos requestPermission aquí. */
function canShowIosInstallHint(): boolean {
  if (!isIosLike()) return false;
  if (isStandalonePwa()) return false;
  return Notification.permission === "default";
}

const RESHOW_AFTER_HIDDEN_SEC = 45;
const IOS_HINT_DISMISS_KEY = "feg_ios_pwa_push_hint_dismissed";

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
    try {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo suscribir al servicio push";
      return { ok: false, error: msg };
    }
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
    const text = await res.text().catch(() => "");
    let message = res.statusText?.trim() || "Error al guardar";
    const trimmed = text.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed) as { error?: string };
        if (typeof parsed.error === "string" && parsed.error) {
          message = parsed.error;
        }
      } catch {
        if (trimmed.length > 0 && trimmed.length < 500) {
          message = trimmed;
        }
      }
    } else if (trimmed.length > 0 && trimmed.length < 500) {
      message = trimmed;
    }
    return { ok: false, error: message };
  }

  return { ok: true };
}

type OfferMode = "none" | "ios-hint" | "push";

export function PwaPushRegister() {
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [mode, setMode] = useState<OfferMode>("none");
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

  const computeOfferMode = useCallback((): OfferMode => {
    if (!vapidKey) return "none";
    let iosHintDismissed = false;
    try {
      iosHintDismissed = sessionStorage.getItem(IOS_HINT_DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }

    if (canShowIosInstallHint() && !iosHintDismissed) {
      return "ios-hint";
    }
    if (canOfferRealPushOptIn()) {
      return "push";
    }
    return "none";
  }, [vapidKey]);

  const tryOffer = useCallback(() => {
    if (!vapidKey) return;
    setMode(computeOfferMode());
  }, [vapidKey, computeOfferMode]);

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
        tryOffer();
      }
    };

    const onPageShow = () => {
      tryOffer();
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
        if (isIosLike() && !isStandalonePwa()) {
          return;
        }
        const r = await registerAndPostSubscription(vapidKey);
        if (!r.ok && r.error) {
          console.error("[PwaPushRegister] sync", r.error);
        }
        return;
      }

      tryOffer();
    })();

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [vapidKey, tryOffer]);

  /**
   * requestPermission() debe ejecutarse en el mismo gesto del clic; no hace falta setState antes
   * (en Safari puede anular el permiso real).
   */
  const onEnablePush = useCallback(() => {
    if (!vapidKey) return;
    if (isIosLike() && !isStandalonePwa()) {
      setSubscribeError(
        "Abrí la FEG desde el ícono en tu inicio. En Safari solamente el permiso no aplica a la app instalada."
      );
      return;
    }

    setSubscribeError(null);
    const permPromise = Notification.requestPermission();

    void permPromise.then(async (perm) => {
      setBusy(true);
      try {
        if (perm !== "granted") {
          setMode("none");
          return;
        }
        const r = await registerAndPostSubscription(vapidKey);
        if (!r.ok) {
          setSubscribeError(r.error ?? "No se pudo activar");
          return;
        }
        setMode("none");
      } catch (e) {
        console.error("[PwaPushRegister] activar", e);
        setSubscribeError(e instanceof Error ? e.message : "Error");
      } finally {
        setBusy(false);
      }
    });
  }, [vapidKey]);

  const onDismissPush = () => {
    setSubscribeError(null);
    setMode("none");
  };

  const onDismissIosHint = () => {
    try {
      sessionStorage.setItem(IOS_HINT_DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setMode("none");
  };

  if (mode === "ios-hint") {
    return (
      <div
        role="dialog"
        aria-label="Cómo activar notificaciones en iPhone"
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--feg-green)]/20 bg-[var(--feg-green)] p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto max-w-lg text-sm text-[#FFFFFF]">
          <p className="font-semibold">Avisos en iPhone / iPad</p>
          <p className="mt-2 text-[#FFFFFF]/90">
            Las notificaciones push solo se pueden activar si abrís la FEG desde el{" "}
            <strong className="text-[#FFFFFF]">ícono en tu pantalla de inicio</strong>, no desde Safari. Si aún no la agregaste:{" "}
            <strong className="text-[#FFFFFF]">Compartir</strong> → <strong className="text-[#FFFFFF]">Agregar a inicio</strong>, abrí esa app y tocá Activar
            ahí.
          </p>
          <button
            type="button"
            onClick={onDismissIosHint}
            className="mt-4 w-full rounded-xl border border-white/40 py-2.5 text-sm font-medium text-[#FFFFFF] sm:w-auto sm:px-6"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  if (mode !== "push") return null;

  return (
    <div
      role="dialog"
      aria-label="Activar notificaciones"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-[var(--feg-green)] p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#FFFFFF]">
          <p>
            <span className="font-semibold">Recibí avisos cuando haya noticias nuevas.</span>{" "}
            Tocá Activar y aceptá en el cuadro del sistema (no solo en esta barra).
          </p>
          {subscribeError && (
            <p className="mt-2 text-xs text-red-200" role="alert">
              {subscribeError}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onDismissPush}
            className="rounded-xl bg-[var(--feg-green-2)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Ahora no
          </button>
          <button
            type="button"
            onClick={onEnablePush}
            disabled={busy}
            className="rounded-xl bg-[var(--feg-yellow)] px-4 py-2 text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95 disabled:opacity-60"
          >
            {busy ? "…" : "Activar"}
          </button>
        </div>
      </div>
    </div>
  );
}
