import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import {
  getPublicTournamentsHistoric,
  getTournamentApprovedPhotoStats,
} from "@/lib/data";
import { TorneosHistoricoClient } from "@/components/torneos/TorneosHistoricoClient";
import {
  AUDIENCE_SEGMENT_LABELS,
  parseAudienceSegment,
} from "@/lib/content-audience";

type Props = {
  searchParams: Promise<{ audiencia?: string | string[] }>;
};

export default async function TorneosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const segment = parseAudienceSegment(sp.audiencia) ?? "mayores";
  const segmentLabel = AUDIENCE_SEGMENT_LABELS[segment];

  const [tournaments, photoStats] = await Promise.all([
    getPublicTournamentsHistoric(400, segment),
    getTournamentApprovedPhotoStats(),
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
            Federación · {segmentLabel}
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            Histórico de torneos · {segmentLabel}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--feg-green)]">
            Calendario de fechas: podés ordenar por antigüedad y filtrar por año. En cada
            tarjeta verás una vista de la galería si el club organizador subió fotos y
            prensa las aprobó. Los resultados publicados están en la ficha del torneo.
          </p>
        </header>

        {tournaments.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
            No hay torneos cargados para {segmentLabel.toLowerCase()} aún.
          </p>
        ) : (
          <TorneosHistoricoClient tournaments={rows} />
        )}
      </main>
    </div>
  );
}
