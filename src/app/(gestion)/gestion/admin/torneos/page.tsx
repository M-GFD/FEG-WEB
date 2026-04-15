"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createTournament, getClubsForTournament } from "./actions";

export default function AdminTorneosPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getClubsForTournament().then(setClubs);
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    const result = await createTournament(formData);
    if (result.ok) {
      setSuccess(true);
      (
        document.getElementById("create-tournament-form") as HTMLFormElement
      )?.reset();
    } else {
      setError(result.error ?? "Error al crear torneo");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/gestion/admin"
          className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
        >
          ← Volver a administración
        </Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Crear torneo
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          El torneo quedará asignado al club que elijas. El club lo verá en su
          panel de gestión y podrá cargar resultados y enviar fotos.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]">
        <form
          id="create-tournament-form"
          action={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Nombre del torneo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
              placeholder="Ej: 18H Mayores - Los Bretes"
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Fecha
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="clubId"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Club organizador
            </label>
            <select
              id="clubId"
              name="clubId"
              required
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
            >
              <option value="">Seleccioná el club</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--feg-green)]/80">
              El club seleccionado verá este torneo en su panel y podrá enviar
              fotos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isTeamEvent"
              name="isTeamEvent"
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--feg-green)]/30 text-[var(--feg-green-2)] focus:ring-[var(--feg-green-2)]/25"
            />
            <label
              htmlFor="isTeamEvent"
              className="text-sm font-medium text-[var(--feg-green)]"
            >
              Es torneo por equipos
            </label>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
              Torneo creado correctamente. El club ya puede verlo en su panel.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--feg-green-2)] py-3 font-semibold text-white transition hover:brightness-95"
          >
            Crear torneo
          </button>
        </form>
      </div>
    </div>
  );
}
