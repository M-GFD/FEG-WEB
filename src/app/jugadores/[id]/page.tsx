import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getPlayerById } from "@/lib/data";

function fmtHandicap(handicap: number, handicapIndex: number | null | undefined) {
  if (typeof handicapIndex === "number") {
    return Number.isInteger(handicapIndex) ? `${handicapIndex}` : handicapIndex.toFixed(1);
  }
  return `${handicap}`;
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  const hcp = fmtHandicap(player.handicap, player.handicapIndex);
  const t = await getTranslations("player");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10 rounded-3xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)] sm:p-8">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-[var(--feg-bg)] px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)]">
            {t("badge")}
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
                {player.firstName} {player.lastName}
              </h1>
              <p className="mt-3 text-lg text-[var(--feg-green)]">
                {player.club.name}
                {player.category ? ` · ${player.category}` : ""}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--feg-green-soft)]/10 px-6 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]/80">
                {tCommon("handicap")}
              </p>
              <p className="mt-1 font-heading text-3xl font-semibold text-[var(--feg-ink)]">{hcp}</p>
            </div>
          </div>
        </header>

        <h2 className="mb-4 font-heading text-xl font-semibold uppercase tracking-tight">
          {t("recentTournaments")}
        </h2>
        <p className="rounded-2xl border border-[var(--feg-green)]/12 bg-white/80 px-6 py-8 text-[var(--feg-green)]">
          {t("noResults")}
        </p>
      </main>
    </div>
  );
}
