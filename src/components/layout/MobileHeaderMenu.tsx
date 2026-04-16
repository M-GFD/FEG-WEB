"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { smoothScrollToElementId } from "@/lib/smoothScroll";

export type MobileNavLink = { href: string; label: string };

function handleAnchorClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  href: string,
  pathname: string
) {
  if (!href.startsWith("/#")) return;
  const id = href.slice(2);
  if (pathname === "/") {
    e.preventDefault();
    smoothScrollToElementId(id);
  }
}

type Props = {
  links: readonly MobileNavLink[];
};

/**
 * Navegación móvil: menú desplegable alineado a la derecha (misma lógica de anclas que NavLinks).
 */
export function MobileHeaderMenu({ links }: Props) {
  const pathname = usePathname() ?? "";

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
            className="z-[100] min-w-[13.5rem] rounded-2xl border border-[var(--feg-green)]/18 bg-white/95 p-1.5 shadow-[0_20px_50px_rgba(0,36,3,0.14)] backdrop-blur-md will-change-[transform,opacity]"
          >
            {links.map(({ href, label }) => (
              <DropdownMenu.Item key={href} asChild>
                <Link
                  href={href}
                  onClick={(e) => handleAnchorClick(e, href, pathname)}
                  className="block cursor-pointer rounded-xl px-4 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-[#24321c] outline-none transition hover:bg-[var(--feg-bg)] focus:bg-[var(--feg-bg)] data-[highlighted]:bg-[var(--feg-bg)]"
                >
                  {label}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
