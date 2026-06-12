"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { NavDropdownItem } from "@/lib/nav-dropdowns";

export type MobileNavLink = { href: string; label: string };

type Props = {
  primaryLinks: readonly MobileNavLink[];
  navDropdownItems: NavDropdownItem[];
};

const PANEL_TRANSITION_MS = 300;

export function MobileHeaderMenu({ primaryLinks, navDropdownItems }: Props) {
  const tNav = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [renderPanel, setRenderPanel] = useState(false);
  const [panelActive, setPanelActive] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setExpandedId(null);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setRenderPanel(true);
      const frame = requestAnimationFrame(() => setPanelActive(true));
      return () => cancelAnimationFrame(frame);
    }

    setPanelActive(false);
    const timer = window.setTimeout(() => setRenderPanel(false), PANEL_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  const toggleSection = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const panel = renderPanel ? (
    <div className="fixed inset-0 z-[200]" role="presentation">
      <button
        type="button"
        aria-label={tNav("closeMenu")}
        onClick={close}
        className={`absolute inset-0 bg-[#002403]/45 backdrop-blur-[2px] transition-opacity duration-300 ${
          panelActive ? "opacity-100" : "opacity-0"
        }`}
      />

      <nav
        role="dialog"
        aria-modal="true"
        aria-label={tNav("menu")}
        className={`absolute right-0 top-0 flex h-dvh w-[min(100%,20rem)] flex-col border-l border-[var(--feg-green)]/15 bg-white/98 shadow-[-16px_0_48px_rgba(0,36,3,0.14)] backdrop-blur-md transition-transform duration-300 ease-out ${
          panelActive ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--feg-green)]/10 px-5 py-4">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]">
            {tNav("menu")}
          </p>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--feg-green)]/12 text-[var(--feg-ink)] transition hover:bg-[var(--feg-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feg-green)]"
            aria-label={tNav("closeMenu")}
          >
            <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <ul className="space-y-1">
            {primaryLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className="block rounded-xl px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-[#24321c] transition hover:bg-[var(--feg-bg)] focus-visible:bg-[var(--feg-bg)] focus-visible:outline-none"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-2 border-t border-[var(--feg-green)]/10 pt-4">
            {navDropdownItems.map(({ id, label, links }) => {
              const isExpanded = expandedId === id;

              return (
                <div
                  key={id}
                  className="overflow-hidden rounded-2xl border border-[var(--feg-green)]/10 bg-[var(--feg-bg)]/40"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(id)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-heading text-sm font-semibold uppercase tracking-wide text-[#24321c] transition hover:bg-white/70 focus-visible:bg-white/70 focus-visible:outline-none"
                  >
                    {label}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[var(--feg-green-2)] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                      isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <ul className="overflow-hidden border-t border-[var(--feg-green)]/10 bg-white/80">
                      {links.map(({ href, label: linkLabel }) => (
                        <li key={`${id}-${href}`}>
                          <Link
                            href={href}
                            onClick={close}
                            className="block px-4 py-3 pl-6 text-sm font-semibold text-[#24321c] transition hover:bg-[var(--feg-bg)] focus-visible:bg-[var(--feg-bg)] focus-visible:outline-none"
                          >
                            {linkLabel}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#123c15]/12 bg-white/80 text-[#123c15] shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:bg-white hover:shadow-[0_12px_34px_rgba(0,0,0,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feg-green)]"
        aria-label={tNav("openMenu")}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Menu className="h-5 w-5" strokeWidth={2.25} aria-hidden />
      </button>

      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
