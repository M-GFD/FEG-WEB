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

type Props = {
  primaryLinks: NavLink[];
  navDropdownItems: NavDropdownItem[];
};

/**
 * Bloque desktop del Header (md+): logo, rutas centradas y búsqueda a la derecha.
 * Layout en flex (sin nav absoluta) para que la barra de búsqueda pueda encogerse
 * y nunca se superponga con la NavBar.
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
    <div className="relative hidden w-full min-h-14 items-center gap-2 md:flex md:gap-3">
      <Link
        href="/"
        aria-label="Inicio · FEG"
        className="relative z-10 inline-flex shrink-0 items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2"
      >
        <FegLogo size="nav" className="shrink-0" />
      </Link>

      <nav
        aria-label="Principal"
        className="flex min-w-0 flex-1 items-center justify-center overflow-hidden"
      >
        <div className="flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-hidden rounded-full bg-white/70 px-2 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:px-3">
          <NavLinks links={primaryLinks} variant="light" />
          <HeaderHoverNavGroup items={navDropdownItems} variant="light" />
        </div>
      </nav>

      <div className="relative z-10 flex min-w-0 shrink-[2] items-center justify-end gap-2">
        <HeaderNotifications theme={theme} className="shrink-0" />
        <div className="min-w-[4.5rem] w-[clamp(4.5rem,16vw,13.75rem)] max-w-[13.75rem] shrink">
          <NavSearch variant="desktop" className="w-full" />
        </div>
      </div>
    </div>
  );
}
