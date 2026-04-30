import { FegLogoLink } from "@/components/layout/FegLogo";
import { FooterGestionLink } from "@/components/layout/FooterGestionLink";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--feg-green)]/15 bg-white text-[var(--feg-ink)]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <FegLogoLink size="footer" className="ring-offset-white" />
          <div
            className="w-full flex-1 rounded-2xl border border-[var(--feg-green)]/12 bg-[var(--feg-bg)] px-4 py-4 font-sans sm:px-5 md:px-6"
            aria-label="Información legal y de contacto"
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                  Contacto
                </p>
                <div className="mt-2 space-y-1 text-sm text-[var(--feg-green)]">
                  <p>Federación Entrerriana de Golf</p>
                  <p>+54 (343) 555-1234</p>
                  <p>contacto@feg.ar</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                  Sede
                </p>
                <div className="mt-2 space-y-1 text-sm text-[var(--feg-green)]">
                  <p>San Martín 1234 (ej.)</p>
                  <p>Paraná, Entre Ríos</p>
                  <p>C.P. 3100 (ej.)</p>
                  <p>Lun a Vie · 9:00–17:00 (ej.)</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
                  Legales
                </p>
                <div className="mt-2 space-y-1 text-sm text-[var(--feg-green)]">
                  <p>Términos y condiciones (ej.)</p>
                  <p>Política de privacidad (ej.)</p>
                  <p>Defensa del consumidor (ej.)</p>
                  <p>CUIT: 30-00000000-0 (ej.)</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--feg-green)]/70">
              Datos ficticios a modo de ejemplo.
            </p>
          </div>
        </div>
        <div className="mt-8 flex w-full flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-xs text-[var(--feg-green)]/60">
            © {new Date().getFullYear()} Federación Entrerriana de Golf
          </p>
          <FooterGestionLink />
        </div>
      </div>
    </footer>
  );
}
