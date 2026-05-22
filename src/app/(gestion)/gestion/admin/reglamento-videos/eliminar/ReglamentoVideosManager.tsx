"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteReglamentoVideosByIds } from "../actions";

const MAX_BULK = 50;

export type ReglamentoVideoAdminRow = {
  id: string;
  title: string;
  mimeType: string;
  createdAt: string;
};

function formatVideoDate(iso: string): string {
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

function mimeLabel(mime: string): string {
  if (mime === "video/mp4") return "MP4";
  if (mime === "video/webm") return "WebM";
  if (mime === "image/gif") return "GIF";
  return mime;
}

export function ReglamentoVideosManager({ items }: { items: ReglamentoVideoAdminRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => items.map((i) => i.id), [items]);
  const allSelected = items.length > 0 && selected.size === items.length;
  const someSelected = selected.size > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError(null);
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
    setError(null);
  }

  function handleDelete() {
    if (!someSelected || isPending) return;
    const ids = [...selected];
    if (ids.length > MAX_BULK) {
      setError(`Podés eliminar como máximo ${MAX_BULK} videos por vez.`);
      return;
    }

    const titles = items.filter((i) => selected.has(i.id)).map((i) => i.title);
    const preview =
      titles.length <= 3
        ? titles.join(" · ")
        : `${titles.slice(0, 3).join(" · ")}… (+${titles.length - 3} más)`;

    const ok = window.confirm(
      `¿Eliminar ${ids.length} video${ids.length === 1 ? "" : "s"} publicado${ids.length === 1 ? "" : "s"}?\n\n${preview}\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;

    setError(null);
    startTransition(async () => {
      const res = await deleteReglamentoVideosByIds(ids);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSelected(new Set());
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
        No hay videos publicados para gestionar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--feg-green)]">
          Marcá uno o varios videos y eliminá del sitio (solo la base de datos; el archivo en Storage no se borra).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {someSelected ? (
            <span className="text-sm font-medium text-[var(--feg-ink)]">
              {selected.size} seleccionado{selected.size === 1 ? "" : "s"}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleDelete}
            disabled={!someSelected || isPending || selected.size > MAX_BULK}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Eliminando…" : "Eliminar seleccionados"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--feg-green)]/12 bg-[var(--feg-bg)]/50">
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-[var(--feg-green)]/40 text-[var(--feg-green-2)] focus:ring-[var(--feg-green-2)]"
                  aria-label="Seleccionar todos los videos"
                />
              </th>
              <th className="px-3 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
                Título
              </th>
              <th className="hidden px-3 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--feg-ink)] sm:table-cell">
                Formato
              </th>
              <th className="hidden px-3 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--feg-ink)] md:table-cell">
                Fecha
              </th>
              <th className="px-3 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
                Sitio
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--feg-green)]/8 last:border-0 hover:bg-[var(--feg-bg)]/30"
              >
                <td className="px-3 py-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggle(row.id)}
                    className="rounded border-[var(--feg-green)]/40 text-[var(--feg-green-2)] focus:ring-[var(--feg-green-2)]"
                    aria-label={`Seleccionar ${row.title}`}
                  />
                </td>
                <td className="px-3 py-3 font-medium text-[var(--feg-ink)]">{row.title}</td>
                <td className="hidden px-3 py-3 text-[var(--feg-green)] sm:table-cell">
                  {mimeLabel(row.mimeType)}
                </td>
                <td className="hidden px-3 py-3 text-[var(--feg-green)] md:table-cell">
                  {formatVideoDate(row.createdAt)}
                </td>
                <td className="px-3 py-3">
                  <Link
                    href="/institucional/reglamento/videos"
                    className="text-sm font-semibold text-[var(--feg-green-2)] underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en sitio
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--feg-green)]/80">
        Máximo {MAX_BULK} videos por operación de eliminación.
      </p>
    </div>
  );
}
