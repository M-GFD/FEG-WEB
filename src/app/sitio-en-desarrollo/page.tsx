"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FegLogo } from "@/components/layout/FegLogo";

function safeRedirect(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

function SitioEnDesarrolloInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect") ?? "/");

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");

    setPending(true);
    try {
      const res = await fetch("/api/preview-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError("Contraseña incorrecta.");
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("No se pudo verificar. Intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <FegLogo size="footer" className="mx-auto h-24 object-contain object-center sm:h-28" />
        <p className="mt-8 font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)] sm:text-2xl">
          Sitio en desarrollo
        </p>
        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4">
          <label htmlFor="preview-password" className="sr-only">
            Contraseña de acceso
          </label>
          <input
            id="preview-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Contraseña"
            className="w-full rounded-xl border border-[var(--feg-green)]/25 bg-white px-4 py-3 text-[var(--feg-ink)] shadow-sm outline-none ring-[var(--feg-green-2)]/30 focus:ring-2"
          />
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[var(--feg-ink)] py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Comprobando…" : "Entrar al sitio"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SitioEnDesarrolloPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--feg-bg)] text-[var(--feg-green)]">
          Cargando…
        </div>
      }
    >
      <SitioEnDesarrolloInner />
    </Suspense>
  );
}
