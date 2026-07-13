"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { canAccessGestionArea } from "@/lib/gestion-access";
import { gestionSignOutAction } from "@/app/(gestion)/gestion/actions";

type NavItem = { href: string; label: string };

function linksForRole(role: Role): NavItem[] {
  const out: NavItem[] = [];

  if (canAccessGestionArea(role, "admin")) {
    out.push({ href: "/gestion/admin", label: "Administración" });
  }
  if (canAccessGestionArea(role, "prensa")) {
    out.push({ href: "/gestion/prensa", label: "Prensa" });
  }
  if (canAccessGestionArea(role, "club")) {
    out.push({ href: "/gestion/club", label: "Club" });
  }
  if (canAccessGestionArea(role, "tesoreria")) {
    out.push({ href: "/gestion/tesoreria", label: "Tesorería" });
  }

  out.push({ href: "/gestion/perfil", label: "Mis datos" });

  return out;
}

function linkActive(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href === "/gestion/club" && pathname.startsWith("/gestion/club/"))
    return true;
  if (href === "/gestion/prensa" && pathname.startsWith("/gestion/prensa/"))
    return true;
  if (href === "/gestion/admin" && pathname.startsWith("/gestion/admin/"))
    return true;
  return false;
}

export function GestionSidebar({ role }: { role: Role }) {
  const links = linksForRole(role);
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-[var(--feg-green-soft)] text-white md:sticky md:top-0 md:h-dvh md:max-h-dvh md:w-64 md:shrink-0 md:self-start md:overflow-hidden md:border-b-0 md:border-r md:border-white/10">
      <div className="shrink-0 border-b border-white/10 p-5">
        <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--feg-yellow)]">
          Gestión FEG
        </p>
        <p className="mt-1 text-sm text-white/70">Panel interno</p>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-4">
        {links.map((item) => {
          const active = linkActive(pathname, item.href);
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                  : "text-white/75 hover:bg-white/8 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto shrink-0 space-y-2 border-t border-white/10 p-4">
        <Link
          href="/"
          className="block w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Volver a la web pública
        </Link>
        <form action={gestionSignOutAction}>
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--feg-yellow)] px-3 py-2.5 text-sm font-semibold text-[var(--feg-ink)] transition hover:brightness-95"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
