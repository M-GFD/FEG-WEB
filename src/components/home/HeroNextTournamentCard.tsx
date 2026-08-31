"use client";

import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { CalendarDateChangeNotice } from "@/components/calendar/CalendarDateChangeNotice";
import { HOME_GLASS_CARD_CLASS } from "@/components/home/homeGlassCard";
import type { HomeCalendarCardDto } from "@/lib/calendario-feg";
import { useTranslations } from "next-intl";

type Props = {
  next: HomeCalendarCardDto | null;
};

export function HeroNextTournamentCard({ next }: Props) {
  const t = useTranslations("heroCard");
  const tCommon = useTranslations("common");
  const tCal = useTranslations("calendar");

  const isMenores = next?.isMenores ?? false;
  const ctaHref = isMenores ? "/inscripcion-torneos-menores" : "/calendario";
  const ctaLabel = isMenores ? t("signup") : tCommon("viewCalendar");

  return (
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
                  <span className="font-bold text-[var(--feg-yellow)]">{next.fecha}</span>
                </p>
                <CalendarDateChangeNotice
                  status={next.status}
                  originalDateLabel={
                    next.originalFecha ? tCal("originalDate", { original: next.originalFecha }) : null
                  }
                  originalVenueLabel={
                    next.originalSede ? tCal("originalVenue", { venue: next.originalSede }) : null
                  }
                  note={next.note}
                  copy={{
                    cancelled: tCal("statusCancelled"),
                    suspended: tCal("statusSuspended"),
                    rescheduled: tCal("statusRescheduled"),
                    changeNotice: tCal("changeNotice"),
                  }}
                  compact
                />
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
