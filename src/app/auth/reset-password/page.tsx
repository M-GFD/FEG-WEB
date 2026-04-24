"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "./actions";
import { FegLogo } from "@/components/layout/FegLogo";

function ResetPasswordInner() {
  const sp = useSearchParams();
  const email = sp.get("email") ?? "";
  const token = sp.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const disabled = useMemo(() => !email || !token, [email, token]);

  async function onSubmit(formData: FormData) {
    setError(null);
    const res = await resetPassword(formData);
    if (!res.ok) {
      setError(res.error || "No se pudo restablecer la contraseña");
      return;
    }
    setOk(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <div className="flex justify-center">
          <FegLogo size="nav" className="h-16 object-center sm:h-[4.25rem]" />
        </div>

        <h1 className="mt-2 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Nueva contraseña
        </h1>

        {ok ? (
          <div className="mt-6 rounded-xl bg-[var(--feg-green-2)]/10 p-4 text-sm text-[var(--feg-green-2)]">
            Contraseña actualizada. Ya podés iniciar sesión.
            <div className="mt-3">
              <Link
                href="/auth/signin?reset=1"
                className="font-semibold text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                Ir a iniciar sesión →
              </Link>
            </div>
          </div>
        ) : (
          <form action={onSubmit} className="mt-6 space-y-4">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="token" value={token} />

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
                placeholder="••••••••"
                disabled={disabled}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-[var(--feg-green)]">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
                placeholder="••••••••"
                disabled={disabled}
              />
            </div>

            {disabled && (
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                El enlace no es válido. Solicitá uno nuevo.
              </p>
            )}

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-xl bg-[var(--feg-ink)] py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Guardar contraseña
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--feg-bg)] text-[var(--feg-green)]">
          Cargando…
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}

