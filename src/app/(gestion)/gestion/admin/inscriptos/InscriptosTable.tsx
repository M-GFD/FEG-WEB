"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InscriptoExportRow } from "@/lib/admin-exports";
import { deleteInscripto } from "./actions";
import { InscriptoEditModal } from "./InscriptoEditModal";

type Props = {
  rows: InscriptoExportRow[];
};

export function InscriptosTable({ rows }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<InscriptoExportRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const sorted = useMemo(() => rows, [rows]);

  function handleDelete(row: InscriptoExportRow) {
    const ok = window.confirm(
      `¿Eliminar la inscripción de ${row.apellido}, ${row.nombre}?\n\nTorneo: ${row.torneo}\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;

    setError(null);
    setDeletingId(row.recordId);
    startTransition(async () => {
      const res = await deleteInscripto(row.recordId);
      setDeletingId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-[var(--feg-green-soft)] text-white">
            <tr>
              <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                Torneo
              </th>
              <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                Jugador
              </th>
              <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                Categoría
              </th>
              <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                DNI
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
              <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const busy = pending && deletingId === r.recordId;
              return (
                <tr
                  key={r.recordId}
                  className="border-t border-[var(--feg-green)]/10 hover:bg-[var(--feg-bg)]/60"
                >
                  <td className="px-4 py-3 text-xs text-[var(--feg-green)]">
                    {r.torneo}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                    {r.apellido}, {r.nombre}
                    <span className="ml-1 text-xs text-[var(--feg-green)]">
                      ({r.sexo})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-ink)]">
                    {r.categoria}
                    {r.juegaPrejuveniles === "Sí" ? (
                      <span className="ml-1 text-xs text-[var(--feg-green-2)]">
                        + Prejuv.
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">
                    {r.dni || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">{r.club}</td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">
                    {r.tieneHandicap === "Sí" ? r.matricula || "Sí" : "No"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--feg-green)]">
                    {r.fechaInscripcion}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(r)}
                        disabled={busy}
                        className="rounded-full border border-[var(--feg-green)]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)] disabled:opacity-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r)}
                        disabled={busy}
                        className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {busy ? "…" : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="border-t border-[var(--feg-green)]/10 px-4 py-3 text-xs text-[var(--feg-green)]">
          Total: {rows.length} inscripto{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      {editing ? (
        <InscriptoEditModal row={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}
