"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export type TournamentHistoricRow = {
  id: string;
  name: string;
  slug: string;
  date: string;
  status: string;
  club: { name: string };
  galleryCount: number;
  galleryThumb: string | null;
};

type SortMode = "reciente" | "antiguo";
type YearFilter = "todos" | number;

export function TorneosHistoricoClient({
  tournaments,
}: {
  tournaments: TournamentHistoricRow[];
}) {
  const t = useTranslations("tournamentsHistoric");

  const years = useMemo(() => {
    const set = new Set<number>();
    for (const t of tournaments) {
      set.add(new Date(t.date).getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [tournaments]);

  const [sort, setSort] = useState<SortMode>("reciente");
  const [year, setYear] = useState<YearFilter>("todos");

  const filtered = useMemo(() => {
    let list = [...tournaments];
    if (year !== "todos") {
      list = list.filter((t) => new Date(t.date).getFullYear() === year);
    }
    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sort === "reciente" ? db - da : da - db;
    });
    return list;
  }, [tournaments, sort, year]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_14px_40px_rgba(0,36,3,0.06)] sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <label
            htmlFor="sort-antiguedad"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--feg-green-2)]"
          >
            {t("sortLabel")}
          </label>
          <select
            id="sort-antiguedad"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2.5 text-sm font-medium text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
          >
            <option value="reciente">{t("sortRecent")}</option>
            <option value="antiguo">{t("sortOldest")}</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="filter-year"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--feg-green-2)]"
          >
            {t("yearLabel")}
          </label>
          <select
            id="filter-year"
            value={year === "todos" ? "todos" : String(year)}
            onChange={(e) => {
              const v = e.target.value;
              setYear(v === "todos" ? "todos" : Number(v));
            }}
            className="rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-3 py-2.5 text-sm font-medium text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
          >
            <option value="todos">{t("yearAll")}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm font-medium text-[var(--feg-green)] sm:ml-auto sm:pb-2">
          {t("count", { count: filtered.length })}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
          {t("filterEmpty")}
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/torneos/${tournament.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)] transition hover:border-[var(--feg-green-2)]/35 hover:shadow-[0_20px_50px_rgba(0,36,3,0.12)]"
            >
              <div className="relative aspect-[16/10] w-full bg-[var(--feg-bg)]">
                {tournament.galleryThumb ? (
                  <Image
                    src={tournament.galleryThumb}
                    alt=""
                    fill
                    className="object-cover transition group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[var(--feg-green)]/70">
                    {t("noGallery")}
                  </div>
                )}
                {tournament.galleryCount > 0 && (
                  <span className="absolute bottom-2 right-2 rounded-full bg-[var(--feg-ink)]/85 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {t("photoCount", { count: tournament.galleryCount })}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-heading text-lg font-semibold uppercase leading-snug tracking-tight text-[var(--feg-ink)] group-hover:text-[var(--feg-green-2)]">
                  {tournament.name}
                </h2>
                <p className="mt-2 text-sm text-[var(--feg-green)]">
                  {tournament.club.name} ·{" "}
                  {new Date(tournament.date).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <span
                  className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    tournament.status === "PUBLISHED"
                      ? "bg-[var(--feg-green-2)]/15 text-[var(--feg-green-2)]"
                      : tournament.status === "IN_PROGRESS"
                        ? "bg-[var(--feg-yellow)]/35 text-[var(--feg-ink)]"
                        : "bg-[var(--feg-bg)] text-[var(--feg-green)]"
                  }`}
                >
                  {tournament.status === "PUBLISHED"
                    ? t("statusPublished")
                    : tournament.status === "IN_PROGRESS"
                      ? t("statusInProgress")
                      : t("statusDraft")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
