import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getClubs } from "@/lib/data";

export default async function ClubesPage() {
  const clubs = await getClubs();

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
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.length === 0 ? (
            <p className="col-span-full rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
              No hay clubes cargados.
            </p>
          ) : (
            clubs.map((club) => (
              <div
                key={club.id}
                className="rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)]"
              >
                <h2 className="font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
                  {club.name}
                </h2>
                {club.address && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--feg-green)]">{club.address}</p>
                )}
                {club.phone && (
                  <p className="mt-2 text-sm font-medium text-[var(--feg-green-2)]">{club.phone}</p>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
