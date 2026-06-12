import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { ReglamentoVideoList } from "@/components/institucional/ReglamentoVideoList";
import { getReglamentoVideos } from "@/lib/data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReglamentoVideosPage() {
  const videos = await getReglamentoVideos();
  const t = await getTranslations("regulationVideos");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-14 lg:px-8">
        <BackToHome />

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[var(--feg-green)]/20 bg-white/80 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
              {t("badge")}
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[var(--feg-green)] sm:text-lg">
              {t("subtitle")}
            </p>
          </div>

          <Link
            href="/institucional/reglamento"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
          >
            {t("backToRules")}
          </Link>
        </header>

        <hr className="my-10 border-[var(--feg-green)]/10" />

        <ReglamentoVideoList videos={videos} />
      </main>
    </div>
  );
}
