"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FegLogo } from "@/components/layout/FegLogo";
import { NavSearch } from "@/components/layout/NavSearch";

type HeaderTheme = "dark" | "light";

/**
 * Bloque desktop del Header:
 * - Izquierda: logo + wordmark (Urbanist regular).
 * - Derecha: cápsula de búsqueda cuyo ANCHO se sincroniza con el del bloque
 *   logo+wordmark vía ResizeObserver, para que ambos extremos sean simétricos.
 *
 * El color del wordmark se ajusta dinámicamente al fondo de la sección que
 * está actualmente debajo del header: blanco sobre fondos oscuros, verde FEG
 * sobre fondos claros. Para detectarlo, busca la sección con el atributo
 * `data-header-theme` que está justo debajo del header.
 */
export function HeaderDesktopRail() {
  const pathname = usePathname();
  const leftRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [theme, setTheme] = useState<HeaderTheme>("light");

  // Sincroniza el ancho del search con el de logo+wordmark.
  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const update = () => setWidth(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Detecta el tema (claro/oscuro) bajo el header en cada scroll/resize/route.
  useEffect(() => {
    let raf = 0;
    function compute() {
      raf = 0;
      const x = Math.max(40, Math.min(window.innerWidth - 40, window.innerWidth / 2));
      // Justo debajo del header (header alto ≈ 64px + 16px padding superior).
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

    // Primer cálculo después de pintar (asegura que el DOM ya está listo).
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

  return (
    <div className="hidden h-full items-center justify-between gap-3 md:flex">
      <div ref={leftRef} className="min-w-0 shrink-0">
        <Link
          href="/"
          aria-label="Inicio · Federación Entrerriana de Golf"
          className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123c15]/40 focus-visible:ring-offset-2"
        >
          <FegLogo size="nav" />
          <span
            aria-hidden
            className={`select-none whitespace-nowrap text-right font-sans text-base font-normal leading-none transition-colors duration-150 ${wordmarkClass}`}
          >
            Federación Entrerriana de Golf
          </span>
        </Link>
      </div>

      <div
        className="shrink-0"
        style={width ? { width: `${width}px` } : undefined}
      >
        <div className="flex w-full items-center rounded-full bg-white/70 px-2.5 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <NavSearch variant="desktop" className="w-full min-w-0" />
        </div>
      </div>
    </div>
  );
}
