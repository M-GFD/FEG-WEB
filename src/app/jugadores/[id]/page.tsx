import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getPlayerById } from "@/lib/data";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <div className="pt-4">
        <Header />
      </div>
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10 rounded-3xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)] sm:p-8">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-[var(--feg-bg)] px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)]">
            Jugador
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            {player.firstName} {player.lastName}
          </h1>
          <p className="mt-4 text-lg text-[var(--feg-green)]">
            {player.club.name} · HCP {player.handicap}
          </p>
        </header>

        <h2 className="mb-4 font-heading text-xl font-semibold uppercase tracking-tight">
          Últimos torneos
        </h2>
        <p className="rounded-2xl border border-[var(--feg-green)]/12 bg-white/80 px-6 py-8 text-[var(--feg-green)]">
          Sin resultados aún.
        </p>
      </main>
    </div>
  );
}
