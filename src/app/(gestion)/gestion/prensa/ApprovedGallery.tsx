"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePhotoFeatured } from "./actions";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  featured: boolean;
  createdAt: string;
};

export function ApprovedGallery({ photos }: { photos: Photo[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (photos.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
        No hay fotos aprobadas todavía. Las aprobadas aparecerán en la galería
        pública <span className="font-medium">/prensa</span>.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((p) => (
        <div
          key={p.id}
          className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
            p.featured
              ? "border-[var(--feg-yellow)] ring-2 ring-[var(--feg-yellow)]/80"
              : "border-[var(--feg-green)]/12"
          }`}
        >
          <img
            src={p.url}
            alt={p.caption ?? "Foto"}
            className="h-44 w-full object-cover"
          />
          <div className="p-3">
            {p.caption && (
              <p className="text-sm text-[var(--feg-green)] line-clamp-2">{p.caption}</p>
            )}
            <p className="mt-1 text-xs text-[var(--feg-green)]/60">
              {new Date(p.createdAt).toLocaleDateString("es-AR")}
            </p>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  await togglePhotoFeatured(p.id, !p.featured);
                  router.refresh();
                })
              }
              className={`mt-3 w-full rounded-xl py-2 text-sm font-semibold transition disabled:opacity-50 ${
                p.featured
                  ? "border border-[var(--feg-green)]/15 bg-[var(--feg-bg)] text-[var(--feg-ink)] hover:bg-white"
                  : "bg-[var(--feg-yellow)] text-[var(--feg-ink)] hover:brightness-95"
              }`}
            >
              {p.featured ? "Quitar destacada" : "Marcar como destacada"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
