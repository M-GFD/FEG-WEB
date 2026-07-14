"use client";

import { useEffect, useRef, useState } from "react";
import { FegLogoLink } from "@/components/layout/FegLogo";
import { HeaderNotifications } from "@/components/layout/HeaderNotifications";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { NavSearch } from "@/components/layout/NavSearch";
import { HeaderDesktopRail } from "@/components/layout/HeaderDesktopRail";
import { HeaderNavCapsule, type HeaderNavLink } from "@/components/layout/HeaderNavCapsule";
import { FegLogo } from "@/components/layout/FegLogo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import type { NavDropdownItem } from "@/lib/nav-dropdowns";

/** Margen horizontal del header (padding del contenedor + reserva). */
const HEADER_HORIZONTAL_RESERVE_PX = 40;

const HEADER_SCROLL_DELTA_PX = 8;
const HEADER_SCROLL_TOP_ALWAYS_VISIBLE_PX = 48;

function useHeaderScrollVisibility() {
  const [visible, setVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;

      if (currentY <= HEADER_SCROLL_TOP_ALWAYS_VISIBLE_PX) {
        setVisible(true);
      } else if (delta > HEADER_SCROLL_DELTA_PX) {
        setVisible(false);
      } else if (delta < -HEADER_SCROLL_DELTA_PX) {
        setVisible(true);
      }

      lastScrollYRef.current = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}

type Props = {
  primaryLinks: readonly HeaderNavLink[];
  navDropdownItems: NavDropdownItem[];
};

/**
 * Header completo: elige layout móvil cuando el viewport no alcanza para
 * logo + nav centrada + búsqueda sin recortar ni superponer.
 */
export function HeaderBar({ primaryLinks, navDropdownItems }: Props) {
  const [useMobileLayout, setUseMobileLayout] = useState(true);
  const headerVisible = useHeaderScrollVisibility();
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const update = () => {
      const needed = el.scrollWidth + HEADER_HORIZONTAL_RESERVE_PX;
      setUseMobileLayout(window.innerWidth < needed);
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update, { passive: true });
    update();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [primaryLinks, navDropdownItems]);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 bg-transparent pt-4 transition-transform duration-300 ease-out will-change-transform ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="relative mx-auto min-h-16 max-w-7xl px-6 md:max-w-none md:px-4 md:py-2 lg:px-6">
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 -z-[100] flex items-center gap-3 opacity-0"
          >
            <FegLogo size="nav" className="shrink-0" />
            <HeaderNavCapsule
              primaryLinks={primaryLinks}
              navDropdownItems={navDropdownItems}
            />
            <div className="flex shrink-0 items-center gap-2">
              <div className="h-9 w-9 shrink-0" />
              <div className="h-9 w-9 shrink-0" />
              <div className="h-9 w-[13.75rem] shrink-0 rounded-full bg-white/70" />
            </div>
          </div>

          {useMobileLayout ? (
            <div className="grid w-full grid-cols-[minmax(0,auto)_minmax(0,1fr)_2.75rem_2.75rem_2.75rem] items-center gap-2">
              <div className="min-w-0">
                <FegLogoLink size="nav" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <NavSearch variant="mobile" className="w-full min-w-0 max-w-full" />
              </div>
              <LocaleSwitcher
                headerContrast="light"
                className="flex h-11 w-full max-w-[2.75rem] justify-center justify-self-center"
              />
              <HeaderNotifications
                theme="light"
                headerVisible={headerVisible}
                className="flex h-11 w-full max-w-[2.75rem] justify-center justify-self-center"
              />
              <MobileHeaderMenu
                primaryLinks={primaryLinks}
                navDropdownItems={navDropdownItems}
                headerVisible={headerVisible}
              />
            </div>
          ) : (
            <HeaderDesktopRail
              primaryLinks={[...primaryLinks]}
              navDropdownItems={navDropdownItems}
              headerVisible={headerVisible}
            />
          )}
        </div>
      </header>

      <div
        aria-hidden
        className={`pointer-events-none shrink-0 select-none ${
          useMobileLayout
            ? "h-[calc(1rem+4rem)]"
            : "h-[calc(1rem+1rem+5.25rem)]"
        }`}
      />
    </>
  );
}
