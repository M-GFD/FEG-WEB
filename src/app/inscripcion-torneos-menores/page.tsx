import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getActiveYouthTournamentConfig } from "@/lib/inscripcion-torneos-menores/config";
import { formatFechaTitle } from "@/lib/calendario-feg";
import Link from "next/link";
import { InscripcionTorneoMenoresForm } from "./InscripcionTorneoMenoresForm";

export const metadata = {
  title: "Inscripción torneos menores | FEG",
  description: "Inscripción a torneos federativos para jugadores menores y juveniles.",
};

export default async function InscripcionTorneosMenoresPage() {
  const config = await getActiveYouthTournamentConfig();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6">
          <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Torneos menores
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-4xl">
            Inscripción a torneos
          </h1>
        </header>

        {!config ? (
          <p className="mt-8 rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-8 text-center text-[var(--feg-green)]">
            No hay torneo con inscripciones abiertas en este momento.
          </p>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border-2 border-[var(--feg-yellow)]/50 bg-[var(--feg-yellow)]/12 p-5">
              <p className="font-heading text-lg font-semibold uppercase text-[var(--feg-ink)]">
                {config.title}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--feg-green)]">
                {formatFechaTitle(config.dateLabel)}
                {config.extraLine ? ` · ${config.extraLine}` : ""}
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--feg-ink)]">
                Sede: {config.venue}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
              <strong>Importante:</strong> el jugador debe estar{" "}
              <strong>empadronado</strong>. Las inscripciones las cargan profesores y/o
              responsables de clubes asociados. Si el DNI no aparece en el padrón, primero
              completá el{" "}
              <Link
                href="/empadronamiento-menores"
                className="font-semibold text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                empadronamiento anual FEG
              </Link>
              .
            </div>

            <div className="mt-8">
              <InscripcionTorneoMenoresForm config={config} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
