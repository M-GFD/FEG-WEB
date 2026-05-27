import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { getActiveYouthTournamentConfig } from "@/lib/inscripcion-torneos-menores/config";
import { listYouthTournamentRegistrations } from "@/lib/inscripcion-torneos-menores/persistence";
import { formatFechaTitle } from "@/lib/calendario-feg";

export default async function ClubInscriptosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "club");

  const config = await getActiveYouthTournamentConfig();
  const isAdmin = session.user.role === "ADMIN";
  const clubId = session.user.clubId;

  const registrations =
    config && (isAdmin || clubId)
      ? await listYouthTournamentRegistrations({
          tournamentKey: config.tournamentKey,
          clubId: isAdmin ? undefined : clubId,
          isAdmin,
        })
      : [];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/gestion/club"
          className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
        >
          ← Volver a Club
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Inscriptos al torneo
        </h1>
        {config ? (
          <p className="mt-2 text-[var(--feg-green)]">
            {config.title} · {formatFechaTitle(config.dateLabel)} · Sede: {config.venue}
          </p>
        ) : (
          <p className="mt-2 text-[var(--feg-green)]">No hay torneo activo para inscripciones.</p>
        )}
      </div>

      {!config ? null : registrations.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
          {isAdmin
            ? "Aún no hay inscriptos en el torneo activo."
            : "Tu club no tiene inscriptos en el torneo activo."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[var(--feg-green-soft)] text-white">
              <tr>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Jugador</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Categoría</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Club</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">HC</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[var(--feg-green)]/10 hover:bg-[var(--feg-bg)]/60"
                >
                  <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                    {r.lastName}, {r.firstName}
                    <span className="ml-1 text-xs text-[var(--feg-green)]">({r.gender})</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-ink)]">
                    {r.category}
                    {r.playsPrejuvenilesAlso ? (
                      <span className="ml-1 text-xs text-[var(--feg-green-2)]">+ Prejuv.</span>
                    ) : null}
                    {r.isPrincipiante ? (
                      <span className="ml-1 text-xs text-[var(--feg-green-2)]">Princ.</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">
                    {r.clubOther ?? r.clubName}
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">
                    {r.hasHandicap ? r.matricula ?? "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--feg-green)]">
                    {new Date(r.createdAt).toLocaleString("es-AR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--feg-green)]/10 px-4 py-3 text-xs text-[var(--feg-green)]">
            Total: {registrations.length} inscripto{registrations.length === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}
