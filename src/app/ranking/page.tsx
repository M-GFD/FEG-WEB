import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { RankingCategoryPager } from "@/components/ranking/RankingCategoryPager";
import { getHandicapRankingsByCategory } from "@/lib/data";
import {
  getInitialHandicapRankingCategoryIndex,
  sortHandicapRankingCategoryBlocks,
} from "@/lib/handicap-ranking";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const year = new Date().getFullYear();
  const rawCategories = await getHandicapRankingsByCategory();
  const categories = sortHandicapRankingCategoryBlocks(rawCategories);
  const initialCategoryIndex = getInitialHandicapRankingCategoryIndex(categories);
  const totalJugadores = categories.reduce((n, c) => n + c.rows.length, 0);

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-8">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Competencia
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
                Rankings {year}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--feg-green)]">
                Posiciones según handicap de jugadores matriculados, por categoría.
                <span className="font-medium text-[var(--feg-ink)]">
                  {" "}
                  Menor handicap = mejor posición.
                </span>{" "}
                Solo se listan jugadores con handicap mayor a 0.{" "}
                La tabla se actualiza cuando cambian los datos en la base de datos.
              </p>
              {totalJugadores > 0 ? (
                <p className="mt-2 text-xs text-[var(--feg-green-2)]/80">
                  {totalJugadores} jugador{totalJugadores === 1 ? "" : "es"} en{" "}
                  {categories.length} categoría{categories.length === 1 ? "" : "s"}.
                </p>
              ) : null}
            </div>
            <Link
              href="/institucional#reglamento"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              Reglamento juveniles/prejuveniles →
            </Link>
          </div>
        </header>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white px-6 py-12 text-center text-[var(--feg-green)] shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
            No hay jugadores con categoría o handicap cargados para armar los rankings.
          </div>
        ) : (
          <RankingCategoryPager
            categories={categories}
            initialIndex={initialCategoryIndex}
          />
        )}
      </main>
    </div>
  );
}
