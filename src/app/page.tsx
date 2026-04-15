import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { getNews } from "@/lib/data";
import { getGolfPlaceholder } from "@/lib/placeholders";
import { UpcomingTournamentsTabs } from "@/components/home/UpcomingTournamentsTabs";

export default async function HomePage() {
  const news = await getNews();

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0">
          <Image
            src="https://www.figma.com/api/mcp/asset/eaa42ca8-27d4-45cf-bef7-843269aa2359"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/40" />
        </div>

        <div className="relative pt-4">
          <Header />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-12 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-[#123c15] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              Federación Entrerriana de Golf
            </div>
            <h1 className="mt-6 font-heading text-[32px] font-semibold leading-[1.05] text-[#002403] sm:text-[44px] md:text-[52px]">
              TODO EL GOLF DE ENTRE RÍOS,
              <br />
              EN UN SOLO LUGAR.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base font-medium text-[#123c15] sm:text-lg">
              Una plataforma diseñada para jugadores, clubes y competencias de
              toda la provincia.
            </p>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-12 lg:px-8">
          <div className="ml-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white/45 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="p-5">
              <div className="inline-flex rounded-full bg-[#7c1b1b] px-3 py-1.5 text-[10px] font-semibold text-white">
                Próximo torneo
              </div>
              <div className="mt-3 text-xl font-semibold text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                Los Bretes — Colón
              </div>
              <div className="mt-1 text-xl font-bold text-[#f3e12b]">
                9 de Mayo
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-semibold text-white">
                  18H Mayores
                </div>
                <Link
                  href="/calendario"
                  className="ml-auto inline-flex items-center justify-center rounded-full bg-[#e7f4e7] px-3 py-1.5 text-xs font-semibold text-[#146638] hover:brightness-95"
                >
                  Calendario →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-[#7b2b2b]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 text-white lg:px-8">
            <p className="font-heading text-sm font-semibold sm:text-lg">
              RESULTADOS DISPONIBLES
            </p>
            <Link
              href="/ranking"
              className="shrink-0 rounded-full bg-[#f3e12b] px-5 py-2 text-sm font-semibold text-[#146638] hover:brightness-95"
            >
              Ranking →
            </Link>
          </div>
        </div>
      </div>

      {/* Noticias */}
      <section id="noticias" className="bg-[var(--feg-bg)]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <h2 className="font-heading text-[28px] font-semibold leading-[1.1] text-[var(--feg-ink)] sm:text-[36px]">
                CONOCÉ LA ACTUALIDAD
                <br />
                DEL CIRCUITO
              </h2>
            </div>
            <div className="lg:col-span-5 lg:pt-4">
              <p className="text-right text-base font-medium text-[var(--feg-green)] sm:text-lg">
                Resultados, momentos y protagonistas
                <br />
                que definen la competencia
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {news.length === 0 ? (
              <p className="col-span-full rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-8 text-center text-[var(--feg-green)]">
                Aún no hay noticias publicadas.
              </p>
            ) : (
              news.slice(0, 6).map((n, i) => (
                <Link
                  key={n.id}
                  href={`/noticias/${n.slug}`}
                  className="group relative overflow-hidden rounded-[18px] bg-white shadow-[0_14px_40px_rgba(0,0,0,0.1)] transition hover:-translate-y-0.5"
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
                      dateTime={new Date(
                        n.publishedAt || n.createdAt
                      ).toISOString()}
                      className="text-[11px] font-semibold uppercase tracking-wide text-[var(--feg-green-2)]/80"
                    >
                      {new Date(
                        n.publishedAt || n.createdAt
                      ).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
              ))
            )}
          </div>

          {news.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Link
                href="/noticias"
                className="rounded-full bg-[var(--feg-ink)] px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.15)] transition hover:brightness-110"
              >
                Ver todas las noticias →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Próximos torneos */}
      <UpcomingTournamentsTabs />
    </div>
  );
}
