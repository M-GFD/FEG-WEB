"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavDropdownItem } from "@/lib/nav-dropdowns";

const TRIGGER_LIGHT =
  "inline-flex items-center gap-1 rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-[#24321c] shadow-[0_0_10px_rgba(255,255,255,0.35),0_0_20px_rgba(255,255,255,0.18)] transition hover:bg-white/70 hover:text-[#123c15]";

const TRIGGER_LIGHT_OPEN =
  "inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#123c15] shadow-[0_0_10px_rgba(255,255,255,0.35),0_0_20px_rgba(255,255,255,0.18)]";

const TRIGGER_DARK =
  "inline-flex items-center gap-1 rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.22),0_0_22px_rgba(255,255,255,0.12)] transition hover:bg-white/12 hover:text-white";

const TRIGGER_DARK_OPEN =
  "inline-flex items-center gap-1 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_10px_rgba(255,255,255,0.22),0_0_22px_rgba(255,255,255,0.12)]";

const CLOSE_DELAY_MS = 120;

type Props = {
  items: NavDropdownItem[];
  variant?: "dark" | "light";
};

type MenuProps = {
  item: NavDropdownItem;
  variant: "dark" | "light";
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
};

function HoverNavMenu({ item, variant, open, onEnter, onLeave }: MenuProps) {
  const isLight = variant === "light";
  const triggerClass = open
    ? isLight
      ? TRIGGER_LIGHT_OPEN
      : TRIGGER_DARK_OPEN
    : isLight
      ? TRIGGER_LIGHT
      : TRIGGER_DARK;

  return (
    <div
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onLeave();
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className={`${triggerClass} whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--feg-green)]/40`}
      >
        {item.label}
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute left-1/2 top-full z-[100] w-max -translate-x-1/2 pt-2">
          <div className="min-w-[11rem] rounded-2xl border border-[var(--feg-green)]/18 bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(0,36,3,0.14)] backdrop-blur-md">
            {item.links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24321c] transition hover:bg-[var(--feg-bg)] focus-visible:bg-[var(--feg-bg)] focus-visible:outline-none"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Menús desplegables del nav: hover para abrir; solo uno desplegado a la vez. */
export function HeaderHoverNavGroup({ items, variant = "light" }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const handleEnter = (id: string) => {
    clearCloseTimer();
    setOpenId(id);
  };

  const handleLeave = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  return (
    <>
      {items.map((item) => (
        <HoverNavMenu
          key={item.id}
          item={item}
          variant={variant}
          open={openId === item.id}
          onEnter={() => handleEnter(item.id)}
          onLeave={handleLeave}
        />
      ))}
    </>
  );
}
