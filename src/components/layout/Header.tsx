import Link from "next/link";
import { auth } from "@/lib/auth";
import { NavLinks, NavLinksMobile } from "./NavLinks";

const NAV_ITEMS = [
  { href: "/#noticias", label: "Noticias" },
  { href: "/ranking", label: "Rankings" },
  { href: "/clubes", label: "Clubes" },
  { href: "/torneos", label: "Torneos" },
  { href: "/institucional", label: "Institucional" },
] as const;

export async function Header() {
  const session = await auth();
  const navLinks = [...NAV_ITEMS];

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="relative z-10 font-heading text-xl font-semibold tracking-tight text-[#123c15]"
        >
          FEG
        </Link>

        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
          <nav className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <NavLinks links={navLinks} variant="light" />
          </nav>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          {session?.user ? (
            <Link
              href="/gestion"
              className="rounded-full bg-[#f3e12b] px-5 py-2.5 font-heading text-sm font-semibold text-[#002403] transition hover:brightness-95"
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
  );
}
