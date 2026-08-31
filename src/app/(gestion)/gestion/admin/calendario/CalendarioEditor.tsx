"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  restoreCalendarDateAction,
  saveCalendarDateAction,
} from "./actions";
import type { AdminCalendarSlot } from "@/lib/calendario-overrides";
import type { CalendarDateStatus } from "@/lib/calendario-feg";
import { FieldLabel, inputClassName, selectClassName } from "@/app/empadronamiento-menores/form-ui";

const STATUS_OPTIONS: { value: CalendarDateStatus; label: string }[] = [
  { value: "SCHEDULED", label: "Programada (original)" },
  { value: "RESCHEDULED", label: "Reprogramada" },
  { value: "SUSPENDED", label: "Suspendida" },
  { value: "CANCELLED", label: "Cancelada" },
];

function statusBadge(status: CalendarDateStatus) {
  if (status === "CANCELLED") return "Cancelada";
  if (status === "SUSPENDED") return "Suspendida";
  if (status === "RESCHEDULED") return "Reprogramada";
  return null;
}

function SlotEditor({ slot }: { slot: AdminCalendarSlot }) {
  const [status, setStatus] = useState<CalendarDateStatus>(slot.status);
  const [dateStart, setDateStart] = useState(slot.dateStartIso);
  const [dateEnd, setDateEnd] = useState(
    slot.display.dayEnd != null && slot.display.dayEnd !== slot.display.day ? slot.dateEndIso : ""
  );
  const [rangeStyle, setRangeStyle] = useState<"and" | "slash">(slot.rangeStyle);
  const [sede, setSede] = useState(slot.displaySede);
  const [note, setNote] = useState(slot.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const router = useRouter();

  const badge = statusBadge(slot.status);

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const res = await saveCalendarDateAction({
        slotId: slot.slotId,
        status,
        dateStart: status === "RESCHEDULED" ? dateStart : undefined,
        dateEnd: status === "RESCHEDULED" ? dateEnd || undefined : undefined,
        rangeStyle: status === "RESCHEDULED" ? rangeStyle : undefined,
        sede: status === "RESCHEDULED" ? sede : undefined,
        note: note.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("Cambios guardados. Ya se ven en el calendario público.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore() {
    setError(null);
    setSuccess(null);
    setRestoring(true);
    try {
      const res = await restoreCalendarDateAction(slot.slotId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setStatus("SCHEDULED");
      setNote("");
      setSede(slot.originalSede);
      setDateStart(
        `${slot.original.year ?? 2026}-${String(slot.original.month + 1).padStart(2, "0")}-${String(slot.original.day).padStart(2, "0")}`
      );
      setDateEnd(
        slot.original.dayEnd != null && slot.original.dayEnd !== slot.original.day
          ? `${slot.original.year ?? 2026}-${String(slot.original.month + 1).padStart(2, "0")}-${String(slot.original.dayEnd).padStart(2, "0")}`
          : ""
      );
      setSuccess("Fecha restaurada al calendario original.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restaurar");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <article className="rounded-2xl border border-[var(--feg-green)]/15 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
            {slot.num} · {slot.modalidad}
          </p>
          <p className="mt-1 text-sm text-[var(--feg-ink)]">
            {slot.originalFecha} · {slot.originalSede}
          </p>
        </div>
        {badge ? (
          <span className="inline-flex rounded-full bg-[var(--feg-yellow)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--feg-ink)]">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel htmlFor={`status-${slot.slotId}`}>Estado</FieldLabel>
          <select
            id={`status-${slot.slotId}`}
            className={selectClassName}
            value={status}
            onChange={(e) => setStatus(e.target.value as CalendarDateStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {status === "RESCHEDULED" ? (
          <>
            <div className="space-y-1.5">
              <FieldLabel htmlFor={`start-${slot.slotId}`}>Nueva fecha</FieldLabel>
              <input
                id={`start-${slot.slotId}`}
                type="date"
                className={inputClassName}
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor={`end-${slot.slotId}`}>Hasta (opcional, mismo mes)</FieldLabel>
              <input
                id={`end-${slot.slotId}`}
                type="date"
                className={inputClassName}
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
            {dateEnd ? (
              <div className="space-y-1.5">
                <FieldLabel htmlFor={`range-${slot.slotId}`}>Separador del rango</FieldLabel>
                <select
                  id={`range-${slot.slotId}`}
                  className={selectClassName}
                  value={rangeStyle}
                  onChange={(e) => setRangeStyle(e.target.value as "and" | "slash")}
                >
                  <option value="and">15 y 16</option>
                  <option value="slash">15/16</option>
                </select>
              </div>
            ) : null}
            <div className={`space-y-1.5 ${dateEnd ? "" : "sm:col-span-2"}`}>
              <FieldLabel htmlFor={`sede-${slot.slotId}`}>Sede</FieldLabel>
              <input
                id={`sede-${slot.slotId}`}
                type="text"
                className={inputClassName}
                value={sede}
                onChange={(e) => setSede(e.target.value)}
              />
            </div>
          </>
        ) : null}

        {status !== "SCHEDULED" ? (
          <div className="space-y-1.5 sm:col-span-2">
            <FieldLabel htmlFor={`note-${slot.slotId}`}>Nota pública (opcional)</FieldLabel>
            <textarea
              id={`note-${slot.slotId}`}
              className={inputClassName}
              rows={2}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Motivo o aclaración que se muestra en la web"
            />
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-[var(--feg-green-2)]">{success}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || restoring}
          className="inline-flex rounded-xl bg-[var(--feg-green-2)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={handleRestore}
          disabled={saving || restoring || slot.status === "SCHEDULED"}
          className="inline-flex rounded-xl border border-[var(--feg-green)]/25 bg-white px-4 py-2 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)] disabled:opacity-60"
        >
          {restoring ? "Restaurando…" : "Restaurar original"}
        </button>
      </div>
    </article>
  );
}

export function CalendarioEditor({
  mayores,
  menores,
}: {
  mayores: AdminCalendarSlot[];
  menores: AdminCalendarSlot[];
}) {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Mayores
        </h2>
        <div className="space-y-4">
          {mayores.map((slot) => (
            <SlotEditor key={slot.slotId} slot={slot} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Menores
        </h2>
        <div className="space-y-4">
          {menores.map((slot) => (
            <SlotEditor key={slot.slotId} slot={slot} />
          ))}
        </div>
      </section>
    </div>
  );
}
