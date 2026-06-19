import Link from "next/link";
import { getAdminTournamentsForDelete } from "../actions";
import { TournamentDeleteManager } from "./TournamentDeleteManager";

export const dynamic = "force-dynamic";

export default async function EliminarTorneosPage() {
  const tournaments = await getAdminTournamentsForDelete();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/gestion/admin"
          className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
        >
          ← Volver a administración
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Eliminar torneo
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          Borrá un torneo creado por error o que ya no corresponda. El club dejará de
          verlo en su panel y se quitarán los datos asociados.
        </p>
      </div>

      <TournamentDeleteManager items={tournaments} />
    </div>
  );
}
