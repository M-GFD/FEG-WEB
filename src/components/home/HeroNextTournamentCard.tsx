"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import {
  formatCalendarDate,
  getNextFegDate,
  isMenoresCalendarModality,
} from "@/lib/calendario-feg";
import { useCalendarI18n } from "@/lib/calendario-client";
import { HOME_GLASS_CARD_CLASS } from "@/components/home/homeGlassCard";

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

  const isMenores = next
    ? isMenoresCalendarModality(next._raw.modalityKey)
    : false;
  const ctaHref = isMenores ? "/inscripcion-torneos-menores" : "/calendario";
  const ctaLabel = isMenores ? t("signup") : tCommon("viewCalendar");

  return (
    // Card glass: queda fuera de RevealOnScroll para que el `transform` del reveal
    // NO aísle el backdrop-filter (idéntico patrón que la card Institucional del Home).
    <div className="ml-auto w-full max-w-sm shrink-0">
      <div className={HOME_GLASS_CARD_CLASS}>
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
                  <InteractiveHoverButton href={ctaHref} className="ml-auto shrink-0">
                    {ctaLabel}
                  </InteractiveHoverButton>
                </div>
              </>
            ) : (
              <>
                <div className="mt-3 text-base font-semibold text-white">
                  {t("noUpcoming")}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <InteractiveHoverButton href="/calendario" className="ml-auto shrink-0">
                    {tCommon("viewCalendar")}
                  </InteractiveHoverButton>
                </div>
              </>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
