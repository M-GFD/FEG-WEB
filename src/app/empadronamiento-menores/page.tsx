import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { EMPADRONAMIENTO_SEASON_YEAR } from "@/lib/empadronamiento-menores/constants";
import { EmpadronamientoMenoresForm } from "./EmpadronamientoMenoresForm";

export async function generateMetadata() {
  const tMeta = await getTranslations("meta");
  return {
    title: tMeta("enrollmentTitle"),
    description: tMeta("enrollmentDescription", { year: EMPADRONAMIENTO_SEASON_YEAR }),
  };
}

export default async function EmpadronamientoMenoresPage() {
  const t = await getTranslations("enrollment");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6">
          <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            {t("badge")}
          </p>
          <h1 className="mt-4 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-4xl">
            {t("title", { year: EMPADRONAMIENTO_SEASON_YEAR })}
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-[var(--feg-green)]">
            {t("intro", { year: EMPADRONAMIENTO_SEASON_YEAR })}
          </p>
        </header>

        <div className="mt-10">
          <EmpadronamientoMenoresForm />
        </div>
      </main>
    </div>
  );
}
