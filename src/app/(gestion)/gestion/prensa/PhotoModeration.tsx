"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { approvePhoto, rejectPhoto } from "./actions";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  status: string;
  tournament?: { name: string; slug: string } | null;
};

export function PhotoModeration({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (photos.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
        No hay fotos pendientes de aprobación.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((p) => (
        <div
          key={p.id}
          className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm"
        >
          <img
            src={p.url}
            alt={p.caption ?? "Foto"}
            className="h-48 w-full object-cover"
          />
          {p.tournament && (
            <div className="border-b border-[var(--feg-green)]/10 px-3 py-2">
              <p className="text-xs text-[var(--feg-green)]/75">Torneo</p>
              <Link
                href={`/torneos/${p.tournament.slug}`}
                className="text-sm font-semibold text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                {p.tournament.name}
              </Link>
            </div>
          )}
          {!p.tournament && (
            <p className="border-b border-[var(--feg-green)]/10 bg-[var(--feg-yellow)]/25 px-3 py-2 text-xs font-medium text-[var(--feg-ink)]">
              Sin torneo asociado (solo galería general /prensa)
            </p>
          )}
          {p.caption && (
            <p className="p-3 text-sm text-[var(--feg-green)]">{p.caption}</p>
          )}
          <div className="flex gap-2 p-3">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  await approvePhoto(p.id);
                  router.refresh();
                })
              }
              disabled={isPending}
              className="flex-1 rounded-xl bg-[var(--feg-green-2)] py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-50"
            >
              Aprobar
            </button>
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  await rejectPhoto(p.id);
                  router.refresh();
                })
              }
              disabled={isPending}
              className="flex-1 rounded-lg bg-red-100 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
