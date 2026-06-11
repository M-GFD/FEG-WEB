import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentosHub } from "@/components/institucional/ReglamentosHub";
import { audienceQueryHref } from "@/lib/content-audience";
import { getReglamentosMenores } from "@/lib/reglamentos";
import Link from "next/link";

export default function MenoresReglamentosPage() {
  const reglamentos = getReglamentosMenores();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
              Menores
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-5xl">
              Reglamento Menores
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)] sm:text-lg">
              Normativas vigentes de la Federación Entrerriana de Golf para Prejuveniles, Juveniles y
              Junior en la temporada 2026.
            </p>
          </div>

          <Link
            href={audienceQueryHref("/ranking", "menores")}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
          >
            Volver a Menores →
          </Link>
        </header>

        <hr className="my-10 border-[var(--feg-green)]/10" />

        <ReglamentosHub reglamentos={reglamentos} detailBasePath="/menores/reglamento" />
      </main>
    </div>
  );
}
