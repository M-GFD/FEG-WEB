import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getHandicapRankingsByCategory } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const year = new Date().getFullYear();
  const categories = await getHandicapRankingsByCategory();
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
          <>
            <nav
              aria-label="Ir a categoría"
              className="mb-10 flex flex-wrap gap-2 border-b border-[var(--feg-green)]/10 pb-4"
            >
              {categories.map((c) => (
                <a
                  key={c.groupKey}
                  href={`#rank-${c.slug}`}
                  className="rounded-full border border-[var(--feg-green)]/20 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--feg-green-2)] shadow-sm transition hover:border-[var(--feg-green)]/40 hover:bg-[var(--feg-bg)]"
                >
                  {c.label}
                  <span className="ml-1 font-normal text-[var(--feg-green)]">
                    ({c.rows.length})
                  </span>
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-14">
              {categories.map((cat) => (
                <section
                  key={cat.groupKey}
                  id={`rank-${cat.slug}`}
                  className="scroll-mt-28 rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]"
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
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
