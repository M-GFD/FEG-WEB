"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  audienceQueryHref,
  AUDIENCE_SEGMENT_LABELS,
  type AudienceSegment,
} from "@/lib/content-audience";

const AUDIENCE_LINKS: { path: string; label: string }[] = [
  { path: "/ranking", label: "Rankings" },
  { path: "/calendario", label: "Calendario" },
  { path: "/torneos", label: "Torneos" },
  { path: "/noticias", label: "Noticias" },
];

type Props = {
  segment: AudienceSegment;
  variant?: "dark" | "light";
};

const TRIGGER_LIGHT =
  "inline-flex items-center gap-1 rounded-full bg-white/55 px-4 py-2 text-sm font-semibold text-[#24321c] shadow-[0_0_10px_rgba(255,255,255,0.35),0_0_20px_rgba(255,255,255,0.18)] transition hover:bg-white/70 hover:text-[#123c15]";

const TRIGGER_DARK =
  "inline-flex items-center gap-1 rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 shadow-[0_0_10px_rgba(255,255,255,0.22),0_0_22px_rgba(255,255,255,0.12)] transition hover:bg-white/12 hover:text-white";

export function HeaderAudienceDropdown({ segment, variant = "light" }: Props) {
  const label = AUDIENCE_SEGMENT_LABELS[segment];
  const triggerClass = variant === "light" ? TRIGGER_LIGHT : TRIGGER_DARK;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={`${triggerClass} whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[var(--feg-green)]/40`}>
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="center"
          sideOffset={8}
          collisionPadding={16}
          className="z-[100] min-w-[11rem] rounded-2xl border border-[var(--feg-green)]/18 bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(0,36,3,0.14)] backdrop-blur-md"
        >
          {AUDIENCE_LINKS.map(({ path, label: linkLabel }) => (
            <DropdownMenu.Item key={path} asChild>
              <Link
                href={audienceQueryHref(path, segment)}
                className="block cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-[#24321c] outline-none transition hover:bg-[var(--feg-bg)] focus:bg-[var(--feg-bg)] data-[highlighted]:bg-[var(--feg-bg)]"
              >
                {linkLabel}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
