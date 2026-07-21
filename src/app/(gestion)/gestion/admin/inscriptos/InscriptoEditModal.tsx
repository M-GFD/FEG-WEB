"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { InscriptoExportRow } from "@/lib/admin-exports";
import { FieldLabel, inputClassName } from "@/app/empadronamiento-menores/form-ui";
import { INSCRIPCION_CLUBS } from "@/lib/inscripcion-torneos-menores/constants";
import { updateInscripto } from "./actions";

type Props = {
  row: InscriptoExportRow;
  onClose: () => void;
};

function toDateInputValue(fecha: string): string {
  const s = fecha.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  return "";
}

type YesNo = "Sí" | "No" | "";

type FormState = {
  torneo: string;
  apellido: string;
  nombre: string;
  sexo: string;
  fechaNacimiento: string;
  categoria: string;
  dni: string;
  club: string;
  tieneHandicap: YesNo;
  matricula: string;
  juegaPrejuveniles: YesNo;
  esPrincipiante: YesNo;
  responsable: string;
  responsableTelefono: string;
  responsableEmail: string;
  restriccionAlimentaria: YesNo;
  alimentos: string;
  comentarios: string;
};

function toYesNo(value: string): YesNo {
  if (value === "Sí" || value === "No") return value;
  return "";
}

function rowToForm(row: InscriptoExportRow): FormState {
  return {
    torneo: row.torneo,
    apellido: row.apellido,
    nombre: row.nombre,
    sexo: row.sexo === "Mujer" || row.sexo === "F" ? "Mujer" : "Varón",
    fechaNacimiento: toDateInputValue(row.fechaNacimiento),
    categoria: row.categoria,
    dni: row.dni,
    club: row.club,
    tieneHandicap: toYesNo(row.tieneHandicap),
    matricula: row.matricula,
    juegaPrejuveniles: toYesNo(row.juegaPrejuveniles),
    esPrincipiante: toYesNo(row.esPrincipiante),
    responsable: row.responsable,
    responsableTelefono: row.responsableTelefono,
    responsableEmail: row.responsableEmail,
    restriccionAlimentaria: toYesNo(row.restriccionAlimentaria),
    alimentos: row.alimentos,
    comentarios: row.comentarios,
  };
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
    </div>
  );
}

