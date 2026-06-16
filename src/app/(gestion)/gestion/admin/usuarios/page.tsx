"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { createUser, getClubsForAdmin } from "./actions";

const ROLE_LABELS: Record<string, string> = {
  CLUB: "Club",
  PRESS: "Prensa",
  TREASURER: "Tesorería",
};

function AdminUsuariosForm() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role") ?? "CLUB";
  const initialRole =
    roleParam === "PRESS" || roleParam === "TREASURER" ? roleParam : "CLUB";

  const [role, setRole] = useState(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getClubsForAdmin().then(setClubs);
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setEmailWarning(null);
    setCreatedEmail(null);
    formData.set("role", role);
    const result = await createUser(formData);
    if (result.ok) {
      setSuccess(true);
      setCreatedEmail(String(formData.get("email") ?? ""));
      if ("emailSent" in result && result.emailSent === false) {
        setEmailWarning(
          result.emailError ??
            "No se pudo enviar el email de verificación. Revisá RESEND_API_KEY y EMAIL_FROM en el servidor."
        );
      }
      (
        document.getElementById("create-user-form") as HTMLFormElement
      )?.reset();
    } else {
      setError(result.error ?? "Error al crear usuario");
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
          Crear usuario {ROLE_LABELS[role] ?? ""}
        </h1>
        <p className="mt-1 text-sm text-[var(--feg-green)]">
          Se enviará un email de verificación al correo indicado. El usuario debe
          confirmarlo antes de iniciar sesión y cambiar la contraseña temporal en
          su primer acceso.
        </p>
      </div>

      <div className="flex gap-2">
        {(["CLUB", "PRESS", "TREASURER"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setSuccess(false);
              setError(null);
              setEmailWarning(null);
              setCreatedEmail(null);
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              role === r
                ? "bg-[var(--feg-green-2)] text-white"
                : "border border-[var(--feg-green)]/20 bg-white text-[var(--feg-ink)] hover:bg-[var(--feg-bg)]"
            }`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]">
        <form
          id="create-user-form"
          action={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
              placeholder="usuario@ejemplo.com"
            />
          </div>

          {role === "CLUB" && (
            <div>
              <label
                htmlFor="clubId"
                className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
              >
                Club
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
            </div>
          )}

          <div>
            <label
              htmlFor="temporaryPassword"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Contraseña temporal
            </label>
            <input
              id="temporaryPassword"
              name="temporaryPassword"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/25 focus:ring-2"
              placeholder="Mínimo 6 caracteres"
            />
            <p className="mt-1 text-xs text-[var(--feg-green)]/80">
              Entregá esta contraseña de forma segura. El usuario la cambiará en
              su primer login.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
              Usuario {ROLE_LABELS[role] ?? ""} creado correctamente.
              {createdEmail && !emailWarning && (
                <>
                  {" "}
                  Se envió un email de verificación a{" "}
                  <span className="font-medium">{createdEmail}</span>.
                </>
              )}
            </p>
          )}
          {emailWarning && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              {emailWarning}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--feg-green-2)] py-3 font-semibold text-white transition hover:brightness-95"
          >
            Crear usuario {ROLE_LABELS[role] ?? ""}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsuariosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-[var(--feg-green)]">
          Cargando…
        </div>
      }
    >
      <AdminUsuariosForm />
    </Suspense>
  );
}
