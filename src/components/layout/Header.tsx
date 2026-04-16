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
      <header className="fixed left-0 right-0 top-0 z-50 isolate bg-transparent pt-4">
        {/* Sombra en gradiente (blanco): muchas paradas para caída de opacidad progresiva */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.76) 9%, rgba(255,255,255,0.62) 19%, rgba(255,255,255,0.5) 30%, rgba(255,255,255,0.38) 41%, rgba(255,255,255,0.28) 52%, rgba(255,255,255,0.19) 63%, rgba(255,255,255,0.12) 74%, rgba(255,255,255,0.06) 85%, rgba(255,255,255,0.02) 94%, transparent 100%)",
          }}
        />
        <div className="relative z-[1]">
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
