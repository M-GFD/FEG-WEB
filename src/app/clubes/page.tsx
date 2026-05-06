import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getClubsWithCounts } from "@/lib/data";

export default async function ClubesPage() {
  const clubs = await getClubsWithCounts();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Red federativa
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            Clubes
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)] sm:text-lg">
            Clubes afiliados a la Federación Entrerriana de Golf.
          </p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.length === 0 ? (
            <p className="col-span-full rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
              No hay clubes cargados.
            </p>
          ) : (
            clubs.map((club) => (
              <Link
                key={club.id}
                href={`/clubes/${club.slug}`}
                className="flex flex-col rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)] transition hover:border-[var(--feg-green)]/30 hover:shadow-[0_18px_48px_rgba(0,36,3,0.12)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-xl font-semibold uppercase leading-tight tracking-tight text-[var(--feg-ink)]">
                    {club.name}
                  </h2>
                  {club.code && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--feg-bg)] px-3 py-1 font-heading text-xs font-semibold uppercase tracking-wider text-[var(--feg-green-2)]">
                      {club.code}
                    </span>
                  )}
                </div>

                {club.address && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--feg-green)]">
                    {club.address}
                  </p>
                )}
                {club.phone && (
                  <p className="mt-2 text-sm font-medium text-[var(--feg-green-2)]">
                    {club.phone}
                  </p>
                )}

                <p className="mt-auto pt-4 text-xs font-semibold uppercase tracking-wide text-[var(--feg-green)]/70">
                  {club.playersCount > 0
                    ? `${club.playersCount} jugadores matriculados · Ver padrón →`
                    : "Padrón pendiente de carga"}
                </p>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
