import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { RankingCategoryPager } from "@/components/ranking/RankingCategoryPager";
import { getHandicapRankingsByCategory } from "@/lib/data";
import {
  AUDIENCE_SEGMENT_LABELS,
  parseAudienceSegment,
} from "@/lib/content-audience";
import { getInitialHandicapRankingCategoryIndex } from "@/lib/handicap-ranking";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ audiencia?: string | string[] }>;
};

export default async function RankingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const segment = parseAudienceSegment(sp.audiencia) ?? "mayores";
  const year = new Date().getFullYear();
  const categories = await getHandicapRankingsByCategory({ audience: segment });
  const initialCategoryIndex =
    segment === "menores"
      ? Math.max(
          0,
          categories.findIndex((c) => c.groupKey === "juveniles")
        )
      : getInitialHandicapRankingCategoryIndex(categories);
  const totalJugadores = categories.reduce((n, c) => n + c.rows.length, 0);
  const segmentLabel = AUDIENCE_SEGMENT_LABELS[segment];

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-8">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Competencia · {segmentLabel}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
                Rankings {year}
              </h1>
              {totalJugadores > 0 ? (
                <p className="mt-2 text-xs text-[var(--feg-green-2)]/80">
                  {totalJugadores} jugador{totalJugadores === 1 ? "" : "es"} en{" "}
                  {categories.length} categoría{categories.length === 1 ? "" : "s"}.
                </p>
              ) : null}
            </div>
            {segment === "menores" ? (
              <Link
                href="/institucional/reglamento"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
              >
                Reglamento juveniles/prejuveniles →
              </Link>
            ) : null}
          </div>
        </header>

        {categories.length === 0 ? (
          <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white px-6 py-12 text-center text-[var(--feg-green)] shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
            No hay jugadores con categoría o handicap cargados para armar los rankings de{" "}
            {segmentLabel.toLowerCase()}.
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
