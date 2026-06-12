import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { getNews } from "@/lib/data";
import { formatNewsDateParts } from "@/lib/news-dates";
import { getGolfPlaceholder } from "@/lib/placeholders";
import { UpcomingTournamentsTabs } from "@/components/home/UpcomingTournamentsTabs";
import { HomeScrollHash } from "@/components/home/HomeScrollHash";
import { HeroNextTournamentCard } from "@/components/home/HeroNextTournamentCard";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getLocale, getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");
  const locale = (await getLocale()) as AppLocale;
  const news = await getNews({ locale });

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <HomeScrollHash />
      {/* Hero: min-h asegura área visible; object-cover usa el menor zoom que cubre (recorte mínimo matemático) */}
      <div className="relative flex min-h-[100svh] flex-col" data-header-theme="dark">
        {/* Imagen solo hasta arriba de la franja inferior del hero (no detrás del banner) */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="absolute inset-0 overflow-hidden bg-[var(--feg-bg)]">
            <Image
              src="/hero%20gif.gif"
              alt={t("heroAlt")}
              fill
              priority
              className="object-cover object-[50%_38%] max-md:object-[40%_50%]"
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>

          <Header />

          <div className="relative z-10 flex min-h-0 min-w-0 w-full flex-1 flex-col justify-between">
            <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pb-6 pt-12 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <RevealOnScroll revealIndex={1} yOffset={24} className="block w-full">
                  <h1 className="font-heading font-semibold leading-[1.08] text-center text-[#FFFFFF] [text-shadow:0_2px_14px_rgba(0,0,0,0.45),0_1px_4px_rgba(0,0,0,0.55)] max-md:px-0 max-md:tracking-tight sm:leading-[1.06] md:text-balance md:text-[56px] md:leading-[1.05]">
                    <span className="inline-flex flex-col items-center uppercase md:hidden">
                      <span className="block whitespace-nowrap text-center text-[clamp(calc(1.81rem+4pt),calc(8vw+4pt),calc(2.71rem+4pt))] max-[380px]:text-[calc(1.75rem+4pt)]">
                        {t("heroLine1")}
                      </span>
                      <span className="block whitespace-nowrap text-center text-[clamp(calc(1.81rem+4pt),calc(8vw+4pt),calc(2.71rem+4pt))] max-[380px]:text-[calc(1.75rem+4pt)]">
                        {t("heroLine2")}
                      </span>
                      <span className="block whitespace-nowrap text-center text-[clamp(calc(1.81rem+4pt),calc(8vw+4pt),calc(2.71rem+4pt))] max-[380px]:text-[calc(1.75rem+4pt)]">
                        {t("heroLine3")}
                      </span>
                    </span>
                    <span className="hidden md:inline md:text-[56px]">
                      {t("heroTitleDesktop")}
                      <br />
                      {t("heroTitleDesktop2")}
                    </span>
                  </h1>
                </RevealOnScroll>
                <RevealOnScroll revealIndex={2} yOffset={18} className="block w-full">
                  <p className="mx-auto mt-4 max-w-xl text-[0.95rem] font-medium leading-relaxed text-[#FFFFFF] [text-shadow:0_1px_10px_rgba(0,0,0,0.42)] sm:text-base sm:leading-normal md:text-lg">
                    {t("heroSubtitle")}
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
              <HeroNextTournamentCard />
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-[var(--feg-green)]" data-header-theme="dark">
          <RevealOnScroll revealIndex={3} yOffset={16} className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 text-white">
              <p className="min-w-0 font-heading text-xs font-semibold leading-snug sm:text-sm md:text-base lg:text-lg">
                {t("enrollmentBannerText")}
              </p>
              <Link
                href="/empadronamiento-menores"
                className="rounded-full bg-[#f3e12b] px-3 py-1.5 text-xs font-semibold text-[#146638] transition hover:brightness-95"
              >
                {tNav("enrollment")}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </div>

      {/* Noticias */}
      <section
        id="noticias"
        className="scroll-mt-28 bg-[var(--feg-bg)] lg:scroll-mt-24"
      >
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <RevealOnScroll revealIndex={0} yOffset={22} className="w-full text-center">
              <h2 className="w-full text-center font-heading text-[28px] font-semibold leading-[1.1] text-[var(--feg-ink)] sm:text-[36px]">
                <span className="block md:hidden">{t("newsTitleMobile1")}</span>
                <span className="block md:hidden">{t("newsTitleMobile2")}</span>
                <span className="hidden md:inline">{t("newsTitleDesktop")}</span>
              </h2>
            </RevealOnScroll>
            <RevealOnScroll revealIndex={2} yOffset={20} className="mt-4 w-full text-center">
              <p className="mx-auto w-full max-w-xl text-center text-base font-medium text-[var(--feg-green)] sm:text-lg">
                <span className="block md:hidden">{t("newsSubtitleMobile1")}</span>
                <span className="block md:hidden">{t("newsSubtitleMobile2")}</span>
                <span className="hidden md:inline">{t("newsSubtitleDesktop")}</span>
              </p>
            </RevealOnScroll>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {news.length === 0 ? (
              <RevealOnScroll revealIndex={1} className="col-span-full">
                <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-8 text-center text-[var(--feg-green)]">
                  {t("newsEmpty")}
                </p>
              </RevealOnScroll>
            ) : (
              news.slice(0, 6).map((n, i) => {
                const cardWhen = formatNewsDateParts(n.publishedAt, n.createdAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                <RevealOnScroll
                  key={n.id}
                  revealIndex={i}
                  yOffset={18 + (i % 3) * 6}
                  className="min-w-0"
                >
                <Link
                  href={`/noticias/${n.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5"
                >
                  <div className="relative h-[200px]">
                    <Image
                      src={n.imageUrl || getGolfPlaceholder(i, "regular")}
                      alt={n.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <time
                      dateTime={cardWhen.dateTime}
                      className="text-[11px] font-semibold uppercase tracking-wide text-[var(--feg-green-2)]/80"
                    >
                      {cardWhen.label}
                    </time>
                    <h3 className="mt-2 font-heading text-lg font-semibold leading-snug text-[var(--feg-ink)] line-clamp-2">
                      {n.title}
                    </h3>
                    <p className="mt-2 min-h-[2.6rem] text-[13px] font-medium leading-relaxed text-[var(--feg-green)] line-clamp-2">
                      {n.excerpt || ""}
                    </p>
                    <div className="mt-auto flex justify-end pt-4">
                      <span className="inline-flex items-center justify-center rounded-full bg-[var(--feg-green)] px-3 py-1.5 text-xs font-semibold text-white transition group-hover:brightness-110">
                        {tCommon("readMore")}
                      </span>
                    </div>
                  </div>
                </Link>
                </RevealOnScroll>
                );
              })
            )}
          </div>

          {news.length > 0 && (
            <RevealOnScroll revealIndex={5} yOffset={14} className="mt-8 flex justify-center">
              <Link
                href="/noticias"
                className="rounded-full bg-[var(--feg-ink)] px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.15)] transition hover:brightness-110"
              >
                {t("newsViewAll")}
              </Link>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* Próximos torneos */}
      <UpcomingTournamentsTabs />

      {/* Institucional (resumen) */}
      <section
        id="institucional"
        data-header-theme="dark"
        className="relative scroll-mt-28 lg:scroll-mt-24"
      >
        <div className="absolute inset-0 overflow-hidden bg-[var(--feg-bg)]">
          <Image
            src="/institucional%20gif.gif"
            alt={t("institutionalAlt")}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="relative rounded-3xl bg-white/14 p-8 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,36,3,0.18)] lg:p-10">
            <RevealOnScroll revealIndex={0} yOffset={18} className="block">
              <div className="flex flex-col gap-8 lg:min-h-[360px]">
                {/* Arriba a la izquierda */}
                <div className="max-w-2xl">
                  <h2 className="font-heading text-[28px] font-semibold leading-[1.1] text-white sm:text-[36px] [text-shadow:0_2px_12px_rgba(0,36,3,0.55),0_1px_3px_rgba(0,36,3,0.85)]">
                    {t("institutionalTitle")}
                  </h2>
                  <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/85 sm:text-lg [text-shadow:0_2px_12px_rgba(0,36,3,0.42),0_1px_3px_rgba(0,36,3,0.7)]">
                    {t("institutionalSubtitle")}
                  </p>
                </div>

                {/* Centro: 3 bloques distribuidos a lo ancho */}
                <div className="flex flex-1 items-center">
                  <div className="grid w-full gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/15 bg-[#0b2b12] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 [text-shadow:0_2px_10px_rgba(0,36,3,0.35)]">
                        {t("objectivesLabel")}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white [text-shadow:0_2px_10px_rgba(0,36,3,0.35)]">
                        {t("objectivesTitle")}
                      </div>
                      <div className="mt-1 text-[13px] leading-relaxed text-white/80 [text-shadow:0_2px_10px_rgba(0,36,3,0.3)]">
                        {t("objectivesBody")}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-[#0b2b12] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 [text-shadow:0_2px_10px_rgba(0,36,3,0.35)]">
                        {t("regionalLabel")}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white [text-shadow:0_2px_10px_rgba(0,36,3,0.35)]">
                        {t("regionalTitle")}
                      </div>
                      <div className="mt-1 text-[13px] leading-relaxed text-white/80 [text-shadow:0_2px_10px_rgba(0,36,3,0.3)]">
                        {t("regionalBody")}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/15 bg-[#0b2b12] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 [text-shadow:0_2px_10px_rgba(0,36,3,0.35)]">
                        {t("visionLabel")}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white [text-shadow:0_2px_10px_rgba(0,36,3,0.35)]">
                        {t("visionTitle")}
                      </div>
                      <div className="mt-1 text-[13px] leading-relaxed text-white/80 [text-shadow:0_2px_10px_rgba(0,36,3,0.3)]">
                        {t("visionBody")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón: mantener ubicación (abajo a la derecha) */}
                <div className="flex">
                  <Link
                    href="/institucional"
                    className="ml-auto inline-flex items-center justify-center rounded-full bg-[var(--feg-yellow)] px-7 py-3 text-sm font-semibold text-[var(--feg-green-2)] transition hover:brightness-95"
                  >
                    {tCommon("viewMore")}
                  </Link>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
}
