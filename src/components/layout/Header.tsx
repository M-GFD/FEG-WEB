import { FegLogoLink } from "@/components/layout/FegLogo";
import { HeaderNotifications } from "@/components/layout/HeaderNotifications";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { NavSearch } from "@/components/layout/NavSearch";
import { HeaderDesktopRail } from "@/components/layout/HeaderDesktopRail";

const NAV_ITEMS = [
  { href: "/noticias", label: "Noticias" },
  { href: "/ranking", label: "Rankings" },
  { href: "/clubes", label: "Clubes" },
  { href: "/torneos", label: "Torneos" },
  { href: "/calendario", label: "Calendario" },
  { href: "/institucional", label: "Institucional" },
] as const;

export function Header() {
  const navLinks = [...NAV_ITEMS];

  return (
    <div>
      <header className="fixed left-0 right-0 top-0 z-50 bg-transparent pt-4">
        {/* Mobile: contenido limitado a max-w-7xl con su padding habitual.
            Desktop (md+): casi full-viewport para distribuir logo / rutas / search a lo ancho. */}
        <div className="relative mx-auto min-h-16 max-w-7xl px-6 md:max-w-none md:px-4 md:py-2 lg:px-6">
          {/* Desktop:
              - Logo + wordmark a la izquierda
              - Cápsula de rutas absolutamente centrada respecto al viewport
              - Cápsula de búsqueda a la derecha con el MISMO ancho que el bloque
                logo+wordmark (sincronizado por JS, capado para no superponerse) */}
          <HeaderDesktopRail navLinks={navLinks} />

          {/* Mobile: grid para que el sobre no quede fuera de vista (p. ej. iOS Safari). */}
          {/* Columnas 3–4 con ancho fijo (2.75rem): aunque el sobre no renderice, la búsqueda no invade ese hueco (iOS). */}
          <div className="grid w-full grid-cols-[minmax(0,auto)_minmax(0,1fr)_2.75rem_2.75rem] items-center gap-2 md:hidden">
            <div className="min-w-0">
              <FegLogoLink size="nav" />
            </div>

            <div className="min-w-0 overflow-hidden">
              <div className="flex min-w-0 max-w-full items-center overflow-hidden rounded-full bg-white/70 px-2.5 py-1.5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <NavSearch variant="mobile" className="w-full min-w-0 max-w-full" />
              </div>
            </div>

            <HeaderNotifications theme="light" className="flex h-11 w-full max-w-[2.75rem] justify-center justify-self-center" />

            <MobileHeaderMenu links={navLinks} />
          </div>
        </div>
      </header>
      {/* Altura del header fijo (pt-4 + fila única en todos los anchos) */}
      <div
        aria-hidden
        className="pointer-events-none h-[calc(1rem+4rem)] shrink-0 select-none md:h-[calc(1rem+1rem+5.25rem)]"
      />
    </div>
  );
}
