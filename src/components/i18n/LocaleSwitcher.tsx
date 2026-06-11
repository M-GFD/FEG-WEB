"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { setUserLocale } from "@/actions/locale";
import { LOCALE_CODE, locales, type AppLocale } from "@/i18n/routing";

type Props = {
  className?: string;
  headerContrast?: "dark" | "light";
};

const CLOSE_DELAY_MS = 120;

const TRIGGER_BASE =
  "inline-flex h-11 min-w-[2.75rem] shrink-0 items-center justify-center gap-0.5 rounded-full border px-2 text-[0.65rem] font-bold uppercase tracking-[0.08em] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feg-green)] md:h-9 md:min-w-[3rem] md:gap-1 md:px-2.5";

export function LocaleSwitcher({ className = "", headerContrast = "light" }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("locale");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const contrastClass =
    headerContrast === "dark"
      ? open
        ? "border-white/20 bg-white/18 text-white"
        : "border-white/15 bg-white/10 text-white hover:bg-white/18"
      : open
        ? "border-[#123c15]/18 bg-white text-[#123c15]"
        : "border-[#123c15]/12 bg-white/80 text-[#123c15] hover:bg-white";

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  function selectLocale(next: AppLocale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
    setOpen(false);
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) handleLeave();
      }}
    >
      <button
        type="button"
        className={`${TRIGGER_BASE} ${contrastClass} w-full ${pending ? "opacity-60" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("label")}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        {LOCALE_CODE[locale]}
        <ChevronDown
          className={`hidden h-3 w-3 opacity-70 transition-transform md:block ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-[100] pt-2">
          <ul
            role="listbox"
            aria-label={t("label")}
            className="min-w-[10.5rem] rounded-2xl border border-[var(--feg-green)]/18 bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(0,36,3,0.14)] backdrop-blur-md"
          >
            {locales.map((loc) => {
              const active = loc === locale;
              return (
                <li key={loc} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={pending}
                    onClick={() => selectLocale(loc)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition focus-visible:outline-none ${
                      active
                        ? "bg-[var(--feg-bg)] text-[var(--feg-green)]"
                        : "text-[#24321c] hover:bg-[var(--feg-bg)] focus-visible:bg-[var(--feg-bg)]"
                    }`}
                  >
                    <span>{LOCALE_CODE[loc]}</span>
                    <span className="text-xs font-medium text-[#24321c]/70">{t(loc)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
