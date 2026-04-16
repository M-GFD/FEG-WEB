import { FegLogoLink } from "@/components/layout/FegLogo";
import { NavLinks, NavLinksMobile } from "./NavLinks";

const NAV_ITEMS = [
  { href: "/#noticias", label: "Noticias" },
  { href: "/ranking", label: "Rankings" },
  { href: "/clubes", label: "Clubes" },
  { href: "/torneos", label: "Torneos" },
  { href: "/#proximos-torneos", label: "Calendario" },
  { href: "/institucional", label: "Institucional" },
] as const;

export function Header() {
  const navLinks = [...NAV_ITEMS];

  return (
    <div>
      <header className="fixed left-0 right-0 top-0 z-50 bg-transparent pt-4">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <FegLogoLink size="nav" />

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <nav className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <NavLinks links={navLinks} variant="light" />
          </nav>
        </div>
      </div>

      <div className="md:hidden px-4 pb-2">
        <nav className="flex gap-2 overflow-x-auto rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <NavLinksMobile links={navLinks} variant="light" />
        </nav>
      </div>
    </header>
      {/* Altura equivalente al header fijo (pt-4 + fila + nav móvil) para no tapar el contenido */}
      <div
        aria-hidden
        className="pointer-events-none h-[calc(1rem+4rem+4.25rem)] shrink-0 select-none md:h-[calc(1rem+4rem)]"
      />
    </div>
  );
}
