import { FegLogoLink } from "@/components/layout/FegLogo";

export function Footer() {
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
        <p className="mt-8 text-center text-xs text-[var(--feg-green)]/60 sm:text-left">
          © {new Date().getFullYear()} Federación Entrerriana de Golf
        </p>
      </div>
    </footer>
  );
}
