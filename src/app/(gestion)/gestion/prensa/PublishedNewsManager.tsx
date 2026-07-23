"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deletePublishedNewsByIds } from "./actions";
import { formatNewsDateParts } from "@/lib/news-dates";

const MAX_BULK = 50;

export type PublishedNewsRow = {
  id: string;
  title: string;
  slug: string;
  publishedAt: string | null;
  createdAt: string;
};

export function PublishedNewsManager({ items }: { items: PublishedNewsRow[] }) {
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
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
    setError(null);
  }

  function handleDelete() {
    if (!someSelected || isPending) return;
    const ids = [...selected];
    if (ids.length > MAX_BULK) {
      setError(`Podés eliminar como máximo ${MAX_BULK} noticias por vez.`);
      return;
    }

    const titles = items.filter((i) => selected.has(i.id)).map((i) => i.title);
    const preview =
      titles.length <= 3
        ? titles.join(" · ")
        : `${titles.slice(0, 3).join(" · ")}… (+${titles.length - 3} más)`;

    const ok = window.confirm(
      `¿Eliminar ${ids.length} noticia${ids.length === 1 ? "" : "s"} publicada${ids.length === 1 ? "" : "s"}?\n\n${preview}\n\nEsta acción no se puede deshacer.`
    );
    if (!ok) return;

    setError(null);
    startTransition(async () => {
      const res = await deletePublishedNewsByIds(ids);
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
        No hay noticias publicadas para gestionar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--feg-green)]">
          Editá una noticia o marcá filas para eliminarlas del sitio (solo la base de datos, no los archivos en almacenamiento).
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {someSelected && (
            <span className="text-sm font-medium text-[var(--feg-ink)]">
              {selected.size} seleccionada{selected.size === 1 ? "" : "s"}
            </span>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={!someSelected || isPending || selected.size > MAX_BULK}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Eliminando…" : "Eliminar seleccionadas"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}

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
                  aria-label="Seleccionar todas las noticias de la lista"
                />
              </th>
              <th className="px-3 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
                Título
              </th>
              <th className="hidden px-3 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--feg-ink)] md:table-cell">
                Fecha
              </th>
              <th className="px-3 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const { label } = formatNewsDateParts(row.publishedAt, row.createdAt);
              return (
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
                      aria-label={`Seleccionar: ${row.title}`}
                    />
                  </td>
                  <td className="max-w-[min(28rem,55vw)] px-3 py-3 align-top font-medium text-[var(--feg-ink)]">
                    {row.title}
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-3 align-top text-[var(--feg-green)] md:table-cell">
                    {label}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        href={`/gestion/prensa/noticias/${row.id}/editar`}
                        className="font-semibold text-[var(--feg-ink)] underline-offset-2 hover:underline"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/noticias/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[var(--feg-green-2)] underline-offset-2 hover:underline"
                      >
                        Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length > MAX_BULK && (
        <p className="text-xs text-[var(--feg-green)]/80">
          Se muestran hasta {items.length} noticias. Para eliminar en bloque, el máximo por operación es {MAX_BULK}.
        </p>
      )}
    </div>
  );
}
