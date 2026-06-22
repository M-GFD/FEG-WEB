import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import {
  getPublicTournamentsHistoric,
  getTournamentApprovedPhotoStats,
} from "@/lib/data";
import { TorneosHistoricoClient } from "@/components/torneos/TorneosHistoricoClient";
import { MenoresProximoTorneoCard } from "@/components/torneos/MenoresProximoTorneoCard";
import { parseAudienceSegment } from "@/lib/content-audience";
import { getActiveYouthTournamentConfig } from "@/lib/inscripcion-torneos-menores/config";

type Props = {
  searchParams: Promise<{ audiencia?: string | string[] }>;
};

export default async function TorneosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const segment = parseAudienceSegment(sp.audiencia) ?? "mayores";

  const t = await getTranslations("tournamentsHistoric");
  const tAudience = await getTranslations("audience");
  const segmentLabel = tAudience(segment);

  const [tournaments, photoStats, signupConfig] = await Promise.all([
    getPublicTournamentsHistoric(400, segment),
    getTournamentApprovedPhotoStats(),
    segment === "menores" ? getActiveYouthTournamentConfig() : Promise.resolve(null),
  ]);

  const rows = tournaments.map((t) => {
    const st = photoStats[t.id];
    return {
      id: t.id,
      name: t.name,
      slug: t.slug,
      date: String(t.date),
      status: t.status,
      club: t.club,
      galleryCount: st?.count ?? 0,
      galleryThumb: st?.thumbUrl ?? null,
    };
  });

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-10">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            {t("badge", { segment: segmentLabel })}
          </p>
          {segment === "menores" ? (
            <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
              {t("titleMinors")}
            </h1>
          ) : (
            <>
              <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
                {t("titleMayores", { segment: segmentLabel })}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--feg-green)]">
                {t("subtitleMayores")}
              </p>
            </>
          )}
        </header>

        {segment === "menores" && signupConfig ? (
          <MenoresProximoTorneoCard config={signupConfig} />
        ) : null}

        {tournaments.length > 0 && segment === "menores" && signupConfig ? (
          <h2 className="mb-6 font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
            {t("historicHeading")}
          </h2>
        ) : null}

        {tournaments.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
            {t("empty", { segment: segmentLabel.toLowerCase() })}
          </p>
        ) : (
          <TorneosHistoricoClient tournaments={rows} />
        )}
      </main>
    </div>
  );
}
