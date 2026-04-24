"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";
import { FegLogo } from "@/components/layout/FegLogo";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setError(null);
    try {
      const res = await requestPasswordReset(formData);
      if (!res.ok) {
        setError(res.error ?? "No se pudo enviar el correo. Revisá la configuración de email del servidor.");
        return;
      }
      setSent(true);
    } catch {
      setError("No se pudo procesar la solicitud. Intenta de nuevo.");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <div className="flex justify-center">
          <FegLogo size="nav" className="h-16 object-center sm:h-[4.25rem]" />
        </div>

        <h1 className="mt-2 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Recuperar contraseña
        </h1>
        <p className="mt-3 text-center text-sm font-medium leading-relaxed text-[var(--feg-green)]">
          Te enviaremos un enlace para crear una nueva contraseña.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl bg-[var(--feg-green-2)]/10 p-4 text-sm text-[var(--feg-green-2)]">
            Si el email existe, te enviamos un enlace para restablecer la contraseña.
            <div className="mt-3">
              <Link
                href="/auth/signin"
                className="font-semibold text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                Volver a iniciar sesión →
              </Link>
            </div>
          </div>
        ) : (
          <form action={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
                placeholder="tu@email.com"
              />
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--feg-ink)] py-3 font-semibold text-white transition hover:brightness-110"
            >
              Enviar enlace
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-[var(--feg-green)]">
          <Link href="/auth/signin" className="font-medium underline-offset-2 hover:text-[var(--feg-ink)] hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

