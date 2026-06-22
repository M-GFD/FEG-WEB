import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { PublicPlayerCard } from "@/components/players/PublicPlayerCard";
import { getClubBySlug, getPublicPlayersByClubId } from "@/lib/data";
import { formatHandicapRankingCell } from "@/lib/handicap-ranking";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ClubDetailPage({ params }: Props) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const players = await getPublicPlayersByClubId(club.id);
  const t = await getTranslations("clubs");

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <nav className="mb-6 text-sm font-medium text-[var(--feg-green-2)]">
          <Link href="/clubes" className="underline-offset-2 hover:underline">
            {t("backToClubs")}
          </Link>
        </nav>
        <BackToHome />

        <header className="mb-10 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)] sm:p-8">
          <p className="mb-3 inline-flex rounded-full border border-[var(--feg-green)]/25 bg-[var(--feg-bg)] px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--feg-green-2)]">
            {t("affiliatedBadge")}
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-semibold uppercase tracking-tight sm:text-4xl md:text-5xl">
                {club.name}
              </h1>
              {club.code && (
                <p className="mt-2 font-heading text-sm font-semibold uppercase tracking-wider text-[var(--feg-green-2)]">
                  {t("code", { code: club.code })}
                </p>
              )}
            </div>
          </div>
          {club.address && (
            <p className="mt-4 text-sm leading-relaxed text-[var(--feg-green)]">{club.address}</p>
          )}
          {club.phone && (
            <p className="mt-2 text-sm font-medium text-[var(--feg-green-2)]">{club.phone}</p>
          )}
          <p className="mt-4 text-sm font-medium text-[var(--feg-green)]">
            {players.length === 0
              ? t("noPlayers")
              : t("rosterCount", { count: players.length })}
          </p>
        </header>

        {players.length > 0 ? (
          <section>
            <h2 className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
              {t("playersSection")}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((p) => (
                <li key={p.id}>
                  <PublicPlayerCard
                    href={`/jugadores/${p.id}`}
                    title={`${p.firstName} ${p.lastName}`}
                    clubName={club.name}
                    category={p.category ?? undefined}
                    handicapLabel={formatHandicapRankingCell({
                      handicap: p.handicap,
                      handicapIndex: p.handicapIndex,
                    })}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
