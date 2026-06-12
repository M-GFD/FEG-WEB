"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { formatCalendarDate, getNextFegDate } from "@/lib/calendario-feg";
import { useCalendarI18n } from "@/lib/calendario-client";

/**
 * Card del Hero con el próximo torneo del calendario FEG. La comparación de fechas
 * usa siempre la zona horaria de Argentina (GMT−3, `FEG_TIME_ZONE` en calendario-feg).
 */
export function HeroNextTournamentCard() {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 60 * 60); // cada hora
    return () => clearInterval(id);
  }, []);

  const t = useTranslations("heroCard");
  const tCommon = useTranslations("common");
  const { locale, labels } = useCalendarI18n();
  const next = useMemo(() => getNextFegDate(locale, labels, now), [locale, labels, now]);

  return (
    // Card glass: queda fuera de RevealOnScroll para que el `transform` del reveal
    // NO aísle el backdrop-filter (idéntico patrón que la card Institucional del Home).
    <div className="ml-auto w-full max-w-sm shrink-0">
      <div className="relative w-full rounded-2xl bg-white/14 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,36,3,0.18)]">
        <RevealOnScroll revealIndex={3} yOffset={32} className="block">
          <div className="p-5">
            <div className="inline-flex rounded-full bg-[var(--feg-green)] px-3 py-1.5 text-[10px] font-semibold text-white ring-1 ring-black/10">
              {t("nextTournament")}
            </div>

            {next ? (
              <>
                <p className="mt-3 min-w-0 truncate text-xl font-semibold leading-snug">
                  <span className="text-white">{next.sede}</span>
                  <span className="text-white/75"> – </span>
                  <span className="font-bold text-[var(--feg-yellow)]">
                    {formatCalendarDate(next._raw, locale)}
                  </span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                    {next.modalidad}
                  </div>
                  <Link
                    href="/calendario"
                    className="ml-auto inline-flex items-center justify-center rounded-full bg-[#f3e12b] px-3 py-1.5 text-xs font-semibold text-[#146638] transition hover:brightness-95"
                  >
                    {tCommon("viewCalendar")}
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mt-3 text-base font-semibold text-white">
                  {t("noUpcoming")}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href="/calendario"
                    className="ml-auto inline-flex items-center justify-center rounded-full bg-[#f3e12b] px-3 py-1.5 text-xs font-semibold text-[#146638] transition hover:brightness-95"
                  >
                    {tCommon("viewCalendar")}
                  </Link>
                </div>
              </>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
