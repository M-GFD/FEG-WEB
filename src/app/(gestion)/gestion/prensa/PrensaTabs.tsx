"use client";

import { useState } from "react";
import { PhotoModeration } from "./PhotoModeration";
import { ApprovedGallery } from "./ApprovedGallery";

type PendingPhoto = {
  id: string;
  url: string;
  caption: string | null;
  status: string;
  tournament?: { name: string; slug: string } | null;
};

type ApprovedPhoto = {
  id: string;
  url: string;
  caption: string | null;
  featured: boolean;
  createdAt: string;
};

export function PrensaTabs({
  pending,
  approved,
}: {
  pending: PendingPhoto[];
  approved: ApprovedPhoto[];
}) {
  const [tab, setTab] = useState<"pending" | "approved">("pending");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--feg-green)]/15 pb-4">
        <button
          type="button"
          onClick={() => setTab("pending")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "pending"
              ? "bg-[var(--feg-green-2)] text-white shadow-sm"
              : "bg-[var(--feg-bg)] text-[var(--feg-ink)] hover:bg-white"
          }`}
        >
          Pendientes
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {pending.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("approved")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === "approved"
              ? "bg-emerald-600 text-white"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
        >
          Galería aprobada
          {approved.length > 0 && (
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {approved.length}
            </span>
          )}
        </button>
      </div>

      {tab === "pending" ? (
        <div>
          <p className="mb-4 text-sm text-[var(--feg-green)]">
            Revisá las fotos enviadas por los clubes. Si indicaron un{" "}
            <strong>torneo</strong>, al aprobar aparecen en la ficha de ese torneo
            (histórico público). También pueden mostrarse en la{" "}
            <a href="/prensa" className="font-semibold text-[var(--feg-green-2)] underline underline-offset-2">
              galería general
            </a>
            .
          </p>
          <PhotoModeration photos={pending} />
        </div>
      ) : (
        <div>
          <p className="mb-4 text-sm text-[var(--feg-green)]">
            Las fotos destacadas aparecen primero en la galería pública.
          </p>
          <ApprovedGallery photos={approved} />
        </div>
      )}
    </div>
  );
}
