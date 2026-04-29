import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getRankingEntries } from "@/lib/data";

export default async function RankingPage() {
  const year = new Date().getFullYear();
  const rankings = await getRankingEntries(year);

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Competencia
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
              Ranking {year}
            </h1>
            <Link
              href="/institucional#reglamento"
              className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              Reglamento juveniles/prejuveniles →
            </Link>
          </div>
        </header>
        <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--feg-green-soft)] text-white">
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
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-[var(--feg-green)]"
                  >
                    No hay datos de ranking para este año.
                  </td>
                </tr>
              ) : (
                rankings.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--feg-green)]/10 transition hover:bg-[var(--feg-bg)]/80"
                  >
                    <td className="px-4 py-3 font-heading font-semibold text-[var(--feg-green-2)]">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/jugadores/${r.player.id}`}
                        className="font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
                      >
                        {r.player.firstName} {r.player.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--feg-green)]">{r.player.club.name}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--feg-ink)]">{r.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
