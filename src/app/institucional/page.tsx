import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import Link from "next/link";

export default async function InstitucionalPage() {
  const t = await getTranslations("institutional");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
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
              {t("intro")}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href="/institucional/directorio"
              className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              {t("directoryLink")}
            </Link>
            <Link
              href="/institucional/reglamentos"
              className="inline-flex items-center justify-center rounded-full bg-[var(--feg-ink)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.12)] transition hover:brightness-110"
            >
              {t("regulationsLink")}
            </Link>
          </div>
        </header>

        <hr className="my-10 border-[var(--feg-green)]/10" />

        <div className="space-y-10">
          <section className="grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              {t("objectivesLabel")}
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                {t("objectivesTitle")}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--feg-green)]">
                <p>{t("objectivesP1")}</p>
                <p>{t("objectivesP2")}</p>
              </div>

              <div className="mt-6 grid overflow-hidden rounded-xl border border-[var(--feg-green)]/15 bg-white shadow-[0_20px_60px_rgba(0,36,3,0.08)] sm:grid-cols-3">
                <div className="border-b border-[var(--feg-green)]/10 p-5 sm:border-b-0 sm:border-r">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    {t("pillar01")}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--feg-ink)]">{t("pillar01Title")}</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-[var(--feg-green)]/85">
                    {t("pillar01Body")}
                  </div>
                </div>
                <div className="border-b border-[var(--feg-green)]/10 p-5 sm:border-b-0 sm:border-r">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    {t("pillar02")}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--feg-ink)]">{t("pillar02Title")}</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-[var(--feg-green)]/85">
                    {t("pillar02Body")}
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    {t("pillar03")}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--feg-ink)]">{t("pillar03Title")}</div>
                  <div className="mt-1 text-[13px] leading-relaxed text-[var(--feg-green)]/85">
                    {t("pillar03Body")}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              {t("regionalLabel")}
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                {t("regionalTitle")}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--feg-green)]">
                <p>{t("regionalP1")}</p>
                <p>{t("regionalP2")}</p>
              </div>

              <div className="mt-6 flex flex-col gap-4 border-t border-[var(--feg-green)]/10 pt-6 sm:flex-row sm:gap-8">
                <div>
                  <div className="font-heading text-3xl font-semibold leading-none text-[var(--feg-green-2)]">8+</div>
                  <div className="mt-1 text-xs font-medium text-[var(--feg-green)]/70">{t("statClubs")}</div>
                </div>
                <div>
                  <div className="font-heading text-3xl font-semibold leading-none text-[var(--feg-green-2)]">12</div>
                  <div className="mt-1 text-xs font-medium text-[var(--feg-green)]/70">{t("statTournaments")}</div>
                </div>
                <div>
                  <div className="font-heading text-3xl font-semibold leading-none text-[var(--feg-green-2)]">300+</div>
                  <div className="mt-1 text-xs font-medium text-[var(--feg-green)]/70">{t("statPlayers")}</div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 border-t border-[var(--feg-green)]/10 pt-10 md:grid-cols-[200px_1fr] md:gap-10">
            <div className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green)]/55">
              {t("visionLabel")}
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-[var(--feg-ink)]">
                {t("visionTitle")}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--feg-green)]">
                <p>{t("visionP1")}</p>
                <p>{t("visionP2")}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
