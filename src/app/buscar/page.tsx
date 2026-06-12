import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { PublicPlayerCard } from "@/components/players/PublicPlayerCard";
import {
  getSearchLabels,
  searchSite,
  type SearchLabels,
  type SiteSearchHit,
} from "@/lib/site-search";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

function PlayerCard({ hit }: { hit: SiteSearchHit }) {
  const handicap = hit.meta?.handicap ?? null;
  const handicapStr =
    handicap == null ? "-" : Number.isInteger(handicap) ? `${handicap}` : handicap.toFixed(1);
  const club = hit.meta?.club ?? null;
  const category = hit.meta?.category ?? null;

  return (
    <PublicPlayerCard
      href={hit.href}
      title={hit.title}
      clubName={club}
      category={category ?? undefined}
      handicapLabel={handicapStr}
    />
  );
}

function GenericCard({ hit, labels }: { hit: SiteSearchHit; labels: SearchLabels }) {
  return (
    <Link
      href={hit.href}
      className="block rounded-2xl border border-[var(--feg-green)]/12 bg-white p-5 shadow-[0_10px_30px_rgba(0,36,3,0.06)] transition hover:border-[var(--feg-green)]/25 hover:shadow-[0_14px_40px_rgba(0,36,3,0.1)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
        {labels.labelForType(hit.type)}
      </p>
      <h2 className="mt-1.5 font-heading text-lg font-semibold leading-snug text-[var(--feg-ink)]">
        {hit.title}
      </h2>
      {hit.description ? (
        <p className="mt-2 line-clamp-2 text-sm font-medium text-[var(--feg-green)]">
          {hit.description}
        </p>
      ) : null}
    </Link>
  );
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q: rawQ } = await searchParams;
  const t = await getTranslations("searchPage");
  const labels = getSearchLabels(t);
  const { query, hits } = await searchSite(rawQ ?? "", labels);

  const playerHits = hits.filter((h) => h.type === "player");
  const otherHits = hits.filter((h) => h.type !== "player");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-8 lg:px-8">
        <BackToHome />
        <header className="mb-8">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-white/90 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)] shadow-sm">
            {t("badge")}
          </p>
          <h1 className="font-heading text-4xl font-semibold uppercase tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          {query ? (
            <p className="mt-3 text-base font-medium text-[var(--feg-green)]">
              {t("resultsFor", { query, count: hits.length })}
            </p>
          ) : (
            <p className="mt-3 text-base font-medium text-[var(--feg-green)]">
              {t("emptyPrompt")}
            </p>
          )}
        </header>

        {!query ? null : hits.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
            {t("noResults")}
          </p>
        ) : (
          <div className="space-y-10">
            {otherHits.length > 0 && (
              <section>
                <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-[var(--feg-green-2)]">
                  {t("sectionMixed")}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {otherHits.map((h) => (
                    <li key={`${h.type}-${h.href}-${h.title}`}>
                      <GenericCard hit={h} labels={labels} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {playerHits.length > 0 && (
              <section>
                <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.16em] text-[var(--feg-green-2)]">
                  {t("sectionPlayers", { count: playerHits.length })}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {playerHits.map((h) => (
                    <li key={`player-${h.href}-${h.title}`}>
                      <PlayerCard hit={h} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
