"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { smoothScrollToElementId } from "@/lib/smoothScroll";

type NavLink = { href: string; label: string };

type NavLinksProps = {
  links: NavLink[];
  variant?: "dark" | "light";
};

function handleAnchorClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string
) {
  if (!href.startsWith("/#")) return;
  const id = href.slice(2);
  if (pathname === "/") {
    e.preventDefault();
    smoothScrollToElementId(id);
  }
}

/** Glow suave, misma intensidad para todos los ítems (sin estado activo). */
const NAV_LINK_LIGHT =
  "rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-[#24321c] shadow-[0_0_10px_rgba(255,255,255,0.35),0_0_20px_rgba(255,255,255,0.18)] transition hover:bg-white/70 hover:text-[#123c15]";

const NAV_LINK_DARK =
  "rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.22),0_0_22px_rgba(255,255,255,0.12)] transition hover:bg-white/12 hover:text-white";

const NAV_LINK_MOBILE_LIGHT =
  "shrink-0 rounded-full bg-white/50 px-3 py-1.5 text-xs font-semibold text-[#24321c] shadow-[0_0_8px_rgba(255,255,255,0.35),0_0_16px_rgba(255,255,255,0.18)] transition hover:bg-white/70";

const NAV_LINK_MOBILE_DARK =
  "shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_8px_rgba(255,255,255,0.22),0_0_16px_rgba(255,255,255,0.12)] transition hover:bg-white/15";

export function NavLinks({ links, variant = "dark" }: NavLinksProps) {
  const pathname = usePathname();
  const isLight = variant === "light";
  const base = isLight ? NAV_LINK_LIGHT : NAV_LINK_DARK;

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={(e) => handleAnchorClick(e, href, pathname ?? "")}
          className={base}
        >
          {label}
        </Link>
      ))}
    </>
  );
}

export function NavLinksMobile({ links, variant = "dark" }: NavLinksProps) {
  const pathname = usePathname();
  const isLight = variant === "light";
  const base = isLight ? NAV_LINK_MOBILE_LIGHT : NAV_LINK_MOBILE_DARK;

  return (
    <>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={(e) => handleAnchorClick(e, href, pathname ?? "")}
          className={base}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
