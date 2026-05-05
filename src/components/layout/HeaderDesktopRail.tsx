"use client";

import { useEffect, useRef, useState } from "react";
import { FegLogoLink } from "@/components/layout/FegLogo";
import { NavSearch } from "@/components/layout/NavSearch";

/**
 * Bloque desktop del Header:
 * - Izquierda: logo + wordmark (Urbanist regular).
 * - Derecha: cápsula de búsqueda cuyo ANCHO se sincroniza con el del bloque
 *   logo+wordmark vía ResizeObserver, para que ambos extremos sean simétricos.
 */
export function HeaderDesktopRail() {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);

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

  return (
    <div className="hidden h-full items-center justify-between gap-3 md:flex">
      <div ref={leftRef} className="flex min-w-0 shrink-0 items-center gap-2">
        <FegLogoLink size="nav" />
        <span
          aria-hidden
          className="select-none whitespace-nowrap text-right font-sans text-base font-normal leading-none text-[#FFFFFF] [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]"
        >
          Federación Entrerriana de Golf
        </span>
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
