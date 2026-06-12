import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentoPdfViewer } from "@/components/institucional/ReglamentoPdfViewer";
import { audienceQueryHref } from "@/lib/content-audience";
import { getReglamentoMayores } from "@/lib/reglamentos";

export default async function MayoresReglamentoPage() {
  const reglamento = getReglamentoMayores();
  const t = await getTranslations("majorsRegulations");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <BackToHome />
        <ReglamentoPdfViewer
          reglamento={reglamento}
          badge={t("badge")}
          backHref={audienceQueryHref("/ranking", "mayores")}
          backLabel={t("backToMayores")}
        />
      </main>
    </div>
  );
}
