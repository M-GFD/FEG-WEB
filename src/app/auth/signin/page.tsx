"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { FegLogo } from "@/components/layout/FegLogo";
import { resendVerification } from "@/app/auth/verify-email/actions";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/gestion";
  const registered = searchParams.get("registered") === "1";
  const verified = searchParams.get("verified") === "1";
  const reset = searchParams.get("reset") === "1";
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email?.trim()) {
      setError("Ingresa tu email");
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña");
      return;
    }

    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "EMAIL_NOT_VERIFIED") {
        setError("Tu email aún no está verificado.");
        setBusy(true);
        try {
          await resendVerification(email.trim().toLowerCase());
          setInfo("Te reenviamos el email de verificación.");
        } finally {
          setBusy(false);
        }
        return;
      }
      setError("Email o contraseña incorrectos");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <div className="flex justify-center">
          <FegLogo
            size="nav"
            className="h-16 object-center sm:h-[4.25rem]"
          />
        </div>
        <h1 className="mt-2 text-center font-heading text-2xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Iniciar sesión
        </h1>

        {registered && (
          <p className="mb-4 mt-4 rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
            Cuenta creada. Revisá tu email para verificarla antes de ingresar.
          </p>
        )}
        {verified && (
          <p className="mb-4 mt-4 rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
            Email verificado. Ya podés iniciar sesión.
          </p>
        )}
        {reset && (
          <p className="mb-4 mt-4 rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
            Contraseña actualizada. Ya podés iniciar sesión.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-[var(--feg-green)]"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-[var(--feg-ink)] outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
              placeholder="••••••••"
            />
            <div className="mt-2 flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl bg-[var(--feg-green-2)]/10 p-3 text-sm text-[var(--feg-green-2)]">
              {info}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-[var(--feg-green-2)] py-3 font-semibold text-white transition hover:brightness-95"
          >
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--feg-green)]">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/signup" className="font-medium text-[var(--feg-green-2)] underline-offset-2 hover:underline">
            Registrarse
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-[var(--feg-green)]">
          <Link href="/" className="font-medium underline-offset-2 hover:text-[var(--feg-ink)] hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--feg-bg)] text-[var(--feg-green)]">
          Cargando…
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
