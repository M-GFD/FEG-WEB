import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTournaments } from "@/lib/data";
import { requireGestionArea } from "@/lib/gestion-access";
import { getActiveYouthTournamentConfig } from "@/lib/inscripcion-torneos-menores/config";
import { formatFechaTitle } from "@/lib/calendario-feg";

export default async function GestionClubHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "club");

  const clubId = session.user.clubId;
  const isAdmin = session.user.role === "ADMIN";

  const [tournaments, signupConfig] = await Promise.all([
    getTournaments({
      clubId,
      isAdmin,
      limit: 20,
    }),
    getActiveYouthTournamentConfig(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Club
        </h1>
        <p className="mt-2 text-[var(--feg-green)]">
          Acá ves los torneos asignados a tu club por la federación. Desde cada
          torneo podés cargar resultados y enviar fotos para que prensa las
          apruebe.
        </p>
      </div>

      {signupConfig ? (
        <section className="rounded-2xl border border-[var(--feg-green)]/15 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]">
          <p className="inline-flex rounded-full bg-[var(--feg-green-2)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white">
            Inscripciones menores
          </p>
          <h2 className="mt-3 font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
            {signupConfig.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-[var(--feg-green)]">
            {formatFechaTitle(signupConfig.dateLabel)} · Sede: {signupConfig.venue}
          </p>
          <Link
            href="/gestion/club/inscriptos"
            className="mt-4 inline-flex rounded-full bg-[var(--feg-yellow)] px-6 py-2.5 text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95"
          >
            Ver inscriptos →
          </Link>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Torneos asignados
        </h2>
        {tournaments.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-6 text-center text-[var(--feg-green)]">
            No hay torneos asignados a tu club todavía. La federación crea los
            torneos y los asigna desde Administración.
          </p>
        ) : (
          <div className="space-y-2">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-4 shadow-sm"
              >
                <div>
                  <span className="font-medium text-[var(--feg-ink)]">
                    {t.name}
                  </span>
                  <span className="ml-2 text-sm text-[var(--feg-green)]">
                    {new Date(t.date).toLocaleDateString("es-AR")} ·{" "}
                    {t.club.name}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/gestion/club/torneos/${t.id}/scores`}
                    className="rounded-xl border border-[var(--feg-green)]/15 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--feg-ink)] shadow-sm transition hover:border-[var(--feg-green-2)]/30"
                  >
                    Resultados
                  </Link>
                  {(session.user.role === "CLUB" ||
                    session.user.role === "ADMIN") && (
                    <Link
                      href={`/gestion/club/fotos?torneoId=${t.id}`}
                      className="rounded-xl bg-[var(--feg-green-2)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95"
                    >
                      Enviar fotos
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
