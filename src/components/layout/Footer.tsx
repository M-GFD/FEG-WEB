import { FegLogoLink } from "@/components/layout/FegLogo";
import { FooterGestionLink } from "@/components/layout/FooterGestionLink";

const CONTACT_EMAIL = "fgolf.entrerios@gmail.com";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--feg-green)]/15 bg-white text-[var(--feg-ink)]">
      <div className="mx-auto max-w-7xl px-6 py-5 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <FegLogoLink size="nav" className="ring-offset-white" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                Contacto
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-0.5 text-sm font-medium text-[var(--feg-green)] underline-offset-2 transition hover:text-[var(--feg-green-2)] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:justify-end">
            <p className="text-xs text-[var(--feg-green)]/60">
              © {new Date().getFullYear()} Federación Entrerriana de Golf
            </p>
            <FooterGestionLink />
          </div>
        </div>
      </div>
    </footer>
  );
}
