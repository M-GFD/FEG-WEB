import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTournamentById } from "@/lib/data";
import { requireGestionArea } from "@/lib/gestion-access";
import { ScoreEntryForm } from "./ScoreEntryForm";
import { PreviewSection } from "./PreviewSection";
import { PublishButton } from "./PublishButton";

export default async function ScoresPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "club");

  const tournament = await getTournamentById(id);

  if (!tournament) notFound();

  const canAccess =
    session.user.role === "ADMIN" ||
    (session.user.clubId === tournament.clubId &&
      (session.user.role === "CLUB" || session.user.role === "DIRECTOR"));

  if (!canAccess) notFound();

  type EntryRow = (typeof tournament.entries)[number];
  const entries = tournament.entries;

  const pending = entries.filter(
    (e: EntryRow) =>
      !e.scorecard ||
      e.scorecard.status === "PENDING" ||
      e.scorecard.status === "DRAFT"
  );
  const complete = entries.filter(
    (e: EntryRow) => e.scorecard?.status === "DRAFT" && e.scorecard.gross != null
  );
  const published = entries.filter((e: EntryRow) => e.scorecard?.status === "PUBLISHED");
  const canPublish = complete.length === entries.length && entries.length > 0;

  return (
    <div>
      <Link
        href="/gestion/club/torneos"
        className="mb-4 inline-block text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
      >
        ← Volver a torneos
      </Link>
      <h1 className="mb-2 font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-3xl">
        Cargar resultados: {tournament.name}
      </h1>
      <p className="mb-6 text-[var(--feg-green)]">
        {tournament.club.name} ·{" "}
        {new Date(tournament.date).toLocaleDateString("es-AR")}
      </p>

      <div className="mb-8 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Lista de jugadores
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--feg-green)]/15 bg-[var(--feg-bg)]">
                <th className="px-3 py-2 text-left font-medium text-[var(--feg-green-2)]">Jugador</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--feg-green-2)]">Club</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--feg-green-2)]">HCP</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--feg-green-2)]">Categoría</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--feg-green-2)]">Estado</th>
                <th className="px-3 py-2 text-left font-medium text-[var(--feg-green-2)]">Acción</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e: EntryRow) => (
                <tr key={e.id} className="border-b border-[var(--feg-green)]/10">
                  <td className="px-3 py-2 text-[var(--feg-ink)]">
                    {e.player.firstName} {e.player.lastName}
                  </td>
                  <td className="px-3 py-2 text-[var(--feg-green)]">{e.player.club.name}</td>
                  <td className="px-3 py-2 text-[var(--feg-green)]">{e.player.handicap}</td>
                  <td className="px-3 py-2 text-[var(--feg-green)]">
                    {e.category.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        e.scorecard?.status === "PUBLISHED"
                          ? "bg-[var(--feg-green-2)]/15 text-[var(--feg-green-2)]"
                          : e.scorecard?.status === "DRAFT" && e.scorecard.gross
                            ? "bg-[var(--feg-yellow)]/40 text-[var(--feg-ink)]"
                            : "bg-[var(--feg-bg)] text-[var(--feg-green)]"
                      }`}
                    >
                      {e.scorecard?.status === "PUBLISHED"
                        ? "Publicado"
                        : e.scorecard?.status === "DRAFT" && e.scorecard.gross
                          ? "Borrador"
                          : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/gestion/club/torneos/${id}/scores/${e.id}`}
                      className="font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
                    >
                      Cargar score
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canPublish && tournament.status !== "PUBLISHED" && (
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
            Vista previa y publicación
          </h2>
          <PreviewSection entries={tournament.entries} />
          <PublishButton tournamentId={id} />
        </div>
      )}

      {tournament.status === "PUBLISHED" && (
        <p className="rounded-2xl border border-[var(--feg-green-2)]/20 bg-[var(--feg-green-2)]/10 p-4 text-[var(--feg-green-2)]">
          Resultados publicados.{" "}
          <Link href={`/torneos/${tournament.slug}`} className="font-semibold underline">
            Ver en página pública
          </Link>
        </p>
      )}
    </div>
  );
}
