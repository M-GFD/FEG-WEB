import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getTournamentById, getTournamentEntry } from "@/lib/data";
import { requireGestionArea } from "@/lib/gestion-access";
import { ScoreEntryForm } from "../ScoreEntryForm";

export default async function ScoreEntryPage({
  params,
}: {
  params: Promise<{ id: string; entryId: string }>;
}) {
  const { id, entryId } = await params;
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

  const entry = await getTournamentEntry(entryId, id);
  if (!entry) notFound();

  return (
    <div>
      <Link
        href={`/gestion/club/torneos/${id}/scores`}
        className="mb-4 inline-block text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
      >
        ← Volver a lista
      </Link>
      <h1 className="mb-2 font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] md:text-3xl">
        {entry.player.firstName} {entry.player.lastName}
      </h1>
      <p className="mb-6 text-[var(--feg-green)]">
        {entry.player.club.name} · HCP {entry.player.handicap} ·{" "}
        {entry.category.replace(/_/g, " ")}
      </p>

      <ScoreEntryForm entry={entry} />
    </div>
  );
}
