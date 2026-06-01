"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FegLogo } from "@/components/layout/FegLogo";
import { NavLinks } from "@/components/layout/NavLinks";
import { HeaderHoverNavGroup } from "@/components/layout/HeaderHoverNavGroup";
import { NavSearch } from "@/components/layout/NavSearch";
import { HeaderNotifications } from "@/components/layout/HeaderNotifications";
import type { NavDropdownItem } from "@/lib/nav-dropdowns";

type HeaderTheme = "dark" | "light";

type NavLink = { href: string; label: string };

/** Separación mínima entre la NavBar centrada y logo / búsqueda. */
const NAV_SIDE_GAP_PX = 12;

type Props = {
  primaryLinks: NavLink[];
  navDropdownItems: NavDropdownItem[];
};

/**
 * Desktop: NavBar siempre centrada en el header (50% del contenedor).
 * Los laterales se miden con ResizeObserver para acotar el ancho de la nav
 * y que la búsqueda pueda encogerse sin superponerse.
 */
export function HeaderDesktopRail({ primaryLinks, navDropdownItems }: Props) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<HeaderTheme>("light");
  const railRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [navMaxWidth, setNavMaxWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const rail = railRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!rail || !left || !right) return;

    const update = () => {
      const side = Math.max(left.offsetWidth, right.offsetWidth) + NAV_SIDE_GAP_PX;
      const max = Math.max(0, rail.offsetWidth - side * 2);
      setNavMaxWidth((prev) => (prev === max ? prev : max));
    };

    const ro = new ResizeObserver(update);
    ro.observe(rail);
    ro.observe(left);
    ro.observe(right);
    update();
    return () => ro.disconnect();
  }, []);

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
    <div
      ref={railRef}
      className="relative hidden w-full min-h-14 items-center md:flex"
    >
      <div ref={leftRef} className="relative z-20 inline-flex shrink-0 items-center">
        <Link
          href="/"
          aria-label="Inicio · FEG"
          className="inline-flex items-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2"
        >
          <FegLogo size="nav" className="shrink-0" />
        </Link>
      </div>

      <nav
        aria-label="Principal"
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 max-w-full -translate-x-1/2 -translate-y-1/2"
        style={navMaxWidth != null ? { maxWidth: navMaxWidth } : undefined}
      >
        <div className="pointer-events-auto mx-auto flex max-w-full flex-nowrap items-center justify-center gap-2 overflow-hidden rounded-full bg-white/70 px-2 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:px-3">
          <NavLinks links={primaryLinks} variant="light" />
          <HeaderHoverNavGroup items={navDropdownItems} variant="light" />
        </div>
      </nav>

      <div
        ref={rightRef}
        className="relative z-20 ml-auto flex min-w-0 shrink items-center justify-end gap-2"
      >
        <HeaderNotifications theme={theme} className="shrink-0" />
        <div className="min-w-[4.5rem] w-[clamp(4.5rem,16vw,13.75rem)] max-w-[13.75rem] shrink">
          <NavSearch variant="desktop" className="w-full" />
        </div>
      </div>
    </div>
  );
}
