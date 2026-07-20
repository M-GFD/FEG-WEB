"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { EmpadronadoExportRow } from "@/lib/admin-exports";
import { FieldLabel, inputClassName } from "@/app/empadronamiento-menores/form-ui";
import {
  EMPADRONAMIENTO_BLOOD_GROUPS,
  EMPADRONAMIENTO_CLUBS,
  EMPADRONAMIENTO_DEPARTMENTS,
} from "@/lib/empadronamiento-menores/constants";
import { updateEmpadronado } from "./actions";

type Props = {
  row: EmpadronadoExportRow;
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

type FormState = {
  apellido: string;
  nombre: string;
  sexo: string;
  fechaNacimiento: string;
  categoria: string;
  dni: string;
  club: string;
  responsable: string;
  responsableTelefono: string;
  telefono: string;
  email: string;
  direccion: string;
  departamento: string;
  localidad: string;
  escuela: string;
  tieneHandicap: "Sí" | "No" | "";
  handicap: string;
  matricula: string;
  profesores: string;
  tutor1Nombre: string;
  tutor1Dni: string;
  tutor1Telefono: string;
  tutor1Email: string;
  tutor2Nombre: string;
  tutor2Dni: string;
  tutor2Email: string;
  obraSocial: string;
  grupoSanguineo: string;
  condicionesSalud: string;
  comentarios: string;
};

function rowToForm(row: EmpadronadoExportRow): FormState {
  const handicap =
    row.tieneHandicap === "Sí" || row.tieneHandicap === "No"
      ? row.tieneHandicap
      : ("" as const);
  return {
    apellido: row.apellido,
    nombre: row.nombre,
    sexo: row.sexo === "Mujer" || row.sexo === "F" ? "Mujer" : "Varón",
    fechaNacimiento: toDateInputValue(row.fechaNacimiento),
    categoria: row.categoria,
    dni: row.dni,
    club: row.club,
    responsable: row.responsable,
    responsableTelefono: row.responsableTelefono,
    telefono: row.telefono,
    email: row.email,
    direccion: row.direccion,
    departamento: row.departamento,
    localidad: row.localidad,
    escuela: row.escuela,
    tieneHandicap: handicap,
    handicap: row.handicap ?? "",
    matricula: row.matricula,
    profesores: row.profesores,
    tutor1Nombre: row.tutor1Nombre,
    tutor1Dni: row.tutor1Dni,
    tutor1Telefono: row.tutor1Telefono,
    tutor1Email: row.tutor1Email,
    tutor2Nombre: row.tutor2Nombre,
    tutor2Dni: row.tutor2Dni,
    tutor2Email: row.tutor2Email,
    obraSocial: row.obraSocial,
    grupoSanguineo: row.grupoSanguineo,
    condicionesSalud: row.condicionesSalud,
    comentarios: row.comentarios,
  };
}

const fieldClass = inputClassName;

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

export function EmpadronadoEditModal({ row, onClose }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(() => rowToForm(row));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isPlayerOnly = row.source === "player";

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
      const res = await updateEmpadronado({
        recordId: row.recordId,
        source: row.source,
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
        aria-labelledby="empadronado-edit-title"
        className="relative z-10 my-4 w-full max-w-3xl rounded-2xl border border-[var(--feg-green)]/15 bg-white shadow-[0_24px_64px_rgba(0,36,3,0.2)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--feg-green)]/10 bg-white/95 px-5 py-4 backdrop-blur-md sm:px-6">
          <div>
            <h2
              id="empadronado-edit-title"
              className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]"
            >
              Editar empadronado
            </h2>
            <p className="mt-1 text-sm text-[var(--feg-green)]">
              {row.apellido}, {row.nombre}
              {isPlayerOnly
                ? " · Origen: padrón importado (campos limitados)"
                : " · Origen: formulario web"}
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
          {isPlayerOnly ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Este registro viene del padrón importado. Solo se guardan nombre, sexo,
              nacimiento, categoría, DNI, club, handicap y matrícula. El resto de campos
              se habilitan al completar el formulario web de empadronamiento.
            </p>
          ) : null}

          <section className="space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
              Datos del jugador
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="apellido" label="Apellido">
                <input
                  id="apellido"
                  required
                  value={form.apellido}
                  onChange={(e) => set("apellido", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="nombre" label="Nombre">
                <input
                  id="nombre"
                  required
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="sexo" label="Sexo">
                <select
                  id="sexo"
                  required
                  value={form.sexo}
                  onChange={(e) => set("sexo", e.target.value)}
                  className={fieldClass}
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
                  className={fieldClass}
                />
              </Field>
              <Field id="categoria" label="Categoría">
                <input
                  id="categoria"
                  value={form.categoria}
                  onChange={(e) => set("categoria", e.target.value)}
                  className={fieldClass}
                  placeholder="Se recalcula si se deja vacía"
                />
              </Field>
              <Field id="dni" label="DNI">
                <input
                  id="dni"
                  required
                  value={form.dni}
                  onChange={(e) => set("dni", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="club" label="Club">
                <input
                  id="club"
                  list="empadronado-clubs"
                  required
                  value={form.club}
                  onChange={(e) => set("club", e.target.value)}
                  className={fieldClass}
                />
                <datalist id="empadronado-clubs">
                  {EMPADRONAMIENTO_CLUBS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field id="tieneHandicap" label="Tiene handicap">
                <select
                  id="tieneHandicap"
                  value={form.tieneHandicap}
                  onChange={(e) => {
                    const next = e.target.value as FormState["tieneHandicap"];
                    set("tieneHandicap", next);
                    if (next !== "Sí") set("handicap", "");
                  }}
                  className={fieldClass}
                >
                  <option value="">—</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </Field>
              {form.tieneHandicap === "Sí" ? (
                <Field id="handicap" label="Handicap">
                  <input
                    id="handicap"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={0}
                    max={54}
                    required
                    value={form.handicap}
                    onChange={(e) => set("handicap", e.target.value)}
                    className={fieldClass}
                    placeholder="Ej: 12 o 12.4"
                  />
                </Field>
              ) : null}
              <Field id="matricula" label="Matrícula">
                <input
                  id="matricula"
                  value={form.matricula}
                  onChange={(e) => set("matricula", e.target.value)}
                  className={fieldClass}
                  disabled={form.tieneHandicap === "No"}
                />
              </Field>
            </div>
          </section>

          <fieldset disabled={isPlayerOnly} className="space-y-4 disabled:opacity-60">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
              Contacto y domicilio
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="responsable" label="Responsable de carga">
                <input
                  id="responsable"
                  value={form.responsable}
                  onChange={(e) => set("responsable", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="responsableTelefono" label="Tel. responsable">
                <input
                  id="responsableTelefono"
                  value={form.responsableTelefono}
                  onChange={(e) => set("responsableTelefono", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="telefono" label="Teléfono jugador">
                <input
                  id="telefono"
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="email" label="Email">
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="direccion" label="Dirección">
                <input
                  id="direccion"
                  value={form.direccion}
                  onChange={(e) => set("direccion", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="departamento" label="Departamento">
                <select
                  id="departamento"
                  value={form.departamento}
                  onChange={(e) => set("departamento", e.target.value)}
                  className={fieldClass}
                >
                  <option value="">—</option>
                  {EMPADRONAMIENTO_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="localidad" label="Localidad">
                <input
                  id="localidad"
                  value={form.localidad}
                  onChange={(e) => set("localidad", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="escuela" label="Escuela">
                <input
                  id="escuela"
                  value={form.escuela}
                  onChange={(e) => set("escuela", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="profesores" label="Profesores (separados por coma)">
                  <input
                    id="profesores"
                    value={form.profesores}
                    onChange={(e) => set("profesores", e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              </div>
            </div>

            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
              Tutores
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="tutor1Nombre" label="Tutor 1">
                <input
                  id="tutor1Nombre"
                  value={form.tutor1Nombre}
                  onChange={(e) => set("tutor1Nombre", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="tutor1Dni" label="DNI tutor 1">
                <input
                  id="tutor1Dni"
                  value={form.tutor1Dni}
                  onChange={(e) => set("tutor1Dni", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="tutor1Telefono" label="Tel. tutor 1">
                <input
                  id="tutor1Telefono"
                  value={form.tutor1Telefono}
                  onChange={(e) => set("tutor1Telefono", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="tutor1Email" label="Email tutor 1">
                <input
                  id="tutor1Email"
                  value={form.tutor1Email}
                  onChange={(e) => set("tutor1Email", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="tutor2Nombre" label="Tutor 2">
                <input
                  id="tutor2Nombre"
                  value={form.tutor2Nombre}
                  onChange={(e) => set("tutor2Nombre", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="tutor2Dni" label="DNI tutor 2">
                <input
                  id="tutor2Dni"
                  value={form.tutor2Dni}
                  onChange={(e) => set("tutor2Dni", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="tutor2Email" label="Email tutor 2">
                <input
                  id="tutor2Email"
                  value={form.tutor2Email}
                  onChange={(e) => set("tutor2Email", e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-[var(--feg-green-2)]">
              Salud y comentarios
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="obraSocial" label="Obra social">
                <input
                  id="obraSocial"
                  value={form.obraSocial}
                  onChange={(e) => set("obraSocial", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field id="grupoSanguineo" label="Grupo sanguíneo">
                <select
                  id="grupoSanguineo"
                  value={form.grupoSanguineo}
                  onChange={(e) => set("grupoSanguineo", e.target.value)}
                  className={fieldClass}
                >
                  <option value="">—</option>
                  {EMPADRONAMIENTO_BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="condicionesSalud" label="Condiciones de salud">
                  <textarea
                    id="condicionesSalud"
                    rows={3}
                    value={form.condicionesSalud}
                    onChange={(e) => set("condicionesSalud", e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field id="comentarios" label="Comentarios">
                  <textarea
                    id="comentarios"
                    rows={3}
                    value={form.comentarios}
                    onChange={(e) => set("comentarios", e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              </div>
            </div>
          </fieldset>

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
