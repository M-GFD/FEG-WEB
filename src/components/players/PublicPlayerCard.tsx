"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export type PublicPlayerCardProps = {
  href: string;
  title: string;
  clubName?: string | null;
  category?: string | null;
  handicapLabel: string;
};

export function PublicPlayerCard({
  href,
  title,
  clubName,
  category,
  handicapLabel,
}: PublicPlayerCardProps) {
  const t = useTranslations("player.card");

  return (
    <Link
      href={href}
      className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_10px_30px_rgba(0,36,3,0.06)] transition hover:border-[var(--feg-green)]/25 hover:shadow-[0_14px_40px_rgba(0,36,3,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
            {t("badge")}
          </p>
          <h2 className="mt-1.5 truncate font-heading text-lg font-semibold leading-snug text-[var(--feg-ink)]">
            {title}
          </h2>
          {clubName ? (
            <p className="mt-1 truncate text-sm font-medium text-[var(--feg-green)]">{clubName}</p>
          ) : null}
          {category ? (
            <span className="mt-2 inline-flex rounded-full bg-[var(--feg-bg)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
              {category}
            </span>
          ) : null}
        </div>
        <div className="shrink-0 rounded-2xl bg-[var(--feg-green-soft)]/10 px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]/80">
            {t("handicap")}
          </p>
          <p className="mt-0.5 font-heading text-xl font-semibold text-[var(--feg-ink)]">{handicapLabel}</p>
        </div>
      </div>
    </Link>
  );
}
