import { FegLogoLink } from "@/components/layout/FegLogo";

const FEG_PUBLIC_ORIGIN =
  (process.env.NEXT_PUBLIC_FEG_PUBLIC_URL ?? "https://www.feg.ar").replace(
    /\/$/,
    ""
  );

export function Footer() {
  const gestionHref = `${FEG_PUBLIC_ORIGIN}/gestion`;

  return (
    <footer className="mt-auto border-t border-[var(--feg-green)]/15 bg-white text-[var(--feg-ink)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <FegLogoLink size="footer" className="ring-offset-white" />
          <div
            className="min-h-[4rem] flex-1 max-w-md rounded-2xl border border-dashed border-[var(--feg-green)]/20 bg-[var(--feg-bg)] px-4 py-3 sm:max-w-lg"
            aria-label="Información de contacto"
          />
        </div>
        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-1 text-center text-xs text-[var(--feg-green)]/60 sm:justify-start">
          <span>
            © {new Date().getFullYear()} Federación Entrerriana de Golf
          </span>
          {/* Enlace deliberadamente discreto a gestión (conocido por el equipo interno) */}
          <a
            href={gestionHref}
            className="inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded text-[var(--feg-green)] opacity-[0.16] no-underline transition hover:opacity-40 focus-visible:opacity-55 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--feg-green)]/25"
            aria-label="Gestión web"
          >
            <span aria-hidden className="select-none text-[11px] leading-none">
              ·
            </span>
          </a>
        </p>
      </div>
    </footer>
  );
}
