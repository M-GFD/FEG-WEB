import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--feg-bg)] px-4 py-10">
      <div className="max-w-md rounded-2xl border border-[var(--feg-green)]/12 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,36,3,0.1)]">
        <h1 className="font-heading text-xl font-semibold uppercase tracking-tight text-[var(--feg-ink)]">
          Acceso no autorizado
        </h1>
        <p className="mt-3 text-sm text-[var(--feg-green)]">
          No tenés permiso para ver esa sección de gestión. Si creés que es un error,
          contactá a la federación.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/gestion"
            className="rounded-xl bg-[var(--feg-green-2)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Ir a mi panel
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--feg-ink)] transition hover:border-[var(--feg-green-2)]/40"
          >
            Web pública
          </Link>
        </div>
      </div>
    </div>
  );
}
