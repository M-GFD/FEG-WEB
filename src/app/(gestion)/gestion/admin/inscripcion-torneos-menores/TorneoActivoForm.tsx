"use client";

import { useState } from "react";
import { saveActiveYouthTournamentConfig } from "./actions";
import {
  FieldLabel,
  inputClassName,
} from "@/app/empadronamiento-menores/form-ui";

type Props = {
  initial: {
    title: string;
    dateLabel: string;
    extraLine: string;
    venue: string;
    fecha: string;
    sede: string;
    modalidad: string;
  };
};

export function TorneoActivoForm({ initial }: Props) {
  const [title, setTitle] = useState(initial.title);
  const [dateLabel, setDateLabel] = useState(initial.dateLabel);
  const [extraLine, setExtraLine] = useState(initial.extraLine);
  const [venue, setVenue] = useState(initial.venue);
  const [fecha, setFecha] = useState(initial.fecha);
  const [sede, setSede] = useState(initial.sede);
  const [modalidad, setModalidad] = useState(initial.modalidad);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await saveActiveYouthTournamentConfig({
        title,
        dateLabel,
        extraLine: extraLine || undefined,
        venue,
        fecha,
        sede,
        modalidad,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("Torneo activo actualizado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6">
      <div className="space-y-2">
        <FieldLabel htmlFor="title" required>Título del torneo</FieldLabel>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClassName} required />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="dateLabel" required>Fechas (texto)</FieldLabel>
        <input id="dateLabel" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} className={inputClassName} required />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="extraLine">Línea adicional</FieldLabel>
        <input id="extraLine" value={extraLine} onChange={(e) => setExtraLine(e.target.value)} className={inputClassName} />
      </div>
      <div className="space-y-2">
        <FieldLabel htmlFor="venue" required>Sede</FieldLabel>
        <input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClassName} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <FieldLabel htmlFor="fecha" required>Fecha (calendario)</FieldLabel>
          <input id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClassName} required />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="sede" required>Sede (clave)</FieldLabel>
          <input id="sede" value={sede} onChange={(e) => setSede(e.target.value)} className={inputClassName} required />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="modalidad" required>Modalidad</FieldLabel>
          <input id="modalidad" value={modalidad} onChange={(e) => setModalidad(e.target.value)} className={inputClassName} required />
        </div>
      </div>
      {success ? <p className="text-sm text-emerald-800">{success}</p> : null}
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[var(--feg-green-2)] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "Guardando…" : "Publicar como torneo activo"}
      </button>
    </form>
  );
}
