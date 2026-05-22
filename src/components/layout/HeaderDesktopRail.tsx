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

/** Espacio mínimo entre la cápsula de rutas y los grupos laterales. */
const SAFE_GAP_PX = 16;

/** Botón ✉️ + gap reservados entre rutas y la cápsula de búsqueda. */
const NOTIFICATIONS_RAIL_RESERVE_PX = 48;

type Props = {
  primaryLinks: NavLink[];
  navDropdownItems: NavDropdownItem[];
};

/**
 * Bloque desktop del Header (md+).
 *
 * Layout:
 * - Logo + wordmark (izquierda)
 * - Cápsula de rutas (absolutamente centrada al viewport)
 * - Notificaciones ✉️ + cápsula de búsqueda (derecha)
 *
 * Reglas:
 * - Los tres grupos NUNCA se superponen: se calcula `sideMax = (anchoRail - anchoRutas) / 2 - gap`
 *   y se aplica como `max-width` a los grupos laterales.
 * - El wordmark puede pasar a 2–3 renglones como máximo (dinámico según viewport), alineado a la izquierda.
 * - La cápsula de rutas no hace wrap de los botones (`flex-nowrap`).
 * - La cápsula de búsqueda comparte el bloque derecho con el botón ✉️; el ancho útil
 *   de la búsqueda descuenta el espacio reservado para notificaciones.
 * - El color del wordmark se ajusta al fondo (claro/oscuro) bajo el header.
 */
export function HeaderDesktopRail({ primaryLinks, navDropdownItems }: Props) {
  const pathname = usePathname();

  const railRef = useRef<HTMLDivElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const routesRef = useRef<HTMLDivElement | null>(null);

  const [sideMax, setSideMax] = useState<number | null>(null);
  const [leftWidth, setLeftWidth] = useState<number | null>(null);
  const [theme, setTheme] = useState<HeaderTheme>("light");

  // Calcula sideMax y leftWidth para garantizar no-superposición.
  useEffect(() => {
    const rail = railRef.current;
    const left = leftRef.current;
    const routes = routesRef.current;
    if (!rail || !left || !routes) return;

    let raf = 0;

    const compute = () => {
      raf = 0;
      const railW = rail.getBoundingClientRect().width;
      const routesW = routes.getBoundingClientRect().width;
      const available = Math.max(0, (railW - routesW) / 2 - SAFE_GAP_PX);
      setSideMax(available);

      // Re-medimos el ancho real del bloque izquierdo después de aplicar max-width
      requestAnimationFrame(() => {
        if (!left) return;
        setLeftWidth(left.getBoundingClientRect().width);
      });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };

    compute();

    const ro = new ResizeObserver(schedule);
    ro.observe(rail);
    ro.observe(routes);
    ro.observe(left);
    window.addEventListener("resize", schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Detecta el tema (claro/oscuro) bajo el header en cada scroll/resize/route.
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

  const wordmarkClass =
    theme === "dark"
      ? "text-[#FFFFFF] [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
      : "text-[var(--feg-green)]";

  // Ancho de la cápsula de búsqueda: replica el ancho real del bloque
  // logo+wordmark, capado a sideMax para evitar overlapping.
  const cappedSearchSide =
    sideMax != null ? Math.max(0, sideMax - NOTIFICATIONS_RAIL_RESERVE_PX) : null;
  const searchWidth =
    leftWidth != null && cappedSearchSide != null
      ? Math.min(leftWidth, cappedSearchSide)
      : leftWidth ?? null;

  return (
    <div
      ref={railRef}
      className="relative hidden min-h-14 items-center justify-between gap-3 md:flex"
    >
      <div
        ref={leftRef}
        className="min-w-0 shrink"
        style={sideMax != null ? { maxWidth: `${sideMax}px` } : undefined}
      >
        <Link
          href="/"
          aria-label="Inicio · Federación Entrerriana de Golf"
          className="relative z-10 inline-flex w-full max-w-full items-center gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2"
        >
          <FegLogo size="nav" className="shrink-0" />
          <span
            aria-hidden
            className={`line-clamp-3 min-w-0 flex-1 select-none text-left font-sans text-base font-normal leading-snug transition-colors duration-150 ${wordmarkClass}`}
          >
            Federación Entrerriana de Golf
          </span>
        </Link>
      </div>

      <div
        ref={routesRef}
        className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <nav className="flex max-w-[calc(100vw-2rem)] flex-nowrap items-center justify-center gap-2 rounded-full bg-white/70 px-3 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <NavLinks links={primaryLinks} variant="light" />
          <HeaderHoverNavGroup items={navDropdownItems} variant="light" />
        </nav>
      </div>

      <div
        className="flex min-w-0 shrink-0 items-center justify-end gap-2"
        style={
          searchWidth != null && sideMax != null
            ? {
                width: `${searchWidth + NOTIFICATIONS_RAIL_RESERVE_PX}px`,
                maxWidth: `${sideMax}px`,
              }
            : undefined
        }
      >
        <HeaderNotifications theme={theme} />
        <div
          className="min-w-0 flex-1 overflow-hidden"
          style={searchWidth != null ? { width: `${searchWidth}px`, minWidth: 0 } : undefined}
        >
          <div className="flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-full bg-white/70 px-2.5 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <NavSearch variant="desktop" className="w-full min-w-0 max-w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
