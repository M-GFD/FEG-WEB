import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { fetchInscriptosRows } from "@/lib/admin-exports";
import {
  INSCRIPTOS_CARD_DAYS_AFTER,
  groupInscriptosByTournament,
} from "@/lib/inscriptos-cards";
import { InscriptosTable } from "./InscriptosTable";

export const metadata = {
  title: "Inscriptos a torneos | Gestión FEG",
};

export default async function AdminInscriptosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "admin");

  const rows = await fetchInscriptosRows();
  const cards = await groupInscriptosByTournament(rows, (r) => r.torneo);
  const visibleCount = cards.reduce((sum, card) => sum + card.rows.length, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/gestion/admin"
          className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
        >
          ← Volver a Administración
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
              Inscriptos a torneos
            </h1>
            <p className="mt-2 max-w-2xl text-[var(--feg-green)]">
              Inscripciones a torneos de menores · {visibleCount} inscripto
              {visibleCount === 1 ? "" : "s"}. Cada torneo tiene su propia tabla y
              deja de mostrarse {INSCRIPTOS_CARD_DAYS_AFTER} días después de jugarse.
            </p>
          </div>
          <a
            href="/api/admin/export/inscriptos"
            className="inline-flex shrink-0 rounded-full bg-[var(--feg-green-2)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Descargar todo (.xlsx)
          </a>
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
          No hay torneos con inscripciones activas.
        </p>
      ) : (
        cards.map((card) => (
          <section
            key={card.tournamentKey}
            className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm"
          >
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--feg-green)]/10 px-5 py-4">
              <div>
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
              </div>
              <a
                href={`/api/admin/export/inscriptos?tournamentKey=${encodeURIComponent(card.tournamentKey)}`}
                className="inline-flex shrink-0 rounded-full border border-[var(--feg-green)]/25 bg-white px-5 py-2 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
              >
                Descargar (.xlsx)
              </a>
            </header>

            {card.rows.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--feg-green)]">
                Todavía no hay inscriptos en este torneo.
              </p>
            ) : (
              <InscriptosTable rows={card.rows} />
            )}
          </section>
        ))
      )}
    </div>
  );
}
