"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { changePasswordFromProfile } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  signInRequired: "Debes iniciar sesión.",
  unauthorized: "No tenés permiso para cambiar la contraseña.",
  currentRequired: "La contraseña actual es obligatoria.",
  passwordMin: "La nueva contraseña debe tener al menos 6 caracteres.",
  passwordMismatch: "Las contraseñas nuevas no coinciden.",
  currentIncorrect: "La contraseña actual no es correcta.",
  invalidData: "Datos inválidos.",
  userNotFound: "No se encontró tu cuenta.",
  configIncomplete: "Configuración incompleta. Contactá a la federación.",
  error: "No se pudo cambiar la contraseña. Intentá de nuevo.",
};

function fieldClass() {
  return "w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2";
}

export function PerfilChangePassword() {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReLoginModal, setShowReLoginModal] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await changePasswordFromProfile(formData);

      if (result.ok) {
        setExpanded(false);
        e.currentTarget.reset();
        setShowReLoginModal(true);
        return;
      }

      if ("errorMessage" in result && result.errorMessage) {
        setError(result.errorMessage);
      } else {
        setError(ERROR_MESSAGES[result.errorKey] ?? ERROR_MESSAGES.error);
      }
    } finally {
      setBusy(false);
    }
  }

  function handleCancel() {
    setExpanded(false);
    setError(null);
  }

  return (
    <>
      <div className="rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_14px_40px_rgba(0,36,3,0.06)]">
        <h2 className="font-heading text-lg font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Contraseña
        </h2>
        <p className="mt-2 text-sm text-[var(--feg-green)]">
          Actualizá la contraseña de tu cuenta de gestión.
        </p>

        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-4 rounded-xl bg-[var(--feg-green-2)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Cambiar contraseña
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
              >
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className={fieldClass()}
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
              >
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className={fieldClass()}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
              >
                Confirmar nueva contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                className={fieldClass()}
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-xl bg-[var(--feg-green-2)] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
              >
                {busy ? "Guardando…" : "Guardar nueva contraseña"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={busy}
                className="rounded-xl border border-[var(--feg-green)]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[var(--feg-green-2)] transition hover:bg-[var(--feg-bg)] disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {showReLoginModal ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <div className="absolute inset-0 bg-[#002403]/45 backdrop-blur-[2px]" aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="perfil-relogin-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--feg-green)]/12 bg-white p-6 shadow-[0_20px_60px_rgba(0,36,3,0.18)] sm:p-8"
          >
            <h2
              id="perfil-relogin-title"
              className="font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]"
            >
              Contraseña actualizada
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--feg-green)]">
              Por seguridad, debés volver a iniciar sesión con tu nueva contraseña.
            </p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="mt-6 w-full rounded-xl bg-[var(--feg-green-2)] py-3 text-sm font-semibold text-white transition hover:brightness-95"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
