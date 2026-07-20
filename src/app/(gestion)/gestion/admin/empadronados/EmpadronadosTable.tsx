"use client";

import { useMemo, useState } from "react";
import type { EmpadronadoExportRow } from "@/lib/admin-exports";
import { EmpadronadoEditModal } from "./EmpadronadoEditModal";

type Props = {
  rows: EmpadronadoExportRow[];
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );
}

/** Extrae año desde fecha DD/MM/YYYY o ISO. */
function birthYearFrom(fechaNacimiento: string): string {
  const s = fechaNacimiento.trim();
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return dmy[3];
  const iso = s.match(/^(\d{4})/);
  return iso?.[1] ?? "";
}

export function EmpadronadosTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [club, setClub] = useState("");
  const [categoria, setCategoria] = useState("");
  const [anioNacimiento, setAnioNacimiento] = useState("");
  const [handicap, setHandicap] = useState("");
  const [editing, setEditing] = useState<EmpadronadoExportRow | null>(null);

  const clubs = useMemo(() => uniqueSorted(rows.map((r) => r.club)), [rows]);
  const categorias = useMemo(
    () => uniqueSorted(rows.map((r) => r.categoria)),
    [rows]
  );
  const aniosNacimiento = useMemo(() => {
    const years = rows
      .map((r) => birthYearFrom(r.fechaNacimiento))
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => Number(b) - Number(a));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = normalize(search);
    return rows.filter((r) => {
      if (club && r.club !== club) return false;
      if (categoria && r.categoria !== categoria) return false;
      if (anioNacimiento && birthYearFrom(r.fechaNacimiento) !== anioNacimiento) {
        return false;
      }
      if (handicap) {
        const h = (r.tieneHandicap || "").trim();
        if (handicap === "Si" && h !== "Sí") return false;
        if (handicap === "No" && h !== "No") return false;
      }
      if (q) {
        const fullName = normalize(`${r.apellido} ${r.nombre} ${r.nombre} ${r.apellido}`);
        if (!fullName.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, club, categoria, anioNacimiento, handicap]);

  const hasFilters = Boolean(search || club || categoria || anioNacimiento || handicap);

  function clearFilters() {
    setSearch("");
    setClub("");
    setCategoria("");
    setAnioNacimiento("");
    setHandicap("");
  }

  const selectClass =
    "w-full rounded-xl border border-[var(--feg-green)]/20 bg-white px-4 py-2.5 text-sm text-[var(--feg-ink)] outline-none transition focus:border-[var(--feg-green-2)] focus:ring-2 focus:ring-[var(--feg-green)]/15";

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o apellido…"
          className={`sm:col-span-2 xl:col-span-2 ${selectClass}`}
        />
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          className={selectClass}
        >
          <option value="">Todos los clubes</option>
          {clubs.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={anioNacimiento}
          onChange={(e) => setAnioNacimiento(e.target.value)}
          className={selectClass}
          aria-label="Filtrar por año de nacimiento"
        >
          <option value="">Año de nacimiento</option>
          {aniosNacimiento.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={handicap}
          onChange={(e) => setHandicap(e.target.value)}
          className={selectClass}
          aria-label="Filtrar por handicap"
        >
          <option value="">Handicap (todos)</option>
          <option value="Si">Con handicap</option>
          <option value="No">Sin handicap</option>
        </select>
      </div>

      {hasFilters ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-[var(--feg-green)]/25 bg-white px-4 py-2.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
          >
            Limpiar filtros
          </button>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-[var(--feg-green)]/25 bg-white/80 p-8 text-center text-[var(--feg-green)]">
          No hay empadronados que coincidan con la búsqueda.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--feg-green)]/12 bg-white shadow-sm">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[var(--feg-green-soft)] text-white">
              <tr>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Jugador
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Categoría
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Nacimiento
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Handicap
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  DNI
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Club
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Localidad
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Registro
                </th>
                <th className="px-4 py-3 font-heading text-xs font-semibold uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={`${r.source}-${r.recordId}`}
                  className="border-t border-[var(--feg-green)]/10 hover:bg-[var(--feg-bg)]/60"
                >
                  <td className="px-4 py-3 font-medium text-[var(--feg-ink)]">
                    {r.apellido}, {r.nombre}
                    <span className="ml-1 text-xs text-[var(--feg-green)]">
                      ({r.sexo})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-ink)]">{r.categoria}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--feg-ink)]">
                    {r.fechaNacimiento || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-ink)]">
                    {r.tieneHandicap || "—"}
                    {r.tieneHandicap === "Sí" && r.handicap ? (
                      <span className="ml-1 text-xs text-[var(--feg-green)]">
                        ({r.handicap})
                      </span>
                    ) : null}
                    {r.tieneHandicap === "Sí" && r.matricula ? (
                      <span className="ml-1 text-xs text-[var(--feg-green)]">
                        mat. {r.matricula}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">{r.dni || "—"}</td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">{r.club}</td>
                  <td className="px-4 py-3 text-[var(--feg-green)]">
                    {r.localidad || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--feg-green)]">
                    {r.fechaRegistro}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setEditing(r)}
                      className="rounded-full border border-[var(--feg-green)]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)]"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--feg-green)]/10 px-4 py-3 text-xs text-[var(--feg-green)]">
            {hasFilters
              ? `${filtered.length} de ${rows.length} empadronados`
              : `Total: ${rows.length} empadronado${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>
      )}

      {editing ? (
        <EmpadronadoEditModal row={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}
