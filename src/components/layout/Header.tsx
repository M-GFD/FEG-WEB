import Link from "next/link";
import { auth } from "@/lib/auth";
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

export async function Header() {
  const session = await auth();
  const navLinks = [...NAV_ITEMS];

  return (
    <div>
      <header className="fixed left-0 right-0 top-0 z-50 bg-transparent pt-4 shadow-[0_1px_0_rgba(0,36,3,0.06),0_10px_40px_-10px_rgba(0,36,3,0.12),0_18px_48px_-14px_rgba(0,0,0,0.06)]">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <FegLogoLink size="nav" />

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <nav className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <NavLinks links={navLinks} variant="light" />
          </nav>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          {session?.user ? (
            <Link
              href="/gestion"
              className="rounded-full bg-[#f3e12b] px-5 py-2.5 font-sans text-sm font-semibold text-[#002403] transition hover:brightness-95"
            >
              Gestión
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signup"
                className="rounded-full border border-[#123c15]/20 bg-white/60 px-4 py-2 text-sm font-medium text-[#123c15] transition hover:bg-white/80"
              >
                Registrarse
              </Link>
              <Link
                href="/auth/signin"
                className="rounded-full bg-[#f3e12b] px-5 py-2.5 font-heading text-sm font-semibold text-[#002403] transition hover:brightness-95"
              >
                Entrar
              </Link>
            </div>
          )}
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
