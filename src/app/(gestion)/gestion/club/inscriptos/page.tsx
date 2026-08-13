import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { listYouthTournamentRegistrations } from "@/lib/inscripcion-torneos-menores/persistence";
import {
  INSCRIPTOS_CARD_DAYS_AFTER,
  groupInscriptosByTournament,
} from "@/lib/inscriptos-cards";

export default async function ClubInscriptosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "club");

  const isAdmin = session.user.role === "ADMIN";
  const clubId = session.user.clubId;

  const registrations =
    isAdmin || clubId
      ? await listYouthTournamentRegistrations({
          clubId: isAdmin ? undefined : clubId,
          isAdmin,
        })
      : [];

  const cards = await groupInscriptosByTournament(registrations, (r) => r.tournamentKey);

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
          Inscriptos a torneos
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--feg-green)]">
          Cada torneo con inscriptos tiene su propia tabla y deja de mostrarse{" "}
          {INSCRIPTOS_CARD_DAYS_AFTER} días después de jugarse.
        </p>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
          {isAdmin
            ? "No hay torneos con inscripciones activas."
            : "Tu club no tiene inscriptos en los torneos activos."}
        </p>
      ) : (
        cards.map((card) => (
          <section
            key={card.tournamentKey}
            className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm"
          >
            <header className="border-b border-[var(--feg-green)]/10 px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
                  {card.title}
                </h2>
                {card.isSignupOpen ? (
                  <span className="rounded-full bg-[var(--feg-green-2)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white">
                    Inscripción abierta
                  </span>
                ) : (
                  <span className="rounded-full bg-[var(--feg-yellow)]/25 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-ink)]">
                    Inscripción cerrada
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-[var(--feg-green)]">
                {[card.dateLabel, card.venue ? `Sede: ${card.venue}` : null]
                  .filter(Boolean)
                  .join(" · ")}
                {" · "}
                {card.rows.length} inscripto{card.rows.length === 1 ? "" : "s"}
              </p>
            </header>

            {card.rows.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--feg-green)]">
                {isAdmin
                  ? "Todavía no hay inscriptos en este torneo."
                  : "Tu club todavía no tiene inscriptos en este torneo."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-[var(--feg-green-soft)] text-white">
                    <tr>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                        Jugador
                      </th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                        Categoría
                      </th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                        Club
                      </th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                        HC
                      </th>
                      <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {card.rows.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-[var(--feg-green)]/10 hover:bg-[var(--feg-bg)]/60"
                      >
                        <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                          {r.lastName}, {r.firstName}
                          <span className="ml-1 text-xs text-[var(--feg-green)]">
                            ({r.gender})
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--feg-ink)]">
                          {r.category}
                          {r.playsPrejuvenilesAlso ? (
                            <span className="ml-1 text-xs text-[var(--feg-green-2)]">
                              + Prejuv.
                            </span>
                          ) : null}
                          {r.isPrincipiante ? (
                            <span className="ml-1 text-xs text-[var(--feg-green-2)]">
                              Princ.
                            </span>
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
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
