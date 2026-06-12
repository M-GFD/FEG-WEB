"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

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

function supportsWebPushInBrowser(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

/**
 * Ofrecer el flujo real de Web Push solo donde tiene sentido:
 * - iOS / iPad: solo en PWA instalada (standalone). En Safari el permiso no es el de la “app” del inicio.
 * - Escritorio (Chrome, Edge, etc.), Android y resto: pestaña normal o PWA si el navegador expone Push API.
 */
function canOfferRealPushOptIn(): boolean {
  if (Notification.permission !== "default") return false;
  if (!supportsWebPushInBrowser()) return false;
  if (isIosLike()) {
    return isStandalonePwa();
  }
  return true;
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

async function registerAndPostSubscription(
  vapid: string
): Promise<{ ok: boolean; errorKey?: string; error?: string }> {
  if (!vapid || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, errorKey: "unsupportedBrowser" };
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
      const msg = e instanceof Error ? e.message : "";
      return { ok: false, errorKey: "subscribeFailed", error: msg || undefined };
    }
  }

  const j = sub.toJSON();
  if (!j.endpoint || !j.keys?.auth || !j.keys?.p256dh) {
    return { ok: false, errorKey: "incompleteSubscription" };
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
    let message = res.statusText?.trim() || "";
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
    return { ok: false, errorKey: "saveFailed", error: message || undefined };
  }

  return { ok: true };
}

type OfferMode = "none" | "ios-hint" | "push";

export function PwaPushRegister() {
  const t = useTranslations("pwa");
  const tc = useTranslations("common");
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
      setSubscribeError(t("errors.iosStandaloneRequired"));
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
          setSubscribeError(
            r.errorKey ? t(`errors.${r.errorKey}` as "errors.activateFailed") : r.error ?? t("errors.activateFailed")
          );
          return;
        }
        setMode("none");
      } catch (e) {
        console.error("[PwaPushRegister] activar", e);
        setSubscribeError(e instanceof Error ? e.message : t("errors.generic"));
      } finally {
        setBusy(false);
      }
    });
  }, [vapidKey, t]);

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
        aria-label={t("iosDialogAria")}
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-[var(--feg-green)]/20 bg-[var(--feg-green)] p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto max-w-lg text-sm text-[#FFFFFF]">
          <p className="font-semibold">{t("iosTitle")}</p>
          <p className="mt-2 text-[#FFFFFF]/90">
            {t.rich("iosBody", {
              strong: (chunks) => <strong className="text-[#FFFFFF]">{chunks}</strong>,
            })}
          </p>
          <button
            type="button"
            onClick={onDismissIosHint}
            className="mt-4 w-full rounded-xl border border-white/40 py-2.5 text-sm font-medium text-[#FFFFFF] sm:w-auto sm:px-6"
          >
            {t("iosUnderstand")}
          </button>
        </div>
      </div>
    );
  }

  if (mode !== "push") return null;

  return (
    <div
      role="dialog"
      aria-label={t("pushDialogAria")}
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-[var(--feg-green)] p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#FFFFFF]">
          <p>{t("pushBody")}</p>
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
            {t("dismiss")}
          </button>
          <button
            type="button"
            onClick={onEnablePush}
            disabled={busy}
            className="rounded-xl bg-[var(--feg-yellow)] px-4 py-2 text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95 disabled:opacity-60"
          >
            {busy ? tc("busy") : t("enable")}
          </button>
        </div>
      </div>
    </div>
  );
}
