import { FegLogoLink } from "@/components/layout/FegLogo";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { NavLinks } from "./NavLinks";
import { NavSearch } from "@/components/layout/NavSearch";

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
        <div className="relative mx-auto h-16 max-w-7xl px-6 lg:px-8">
          {/* Desktop:
              - Logo a la izquierda (flujo normal)
              - Search a la derecha (flujo normal, mismo margen que el logo)
              - Cápsula de rutas absolutamente centrada respecto al viewport */}
          <div className="hidden h-full items-center justify-between gap-3 md:flex">
            <div className="flex min-w-0 shrink-0 items-center gap-2">
              <FegLogoLink size="nav" />
              {/* Wordmark al lado del logo: 1 renglón, Urbanist regular, blanco, centrado verticalmente */}
              <span
                aria-hidden
                className="select-none whitespace-nowrap text-right font-sans text-base font-normal leading-none text-[#FFFFFF] [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
              >
                Federación Entrerriana de Golf
              </span>
            </div>

            <div className="shrink-0">
              <div className="flex items-center rounded-full bg-white/70 px-2.5 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <NavSearch variant="desktop" />
              </div>
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex"
            aria-hidden="false"
          >
            <nav className="pointer-events-auto flex items-center justify-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <NavLinks links={navLinks} variant="light" />
            </nav>
          </div>

          {/* Mobile: logo izquierda, search al centro, menú derecha */}
          <div className="flex h-full items-center justify-between gap-3 md:hidden">
            <div className="min-w-0 shrink">
              <FegLogoLink size="nav" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center rounded-full bg-white/70 px-2.5 py-1.5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <NavSearch variant="mobile" className="w-full min-w-0" />
              </div>
            </div>

            <MobileHeaderMenu links={navLinks} />
          </div>
        </div>
      </header>
      {/* Altura del header fijo (pt-4 + fila única en todos los anchos) */}
      <div
        aria-hidden
        className="pointer-events-none h-[calc(1rem+4rem)] shrink-0 select-none"
      />
    </div>
  );
}
