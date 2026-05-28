"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FegLogo } from "@/components/layout/FegLogo";
import { NavLinks } from "@/components/layout/NavLinks";
import { HeaderHoverNavGroup } from "@/components/layout/HeaderHoverNavGroup";
import { NavSearch } from "@/components/layout/NavSearch";
import { HeaderNotifications } from "@/components/layout/HeaderNotifications";
import type { NavDropdownItem } from "@/lib/nav-dropdowns";

type HeaderTheme = "dark" | "light";

type NavLink = { href: string; label: string };

/** Ancho de la barra de búsqueda (antes ligado al bloque logo + wordmark). */
const DESKTOP_SEARCH_BAR_WIDTH_PX = 220;

/** Botón ✉️ + gap reservados junto a la búsqueda. */
const NOTIFICATIONS_RAIL_RESERVE_PX = 48;

type Props = {
  primaryLinks: NavLink[];
  navDropdownItems: NavDropdownItem[];
};

/**
 * Bloque desktop del Header (md+): logo, rutas centradas y búsqueda a la derecha.
 */
export function HeaderDesktopRail({ primaryLinks, navDropdownItems }: Props) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<HeaderTheme>("light");

  useEffect(() => {
    let raf = 0;
    function compute() {
      raf = 0;
      const x = Math.max(40, Math.min(window.innerWidth - 40, window.innerWidth / 2));
      const y = 90;
      const stack = document.elementsFromPoint(x, y);
      let next: HeaderTheme = "light";
      for (const el of stack) {
        if (!(el instanceof HTMLElement)) continue;
        if (el.closest("header")) continue;
        const t =
          el.dataset.headerTheme ||
          el.closest<HTMLElement>("[data-header-theme]")?.dataset.headerTheme;
        if (t === "dark" || t === "light") {
          next = t;
          break;
        }
      }
      setTheme((prev) => (prev === next ? prev : next));
    }

    function onScrollOrResize() {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    }

    raf = requestAnimationFrame(compute);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return (
    <div className="relative hidden min-h-14 items-center justify-between gap-3 md:flex">
      <Link
        href="/"
        aria-label="Inicio · FEG"
        className="relative z-10 inline-flex shrink-0 items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2"
      >
        <FegLogo size="nav" className="shrink-0" />
      </Link>

      <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <nav className="flex max-w-[calc(100vw-2rem)] flex-nowrap items-center justify-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <NavLinks links={primaryLinks} variant="light" />
          <HeaderHoverNavGroup items={navDropdownItems} variant="light" />
        </nav>
      </div>

      <div
        className="relative z-10 ml-auto flex shrink-0 items-center justify-end gap-2"
        style={{ width: `${DESKTOP_SEARCH_BAR_WIDTH_PX + NOTIFICATIONS_RAIL_RESERVE_PX}px` }}
      >
        <HeaderNotifications theme={theme} />
        <div
          className="shrink-0 overflow-hidden"
          style={{ width: `${DESKTOP_SEARCH_BAR_WIDTH_PX}px` }}
        >
          <div className="flex w-full items-center overflow-hidden rounded-full bg-white/70 px-2 py-1 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <NavSearch variant="desktop" className="w-full min-w-0 max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
