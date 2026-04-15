import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";

export default function InstitucionalPage() {
  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <div className="pt-4">
        <Header />
      </div>
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <BackToHome />
        <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
          Federación
        </p>
        <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
          Institucional
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--feg-green)]">
          Contenido institucional en construcción.
        </p>
      </main>
    </div>
  );
}

