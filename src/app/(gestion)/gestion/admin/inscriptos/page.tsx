import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireGestionArea } from "@/lib/gestion-access";
import { fetchInscriptosRows } from "@/lib/admin-exports";

export const metadata = {
  title: "Inscriptos a torneos | Gestión FEG",
};

export default async function AdminInscriptosPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  requireGestionArea(session.user.role, "admin");

  const rows = await fetchInscriptosRows();

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
            <p className="mt-2 text-[var(--feg-green)]">
              Inscripciones a torneos de menores · {rows.length} inscripto
              {rows.length === 1 ? "" : "s"}
            </p>
          </div>
          <a
            href="/api/admin/export/inscriptos"
            className="inline-flex shrink-0 rounded-full bg-[var(--feg-green-2)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Descargar Excel (.xlsx)
          </a>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
          Aún no hay inscripciones a torneos.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[var(--feg-green-soft)] text-white">
              <tr>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Torneo</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Jugador</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Categoría</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">DNI</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Club</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">HC</th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.dni}-${i}`}
                  className="border-t border-[var(--feg-green)]/10 hover:bg-[var(--feg-bg)]/60"
                >
                  <td className="px-4 py-3 text-xs text-[var(--feg-green)]">{r.torneo}</td>
                  <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                    {r.apellido}, {r.nombre}
                    <span className="ml-1 text-xs text-[var(--feg-green)]">({r.sexo})</span>
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-ink)]">
                    {r.categoria}
                    {r.juegaPrejuveniles === "Sí" ? (
                      <span className="ml-1 text-xs text-[var(--feg-green-2)]">+ Prejuv.</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">{r.dni || "—"}</td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">{r.club}</td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">
                    {r.tieneHandicap === "Sí" ? r.matricula || "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--feg-green)]">{r.fechaInscripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--feg-green)]/10 px-4 py-3 text-xs text-[var(--feg-green)]">
            Total: {rows.length} inscripto{rows.length === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}
