import { FegLogoLink } from "@/components/layout/FegLogo";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { NavLinks } from "./NavLinks";

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
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-6 lg:px-8">
        <div className="min-w-0 shrink">
          <FegLogoLink size="nav" />
        </div>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <nav className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <NavLinks links={navLinks} variant="light" />
          </nav>
        </div>

        <MobileHeaderMenu links={navLinks} />
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
