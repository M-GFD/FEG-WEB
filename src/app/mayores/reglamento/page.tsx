import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentoPdfViewer } from "@/components/institucional/ReglamentoPdfViewer";
import { getReglamentoMayores } from "@/lib/reglamentos";

export default function MayoresReglamentoPage() {
  const reglamento = getReglamentoMayores();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />
        <ReglamentoPdfViewer
          reglamento={reglamento}
          badge="Mayores"
          backHref="/ranking?audiencia=mayores"
          backLabel="Volver a Mayores →"
        />
      </main>
    </div>
  );
}
