"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HandicapRankingCategoryBlock } from "@/lib/data";

type Props = {
  categories: HandicapRankingCategoryBlock[];
  /** Índice en el array ya ordenado (p. ej. categoría CAB). */
  initialIndex: number;
};

export function RankingCategoryPager({ categories, initialIndex }: Props) {
  const [index, setIndex] = useState(initialIndex);

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? categories.length - 1 : i - 1));
  }, [categories.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= categories.length - 1 ? 0 : i + 1));
  }, [categories.length]);

  if (categories.length === 0) return null;

  const i = Math.min(Math.max(0, index), categories.length - 1);
  const cat = categories[i];
  const pos = i + 1;
  const total = categories.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[var(--feg-green)]">
          Categoría{" "}
          <span className="tabular-nums text-[var(--feg-ink)]">
            {pos} / {total}
          </span>
          <span className="mx-2 text-[var(--feg-green)]/40">·</span>
          <span className="text-[var(--feg-green-2)]">{cat.label}</span>
          <span className="ml-1.5 font-normal text-[var(--feg-green)]">
            ({cat.rows.length} jugador{cat.rows.length === 1 ? "" : "es"})
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-[var(--feg-green)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--feg-green-2)] shadow-sm transition hover:border-[var(--feg-green)]/45 hover:bg-[var(--feg-bg)]"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            Anterior
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center justify-center gap-1 rounded-full border border-[var(--feg-green)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--feg-green-2)] shadow-sm transition hover:border-[var(--feg-green)]/45 hover:bg-[var(--feg-bg)]"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </div>
      </div>

      <section
        aria-label={`Ranking ${cat.label}`}
        className="rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]"
      >
        <div className="border-b border-[var(--feg-green)]/10 bg-[var(--feg-green-soft)] px-4 py-4 text-white md:px-6">
          <h2 className="font-heading text-lg font-semibold uppercase tracking-tight md:text-xl">
            {cat.label}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--feg-green-soft)]/15 text-[var(--feg-green-2)]">
              <tr>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  Jugador
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  Club
                </th>
                <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                  Hcp
                </th>
              </tr>
            </thead>
            <tbody>
              {cat.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-[var(--feg-green)]"
                  >
                    Sin jugadores en esta categoría.
                  </td>
                </tr>
              ) : (
                cat.rows.map((r) => (
                  <tr
                    key={r.playerId}
                    className="border-t border-[var(--feg-green)]/10 transition hover:bg-[var(--feg-bg)]/80"
                  >
                    <td className="px-4 py-3 font-heading font-semibold text-[var(--feg-green-2)]">
                      {r.position}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/jugadores/${r.playerId}`}
                        className="font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
                      >
                        {r.firstName} {r.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--feg-green)]">{r.clubName}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums text-[var(--feg-ink)]">
                      {r.handicapLabel}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
