import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentoSection } from "@/components/institucional/ReglamentoSection";
import Link from "next/link";

export default function ReglamentoPage() {
  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
              Federación
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-5xl">
              Reglamento
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)] sm:text-lg">
              Ranking Argentino de Juveniles y Prejuveniles 2026 — normativa, cupos e inscripciones.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href="/institucional"
              className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              Nosotros →
            </Link>
            <Link
              href="/institucional/reglamento/videos"
              className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              Videos explicativos →
            </Link>
          </div>
        </header>

        <hr className="my-10 border-[var(--feg-green)]/10" />

        <ReglamentoSection />
      </main>
    </div>
  );
}
