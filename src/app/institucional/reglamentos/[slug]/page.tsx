import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentoPageLayout } from "@/components/institucional/ReglamentoPageLayout";
import { getReglamentoBySlug } from "@/lib/reglamentos";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function InstitucionalReglamentoDetailPage({ params }: Props) {
  const { slug } = await params;
  const reglamento = getReglamentoBySlug(slug);
  if (!reglamento) notFound();

  const t = await getTranslations("regulationsHub");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />
        <ReglamentoPageLayout
          reglamento={reglamento}
          badge={t("badgeRegulations")}
          backHref="/institucional/reglamentos"
          backLabel={t("backAllRegulations")}
        />
      </main>
    </div>
  );
}
