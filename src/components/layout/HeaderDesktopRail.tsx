"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FegLogo } from "@/components/layout/FegLogo";
import { NavSearch } from "@/components/layout/NavSearch";
import { HeaderNotifications } from "@/components/layout/HeaderNotifications";
import { HeaderNavCapsule, type HeaderNavLink } from "@/components/layout/HeaderNavCapsule";
import type { NavDropdownItem } from "@/lib/nav-dropdowns";

type HeaderTheme = "dark" | "light";

type Props = {
  primaryLinks: HeaderNavLink[];
  navDropdownItems: NavDropdownItem[];
};

/** Desktop: NavBar centrada en el header; solo se renderiza si hay espacio (ver HeaderBar). */
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
    <div className="relative flex w-full min-h-14 items-center">
      <div className="relative z-20 inline-flex shrink-0 items-center">
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
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="pointer-events-auto">
          <HeaderNavCapsule
            primaryLinks={primaryLinks}
            navDropdownItems={navDropdownItems}
          />
        </div>
      </nav>

      <div className="relative z-20 ml-auto flex shrink-0 items-center justify-end gap-2">
        <HeaderNotifications theme={theme} className="shrink-0" />
        <div className="w-[13.75rem] shrink-0">
          <NavSearch variant="desktop" className="w-full" />
        </div>
      </div>
    </div>
  );
}
