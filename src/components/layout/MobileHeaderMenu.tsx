"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  audienceQueryHref,
  type AudienceSegment,
} from "@/lib/content-audience";

export type MobileNavLink = { href: string; label: string };

const AUDIENCE_SUB_LINKS: { path: string; label: string }[] = [
  { path: "/ranking", label: "Rankings" },
  { path: "/calendario", label: "Calendario" },
  { path: "/torneos", label: "Torneos" },
  { path: "/noticias", label: "Noticias" },
];

type Props = {
  primaryLinks: readonly MobileNavLink[];
  audienceSegments: { segment: AudienceSegment; label: string }[];
};

export function MobileHeaderMenu({ primaryLinks, audienceSegments }: Props) {
  return (
    <div className="md:hidden">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#123c15]/12 bg-white/80 text-[#123c15] shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:bg-white hover:shadow-[0_12px_34px_rgba(0,0,0,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--feg-green)]"
            aria-label="Menú de navegación"
          >
            <Menu className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={10}
            collisionPadding={16}
            className="z-[100] max-h-[min(80vh,28rem)] min-w-[13.5rem] overflow-y-auto rounded-2xl border border-[var(--feg-green)]/18 bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(0,36,3,0.14)] backdrop-blur-md will-change-[transform,opacity]"
          >
            {primaryLinks.map(({ href, label }) => (
              <DropdownMenu.Item key={href} asChild>
                <Link
                  href={href}
                  className="block cursor-pointer rounded-xl px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-[#24321c] outline-none transition hover:bg-[var(--feg-bg)] focus:bg-[var(--feg-bg)] data-[highlighted]:bg-[var(--feg-bg)]"
                >
                  {label}
                </Link>
              </DropdownMenu.Item>
            ))}

            {audienceSegments.map(({ segment, label }) => (
              <div key={segment}>
                <DropdownMenu.Label className="px-4 pb-1 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--feg-green-2)]/80">
                  {label}
                </DropdownMenu.Label>
                {AUDIENCE_SUB_LINKS.map(({ path, label: linkLabel }) => (
                  <DropdownMenu.Item key={`${segment}-${path}`} asChild>
                    <Link
                      href={audienceQueryHref(path, segment)}
                      className="block cursor-pointer rounded-xl px-4 py-2.5 pl-6 font-heading text-sm font-semibold uppercase tracking-wide text-[#24321c] outline-none transition hover:bg-[var(--feg-bg)] focus:bg-[var(--feg-bg)] data-[highlighted]:bg-[var(--feg-bg)]"
                    >
                      {linkLabel}
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </div>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