export function InscriptoEditModal({ row, onClose }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(() => rowToForm(row));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setForm(rowToForm(row));
    setError(null);
  }, [row]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await updateInscripto({
        recordId: row.recordId,
        ...form,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-[#002403]/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inscripto-edit-title"
        className="relative z-10 my-4 w-full max-w-2xl rounded-2xl border border-[var(--feg-green)]/15 bg-white shadow-[0_24px_64px_rgba(0,36,3,0.2)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--feg-green)]/10 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
          <div>
            <h2
              id="inscripto-edit-title"
              className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]"
            >
              Editar inscripción
            </h2>
            <p className="mt-1 text-sm text-[var(--feg-green)]">
              {row.apellido}, {row.nombre}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--feg-green)]/15 px-3 py-1.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
          >
            Cerrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-5 sm:px-6">
          <section className="space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
              Torneo y jugador
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="torneo" label="Torneo (clave)">
                  <input
                    id="torneo"
                    required
                    value={form.torneo}
                    onChange={(e) => set("torneo", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field id="apellido" label="Apellido">
                <input
                  id="apellido"
                  required
                  value={form.apellido}
                  onChange={(e) => set("apellido", e.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field id="nombre" label="Nombre">
                <input
                  id="nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field id="sexo" label="Sexo">
                <select
                  id="sexo"
                  required
                  value={form.sexo}
                  onChange={(e) => set("sexo", e.target.value)}
                  className={inputClassName}
                >
                  <option value="Varón">Varón</option>
                  <option value="Mujer">Mujer</option>
                </select>
              </Field>
              <Field id="fechaNacimiento" label="Fecha de nacimiento">
                <input
                  id="fechaNacimiento"
                  type="date"
                  required
                  value={form.fechaNacimiento}
                  onChange={(e) => set("fechaNacimiento", e.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field id="categoria" label="Categoría">
                <input
                  id="categoria"
                  value={form.categoria}
                  onChange={(e) => set("categoria", e.target.value)}
                  className={inputClassName}
                  placeholder="Se recalcula si se deja vacía"
                />
              </Field>
              <Field id="dni" label="DNI">
                <input
                  id="dni"
                  value={form.dni}
                  onChange={(e) => set("dni", e.target.value)}
                  className={inputClassName}
                  placeholder="Opcional si no cambia"
                />
              </Field>
              <Field id="club" label="Club">
                <input
                  id="club"
                  list="inscripto-clubs"
                  required
                  value={form.club}
                  onChange={(e) => set("club", e.target.value)}
                  className={inputClassName}
                />
                <datalist id="inscripto-clubs">
                  {INSCRIPCION_CLUBS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field id="tieneHandicap" label="Tiene handicap">
                <select
                  id="tieneHandicap"
                  value={form.tieneHandicap}
                  onChange={(e) => set("tieneHandicap", e.target.value as YesNo)}
                  className={inputClassName}
                >
                  <option value="">—</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </Field>
              <Field id="matricula" label="Matrícula">
                <input
                  id="matricula"
                  value={form.matricula}
                  onChange={(e) => set("matricula", e.target.value)}
                  className={inputClassName}
                  disabled={form.tieneHandicap === "No"}
                />
              </Field>
              <Field id="juegaPrejuveniles" label="Juega Prejuveniles">
                <select
                  id="juegaPrejuveniles"
                  value={form.juegaPrejuveniles}
                  onChange={(e) =>
                    set("juegaPrejuveniles", e.target.value as YesNo)
                  }
                  className={inputClassName}
                >
                  <option value="">—</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </Field>
              <Field id="esPrincipiante" label="Principiante">
                <select
                  id="esPrincipiante"
                  value={form.esPrincipiante}
                  onChange={(e) => set("esPrincipiante", e.target.value as YesNo)}
                  className={inputClassName}
                >
                  <option value="">—</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
              Responsable y extras
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="responsable" label="Responsable de carga">
                <input
                  id="responsable"
                  required
                  value={form.responsable}
                  onChange={(e) => set("responsable", e.target.value)}
                  className={inputClassName}
                />
              </Field>
              <Field id="responsableTelefono" label="Tel. responsable">
                <input
                  id="responsableTelefono"
                  value={form.responsableTelefono}
                  onChange={(e) => set("responsableTelefono", e.target.value)}
                  className={inputClassName}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="responsableEmail" label="Email responsable">
                  <input
                    id="responsableEmail"
                    type="email"
                    value={form.responsableEmail}
                    onChange={(e) => set("responsableEmail", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field id="restriccionAlimentaria" label="Restricción alimentaria">
                <select
                  id="restriccionAlimentaria"
                  value={form.restriccionAlimentaria}
                  onChange={(e) =>
                    set("restriccionAlimentaria", e.target.value as YesNo)
                  }
                  className={inputClassName}
                >
                  <option value="">—</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </Field>
              <Field id="alimentos" label="Alimentos a evitar">
                <input
                  id="alimentos"
                  value={form.alimentos}
                  onChange={(e) => set("alimentos", e.target.value)}
                  className={inputClassName}
                  disabled={form.restriccionAlimentaria === "No"}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="comentarios" label="Comentarios">
                  <textarea
                    id="comentarios"
                    rows={3}
                    value={form.comentarios}
                    onChange={(e) => set("comentarios", e.target.value)}
                    className={inputClassName}
                  />
                </Field>
              </div>
            </div>
          </section>

          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--feg-green)]/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--feg-green)]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[var(--feg-green-2)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
            >
              {submitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
