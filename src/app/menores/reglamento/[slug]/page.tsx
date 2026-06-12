import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentoPdfViewer } from "@/components/institucional/ReglamentoPdfViewer";
import { getReglamentoBySlug } from "@/lib/reglamentos";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function MenoresReglamentoPage({ params }: Props) {
  const { slug } = await params;
  const reglamento = getReglamentoBySlug(slug);
  if (!reglamento?.menores) notFound();

  const t = await getTranslations("minorsRegulations");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />
        <ReglamentoPdfViewer
          reglamento={reglamento}
          badge={t("badgeDetail")}
          backHref="/menores/reglamento"
          backLabel={t("backToHub")}
        />
      </main>
    </div>
  );
}
