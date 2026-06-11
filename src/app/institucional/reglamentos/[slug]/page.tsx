import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentoPdfViewer } from "@/components/institucional/ReglamentoPdfViewer";
import { getReglamentoBySlug } from "@/lib/reglamentos";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function InstitucionalReglamentoDetailPage({ params }: Props) {
  const { slug } = await params;
  const reglamento = getReglamentoBySlug(slug);
  if (!reglamento) notFound();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />
        <ReglamentoPdfViewer
          reglamento={reglamento}
          badge="Reglamentos"
          backHref="/institucional/reglamentos"
          backLabel="Todos los reglamentos →"
        />
      </main>
    </div>
  );
}
