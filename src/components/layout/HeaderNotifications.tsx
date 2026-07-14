"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSiteNotifications } from "@/components/layout/SiteNotificationsContext";

type HeaderTheme = "dark" | "light";

type Props = {
  theme?: HeaderTheme;
  className?: string;
  headerVisible?: boolean;
};

const AUTO_READ_MS = 3000;

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

export function HeaderNotifications({
  theme = "light",
  className = "",
  headerVisible = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { items, loading, load, markAsReadByIds } = useSiteNotifications();
  const t = useTranslations("notifications");

  const [open, setOpen] = useState(false);
  const [menuTopPx, setMenuTopPx] = useState(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useLayoutEffect(() => {
    if (!open) return;
    function positionUnderTrigger() {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setMenuTopPx(r.bottom + 8);
    }
    positionUnderTrigger();
    window.addEventListener("resize", positionUnderTrigger);
    window.addEventListener("scroll", positionUnderTrigger, true);
    return () => {
      window.removeEventListener("resize", positionUnderTrigger);
      window.removeEventListener("scroll", positionUnderTrigger, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      const unreadIds = itemsRef.current.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length > 0) void markAsReadByIds(unreadIds);
    }, AUTO_READ_MS);
    return () => window.clearTimeout(timer);
  }, [open, markAsReadByIds]);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!headerVisible) setOpen(false);
  }, [headerVisible]);

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

  const iconClass =
    theme === "dark"
      ? "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
      : "text-[var(--feg-green)]";

  const menuCard = (
    <div
      className="w-full max-w-[20rem] overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
      role="menu"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="border-b border-black/5 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--feg-green)]">
          {t("title")}
        </p>
      </div>

      <div className="max-h-[min(22rem,50vh)] overflow-y-auto">
        {loading && items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-neutral-500">{t("loading")}</p>
        ) : null}

        {!loading && items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-neutral-500">{t("empty")}</p>
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
                <div
                  className={`flex flex-col gap-0.5 rounded-md px-0 py-1 text-sm ${n.read ? "text-neutral-700" : "bg-emerald-50/80 font-medium text-[var(--feg-ink)]"}`}
                >
                  <span className="line-clamp-2">{n.title}</span>
                  {n.body ? (
                    <span className="line-clamp-2 text-xs font-normal text-neutral-500">{n.body}</span>
                  ) : null}
                  <span className="text-[10px] font-normal uppercase tracking-wide text-neutral-400">
                    {formatShortDate(n.createdAt)}
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {href ? (
                    <button
                      type="button"
                      className="text-left text-[11px] font-semibold text-[var(--feg-green-2)] hover:underline"
                      onClick={() => openNotificationLink(href)}
                    >
                      {t("openLink")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="ml-auto text-[11px] font-semibold text-[var(--feg-green-2)] hover:underline"
                    onClick={() => void markAsReadByIds([n.id])}
                  >
                    {t("markRead")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={wrapRef} className={`relative z-[70] shrink-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-busy={loading}
        aria-label={
          unread > 0 ? t("ariaUnread", { count: unread }) : t("ariaDefault")
        }
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white/70 text-lg leading-none backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition hover:bg-white/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2 md:h-9 md:w-9 ${iconClass}`}
      >
        <span aria-hidden>✉️</span>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 min-h-[9px] min-w-[9px] rounded-full bg-red-500 ring-2 ring-white/90" />
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="fixed z-[80] flex justify-center md:hidden"
            style={{
              top: menuTopPx,
              left: "max(1rem, env(safe-area-inset-left))",
              right: "max(1rem, env(safe-area-inset-right))",
            }}
          >
            {menuCard}
          </div>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] hidden w-[min(20rem,calc(100vw-2rem))] md:block">
            {menuCard}
          </div>
        </>
      ) : null}
    </div>
  );
}
