import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { BackToHome } from "@/components/layout/BackToHome";
import { getApprovedPhotosForTournament, getTournamentBySlug } from "@/lib/data";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tournament = await getTournamentBySlug(slug);

  if (!tournament) notFound();

  const t = await getTranslations("tournamentDetail");
  const entriesWithPosition = tournament.entries ?? [];
  type EntryRow = (typeof entriesWithPosition)[number];
  const gallery = await getApprovedPhotosForTournament(tournament.id);

  return (
    <div className="min-h-screen bg-[var(--feg-bg)] text-[var(--feg-ink)]">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <BackToHome />
          <Link
            href="/torneos"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--feg-green)]/20 bg-white px-4 py-2 text-sm font-medium text-[var(--feg-green-2)] shadow-sm transition hover:border-[var(--feg-green-2)]/40 hover:bg-[var(--feg-yellow)]/15"
          >
            {t("backToHistoric")}
          </Link>
        </div>
        <header className="mb-10 rounded-3xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.08)] sm:p-8">
          <h1 className="font-heading text-3xl font-semibold uppercase leading-tight tracking-tight md:text-4xl">
            {tournament.name}
          </h1>
          <p className="mt-3 text-lg text-[var(--feg-green)]">
            {tournament.club.name} ·{" "}
            {new Date(tournament.date).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[var(--feg-green)]/90">
            {t("galleryNote")}
          </p>
        </header>

        {gallery.length > 0 && (
          <section className="mb-12" aria-labelledby="galeria-torneo">
            <h2
              id="galeria-torneo"
              className="font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]"
            >
              {t("galleryTitle")}
            </h2>
            <div className="mt-5 columns-2 gap-3 sm:columns-3 sm:gap-4">
              {gallery.map((p) => (
                <figure
                  key={p.id}
                  className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_10px_30px_rgba(0,36,3,0.06)]"
                >
                  <img
                    src={p.url}
                    alt={p.caption || t("photoAlt")}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  {p.caption && (
                    <figcaption className="border-t border-[var(--feg-green)]/10 px-3 py-2 text-xs text-[var(--feg-green)]">
                      {p.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        <h2 className="mb-5 font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          {t("results")}
        </h2>
        {entriesWithPosition.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.08)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--feg-green-soft)] text-white">
                <tr>
                  <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                    {t("colPos")}
                  </th>
                  <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                    {t("colPlayer")}
                  </th>
                  <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                    {t("colClub")}
                  </th>
                  <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                    {t("colCategory")}
                  </th>
                  <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                    {t("colGross")}
                  </th>
                  <th className="px-4 py-3.5 font-heading text-xs font-semibold uppercase tracking-wider">
                    {t("colNeto")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entriesWithPosition.map((e: EntryRow) => (
                  <tr
                    key={e.id}
                    className="border-t border-[var(--feg-green)]/10 transition hover:bg-[var(--feg-bg)]/80"
                  >
                    <td className="px-4 py-3 font-heading font-semibold text-[var(--feg-green-2)]">
                      {e.position}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/jugadores/${e.player.id}`}
                        className="font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
                      >
                        {e.player.firstName} {e.player.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--feg-green)]">{e.player.club.name}</td>
                    <td className="px-4 py-3 text-[var(--feg-green)]">
                      {e.category.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                      {e.scorecard?.gross ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                      {e.scorecard?.net ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/70 p-10 text-center text-[var(--feg-green)]">
            {t("resultsEmpty")}
          </p>
        )}
      </main>
    </div>
  );
}
