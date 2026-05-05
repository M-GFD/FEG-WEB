import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { labelForSearchType, searchSite } from "@/lib/site-search";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BuscarPage({ searchParams }: Props) {
  const { q: rawQ } = await searchParams;
  const { query, hits } = await searchSite(rawQ ?? "");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-8">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            Sitio
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            Búsqueda
          </h1>
          {query ? (
            <p className="mt-3 text-base font-medium text-[var(--feg-green)]">
              Resultados para «{query}»
            </p>
          ) : (
            <p className="mt-3 text-base font-medium text-[var(--feg-green)]">
              Escribí un término en la barra del encabezado y presioná Enter.
            </p>
          )}
        </header>

        {!query ? null : hits.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
            No encontramos resultados. Probá con otro texto o revisá la ortografía.
          </p>
        ) : (
          <ul className="space-y-3">
            {hits.map((h) => (
              <li key={`${h.type}-${h.href}-${h.title}`}>
                <Link
                  href={h.href}
                  className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_10px_30px_rgba(0,36,3,0.06)] transition hover:border-[var(--feg-green)]/25 hover:shadow-[0_14px_40px_rgba(0,36,3,0.1)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                    {labelForSearchType(h.type)}
                  </p>
                  <h2 className="mt-1.5 font-heading text-lg font-semibold leading-snug text-[var(--feg-ink)]">
                    {h.title}
                  </h2>
                  {h.description ? (
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-[var(--feg-green)]">
                      {h.description}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
