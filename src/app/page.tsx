import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { getNews } from "@/lib/data";
import { formatNewsDateParts } from "@/lib/news-dates";
import { getGolfPlaceholder } from "@/lib/placeholders";
import { UpcomingTournamentsTabs } from "@/components/home/UpcomingTournamentsTabs";
import { HomeScrollHash } from "@/components/home/HomeScrollHash";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export default async function HomePage() {
  const news = await getNews();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <HomeScrollHash />
      {/* Hero: min-h asegura área visible; object-cover usa el menor zoom que cubre (recorte mínimo matemático) */}
      <div className="relative flex min-h-[100svh] flex-col">
        {/* Imagen solo hasta arriba de la franja de resultados (no detrás del bar rojo) */}
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="absolute inset-0 overflow-hidden bg-[var(--feg-bg)]">
            <Image
              src="/hero%20gif.gif"
              alt="Cancha de golf"
              fill
              priority
              className="object-cover object-[50%_38%] max-md:object-[40%_50%]"
              sizes="100vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-white/40" />
          </div>

          <Header />

          <div className="relative z-10 flex min-h-0 min-w-0 w-full flex-1 flex-col justify-between">
            <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pb-6 pt-12 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <RevealOnScroll
                  revealIndex={0}
                  yOffset={14}
                  className="flex w-full justify-center"
                >
                  <div className="inline-flex items-center justify-center rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-[#123c15] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                    Federación Entrerriana de Golf
                  </div>
                </RevealOnScroll>
                <RevealOnScroll revealIndex={1} yOffset={24} className="block w-full">
                  <h1 className="mt-6 font-heading font-semibold leading-[1.08] text-[#002403] max-md:px-0 max-md:tracking-tight sm:leading-[1.06] md:text-balance md:text-[52px] md:leading-[1.05]">
                    <span className="md:hidden">
                      <span className="block max-md:text-[clamp(1.56rem,7.3vw,2.46rem)] max-[380px]:text-[1.5rem]">
                        TODO EL GOLF DE ENTRE RÍOS,
                      </span>
                      <span className="block max-md:text-[clamp(1.56rem,7.3vw,2.46rem)] max-[380px]:text-[1.5rem]">
                        EN UN SOLO LUGAR.
                      </span>
                    </span>
                    <span className="hidden md:inline md:text-[52px]">
                      TODO EL GOLF DE ENTRE RÍOS,
                      <br />
                      EN UN SOLO LUGAR.
                    </span>
                  </h1>
                </RevealOnScroll>
                <RevealOnScroll revealIndex={2} yOffset={18} className="block w-full">
                  <p className="mx-auto mt-4 max-w-xl text-[0.95rem] font-medium leading-relaxed text-[#123c15] sm:text-base sm:leading-normal md:text-lg">
                    Una plataforma diseñada para jugadores, clubes y competencias de
                    toda la provincia.
                  </p>
                </RevealOnScroll>
              </div>
            </div>

            <div className="mx-auto w-full max-w-7xl shrink-0 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
              <RevealOnScroll
                revealIndex={3}
                yOffset={32}
                className="ml-auto w-full max-w-sm shrink-0"
              >
                <div className="w-full overflow-hidden rounded-2xl border border-white/35 bg-white/20 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,36,3,0.18)] ring-1 ring-white/25">
                  <div className="p-5">
                    <div className="inline-flex rounded-full bg-[#7c1b1b] px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm ring-1 ring-black/10">
                      Próximo torneo
                    </div>
                    <div className="mt-3 text-xl font-semibold leading-snug text-white [text-shadow:0_2px_12px_rgba(0,36,3,0.55),0_1px_3px_rgba(0,36,3,0.85)]">
                      Los Bretes — Colón
                    </div>
                    <div className="mt-1 text-xl font-bold text-[var(--feg-yellow)] [text-shadow:0_2px_10px_rgba(0,36,3,0.5),0_1px_2px_rgba(0,36,3,0.75)]">
                      9 de Mayo
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                        18H Mayores
                      </div>
                      <Link
                        href="/calendario"
                        className="ml-auto inline-flex items-center justify-center rounded-full bg-[#f3e12b] px-3 py-1.5 text-xs font-semibold text-[#146638] transition hover:brightness-95"
                      >
                        Calendario →
                      </Link>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-[#7b2b2b]">
          <RevealOnScroll revealIndex={4} yOffset={16} className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 text-white">
            <p className="min-w-0 flex-1 pr-2 font-heading text-xs font-semibold leading-snug sm:text-sm md:text-base lg:text-lg">
              RESULTADOS DISPONIBLES-VILLA ELISA - SENIOR CABALLEROS
            </p>
            <Link
              href="/ranking"
              className="shrink-0 rounded-full bg-[#f3e12b] px-5 py-2 text-sm font-semibold text-[#146638] hover:brightness-95"
            >
              Ranking →
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
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <RevealOnScroll revealIndex={0} yOffset={22}>
                <h2 className="font-heading text-[28px] font-semibold leading-[1.1] text-[var(--feg-ink)] sm:text-[36px]">
                  CONOCÉ LA ACTUALIDAD
                  <br />
                  DEL CIRCUITO
                </h2>
              </RevealOnScroll>
            </div>
            <div className="lg:col-span-5 lg:pt-4">
              <RevealOnScroll revealIndex={2} yOffset={20}>
                <p className="text-right text-base font-medium text-[var(--feg-green)] sm:text-lg">
                  Resultados, momentos y protagonistas
                  <br />
                  que definen la competencia
                </p>
              </RevealOnScroll>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {news.length === 0 ? (
              <RevealOnScroll revealIndex={1} className="col-span-full">
                <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-8 text-center text-[var(--feg-green)]">
                  Aún no hay noticias publicadas.
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
                  className="group relative block overflow-hidden rounded-[18px] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5"
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
                  <div className="p-4">
                    <time
                      dateTime={cardWhen.dateTime}
                      className="text-[11px] font-semibold uppercase tracking-wide text-[var(--feg-green-2)]/80"
                    >
                      {cardWhen.label}
                    </time>
                    <h3 className="mt-2 font-heading text-lg font-semibold leading-snug text-[var(--feg-ink)] line-clamp-2">
                      {n.title}
                    </h3>
                    {n.excerpt && (
                      <p className="mt-2 text-[13px] font-medium leading-relaxed text-[var(--feg-green)] line-clamp-2">
                        {n.excerpt}
                      </p>
                    )}
                    <div className="mt-3 flex justify-end">
                      <span className="inline-flex h-7 w-9 items-center justify-center rounded-full bg-[var(--feg-green)] text-sm text-white">
                        →
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
                Ver todas las noticias →
              </Link>
            </RevealOnScroll>
          )}
        </div>
      </section>

      {/* Próximos torneos */}
      <UpcomingTournamentsTabs />
    </div>
  );
}
