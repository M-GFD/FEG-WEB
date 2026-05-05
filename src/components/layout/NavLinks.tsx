"use client";

import Link from "next/link";

type NavLink = { href: string; label: string };

type NavLinksProps = {
  links: NavLink[];
  variant?: "dark" | "light";
};

/** Glow suave, misma intensidad para todos los ítems (sin estado activo). */
const NAV_LINK_LIGHT =
  "rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-[#24321c] shadow-[0_0_10px_rgba(255,255,255,0.35),0_0_20px_rgba(255,255,255,0.18)] transition hover:bg-white/70 hover:text-[#123c15]";

const NAV_LINK_DARK =
  "rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.22),0_0_22px_rgba(255,255,255,0.12)] transition hover:bg-white/12 hover:text-white";

export function NavLinks({ links, variant = "dark" }: NavLinksProps) {
  const isLight = variant === "light";
  const base = isLight ? NAV_LINK_LIGHT : NAV_LINK_DARK;

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={base}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
