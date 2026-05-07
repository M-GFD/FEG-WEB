"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function GateInner() {
  const sp = useSearchParams();
  const redirect = sp.get("redirect") ?? "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/preview-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error === "disabled" ? "Acceso directo disponible." : "Contraseña incorrecta.");
        return;
      }
      window.location.href = redirect.startsWith("/") ? redirect : "/";
    } catch {
      setError("No se pudo verificar. Intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-900 px-4 py-12 text-stone-100">
      <h1 className="font-heading text-xl font-semibold uppercase tracking-tight">Sitio en desarrollo</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-stone-400">
        Ingresá la clave de acceso para continuar.
      </p>
      <form onSubmit={onSubmit} className="mt-8 w-full max-w-xs space-y-4">
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          className="w-full rounded-xl border border-stone-600 bg-stone-800 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Contraseña"
        />
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function SitioEnDesarrolloPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-900 text-stone-400">Cargando…</div>
      }
    >
      <GateInner />
    </Suspense>
  );
}
