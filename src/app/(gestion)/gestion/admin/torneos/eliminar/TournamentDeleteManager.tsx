"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTournament, type AdminTournamentRow } from "../actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  OPEN: "Abierto",
  IN_PROGRESS: "En curso",
  PUBLISHED: "Publicado",
  CLOSED: "Cerrado",
};

function formatTournamentDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function TournamentDeleteManager({ items }: { items: AdminTournamentRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleDelete(item: AdminTournamentRow) {
    if (isPending) return;

    const statusLabel = STATUS_LABELS[item.status] ?? item.status;
    const ok = window.confirm(
      `¿Eliminar el torneo "${item.name}"?\n\nClub: ${item.clubName}\nFecha: ${formatTournamentDate(item.date)}\nEstado: ${statusLabel}\n\nSe borrarán inscripciones, tarjetas y resultados asociados. Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    setError(null);
    setDeletingId(item.id);
    startTransition(async () => {
      const res = await deleteTournament(item.id);
      setDeletingId(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
        No hay torneos para eliminar.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <ul className="divide-y divide-[var(--feg-green)]/10 overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-[0_14px_40px_rgba(0,36,3,0.06)]">
        {items.map((item) => {
          const busy = isPending && deletingId === item.id;
          return (
            <li
              key={item.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="min-w-0">
                <p className="font-semibold text-[var(--feg-ink)]">{item.name}</p>
                <p className="mt-1 text-sm text-[var(--feg-green)]">
                  {item.clubName} · {formatTournamentDate(item.date)} ·{" "}
                  {STATUS_LABELS[item.status] ?? item.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                disabled={isPending}
                className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
              >
                {busy ? "Eliminando…" : "Eliminar"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
