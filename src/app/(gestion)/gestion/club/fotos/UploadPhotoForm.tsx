"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CLUB_PHOTO_MAX_COUNT } from "@/lib/storage";

type TournamentOption = { id: string; name: string; date: string };

export function UploadPhotoForm({
  tournaments,
  defaultTournamentId,
}: {
  tournaments: TournamentOption[];
  defaultTournamentId?: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const list = e.target.files;
    if (!list?.length) {
      setSelectedCount(0);
      return;
    }
    if (list.length > CLUB_PHOTO_MAX_COUNT) {
      setError(
        `Solo podés elegir hasta ${CLUB_PHOTO_MAX_COUNT} imágenes. Volvé a seleccionar.`
      );
      e.target.value = "";
      setSelectedCount(0);
      return;
    }
    setSelectedCount(list.length);
  }

  /**
   * Usamos onSubmit + FormData manual en lugar de action={fn}: el action de React
   * con archivos grandes/multipart puede fallar con "Unexpected end of form".
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Guardar referencia antes de await: tras async, e.currentTarget puede ser null.
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      const res = await fetch("/api/club-photos", {
        method: "POST",
        body: formData,
      });

      let result: { ok: true; count: number } | { ok: false; error?: string };
      try {
        result = await res.json();
      } catch {
        setError(`Error del servidor (${res.status}). Probá con menos o archivos más livianos.`);
        return;
      }

      if (result.ok) {
        const n = typeof result.count === "number" ? result.count : 1;
        setSuccess(
          n === 1
            ? "1 foto enviada. Quedará pendiente hasta que prensa la apruebe."
            : `${n} fotos enviadas. Quedarán pendientes hasta que prensa las apruebe.`
        );
        form.reset();
        setSelectedCount(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } else {
        setError(result.error ?? (res.statusText || "Error al enviar"));
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      id="upload-photo-form"
      onSubmit={handleSubmit}
      className="max-w-xl space-y-6 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]"
    >
      <p className="text-sm text-[var(--feg-green)]">
        Elegí <strong>una</strong> de las dos formas: archivos en tu equipo o un enlace. Si
        subís archivos, se ignora el campo URL.
      </p>

      {/* Opción A: archivos locales */}
      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)] p-4">
        <h2 className="text-sm font-semibold text-[var(--feg-ink)]">
          Desde tu computadora
        </h2>
        <p className="mt-1 text-xs text-[var(--feg-green)]/85">
          PNG, JPG o JPEG · hasta <strong>{CLUB_PHOTO_MAX_COUNT} imágenes</strong> a la vez
          · máximo 5 MB por archivo
        </p>
        <input
          ref={fileInputRef}
          id="files"
          name="files"
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onChange={handleFileChange}
          className="mt-3 block w-full text-sm text-[var(--feg-green)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--feg-green-2)] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:brightness-95"
        />
        {selectedCount > 0 && (
          <p className="mt-2 text-xs font-semibold text-[var(--feg-green-2)]">
            {selectedCount} imagen{selectedCount !== 1 ? "es" : ""} seleccionada
            {selectedCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-[var(--feg-green)]/15" />
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--feg-green)]/60">
          o
        </span>
        <div className="h-px flex-1 bg-[var(--feg-green)]/15" />
      </div>

      {/* Opción B: URL */}
      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)] p-4">
        <h2 className="text-sm font-semibold text-[var(--feg-ink)]">
          Por enlace (URL)
        </h2>
        <p className="mt-1 text-xs text-[var(--feg-green)]/85">
          Una sola imagen por envío. Si ya elegiste archivos arriba, este campo se ignora.
        </p>
        <label htmlFor="url" className="sr-only">
          URL de la imagen
        </label>
        <input
          id="url"
          name="url"
          type="url"
          placeholder="https://…"
          className="mt-3 w-full rounded-xl border border-[var(--feg-green)]/20 bg-white px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="caption" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
          Pie de foto (opcional)
        </label>
        <p className="mb-1 text-xs text-[var(--feg-green)]/75">
          Se aplica a todas las imágenes del mismo envío.
        </p>
        <textarea
          id="caption"
          name="caption"
          rows={3}
          className="w-full rounded-xl border border-[var(--feg-green)]/20 px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
          placeholder="Descripción breve del momento o del torneo"
        />
      </div>
      {tournaments.length > 0 && (
        <div>
          <label
            htmlFor="tournamentId"
            className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
          >
            Torneo relacionado (recomendado)
          </label>
          <p className="mb-2 text-xs text-[var(--feg-green)]">
            Si elegís el torneo que organiza tu club, las fotos aprobadas por prensa se
            mostrarán en la <strong>tarjeta y ficha</strong> de ese torneo en el histórico
            público. Si no, solo podrán usarse en la galería general.
          </p>
          <select
            id="tournamentId"
            name="tournamentId"
            defaultValue={defaultTournamentId ?? ""}
            className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-white px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
          >
            <option value="">— Seleccioná el torneo —</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {new Date(t.date).toLocaleDateString("es-AR")}
              </option>
            ))}
          </select>
        </div>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
          {success}
        </p>
      )}
      <button
        type="submit"
        disabled={uploading}
        className="w-full rounded-xl bg-[var(--feg-green-2)] py-3 font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {uploading ? "Enviando…" : "Enviar a prensa"}
      </button>
    </form>
  );
}
