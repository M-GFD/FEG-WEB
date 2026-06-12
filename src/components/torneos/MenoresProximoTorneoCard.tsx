"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { YouthTournamentSignupConfigPublic } from "@/lib/inscripcion-torneos-menores/config";
import { formatFechaTitle } from "@/lib/calendario-feg";

type Props = {
  config: YouthTournamentSignupConfigPublic;
};

export function MenoresProximoTorneoCard({ config }: Props) {
  const t = useTranslations("youthTournament");

  return (
    <div className="mb-10 rounded-2xl border border-[var(--feg-green)]/15 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)] sm:p-8">
      <p className="inline-flex rounded-full bg-[var(--feg-green-2)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white">
        {t("badge")}
      </p>
      <h2 className="mt-4 font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] sm:text-3xl">
        {config.title}
      </h2>
      <p className="mt-2 text-lg font-medium text-[var(--feg-green)]">
        {formatFechaTitle(config.dateLabel)}
        {config.extraLine ? (
          <>
            <br />
            <span className="text-base">{config.extraLine}</span>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-sm font-semibold text-[var(--feg-ink)]">
        {t("venue", { venue: config.venue })}
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--feg-green)]">
        {t("description")}
      </p>
      <Link
        href="/inscripcion-torneos-menores"
        className="mt-6 inline-flex rounded-full bg-[var(--feg-yellow)] px-8 py-3 font-heading text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95"
      >
        {t("signUp")}
      </Link>
    </div>
  );
}
