import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { fetchEmpadronadosRows } from "@/lib/admin-exports";
import { EMPADRONAMIENTO_SEASON_YEAR } from "@/lib/empadronamiento-menores/constants";
import { EmpadronadosTable } from "./EmpadronadosTable";

export const metadata = {
  title: "Empadronados | Gestión FEG",
};

export default async function AdminEmpadronadosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "admin");

  const rows = await fetchEmpadronadosRows();

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
              Jugadores empadronados
            </h1>
            <p className="mt-2 text-[var(--feg-green)]">
              Padrón de menores y juveniles · Temporada {EMPADRONAMIENTO_SEASON_YEAR} ·{" "}
              {rows.length} jugador{rows.length === 1 ? "" : "es"}
            </p>
          </div>
          <a
            href="/api/admin/export/empadronados"
            className="inline-flex shrink-0 rounded-full bg-[var(--feg-green-2)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Descargar Excel (.xlsx)
          </a>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
          Aún no hay jugadores empadronados en la temporada {EMPADRONAMIENTO_SEASON_YEAR}.
        </p>
      ) : (
        <EmpadronadosTable rows={rows} />
      )}
    </div>
  );
}
