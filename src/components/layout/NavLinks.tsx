"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { smoothScrollToElementId } from "@/lib/smoothScroll";

type NavLink = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

type NavLinksProps = {
  links: NavLink[];
  variant?: "dark" | "light";
};

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

export function NavLinks({ links, variant = "dark" }: NavLinksProps) {
  const pathname = usePathname();
  const isLight = variant === "light";

  return (
    <>
      {links.map(({ href, label }) => {
        const active = isActive(pathname ?? "", href);
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleAnchorClick(e, href, pathname ?? "")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isLight
                ? active
                  ? "bg-white/80 text-[#123c15] shadow-[0_0_18px_rgba(255,255,255,0.85),0_0_36px_rgba(255,255,255,0.45)]"
                  : "text-[#24321c] hover:bg-white/60 hover:text-[#123c15]"
                : active
                  ? "bg-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.5),0_0_40px_rgba(255,255,255,0.25)]"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function NavLinksMobile({ links, variant = "dark" }: NavLinksProps) {
  const pathname = usePathname();
  const isLight = variant === "light";

  return (
    <>
      {links.map(({ href, label }) => {
        const active = isActive(pathname ?? "", href);
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleAnchorClick(e, href, pathname ?? "")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isLight
                ? active
                  ? "bg-white/85 text-[#123c15] shadow-[0_0_14px_rgba(255,255,255,0.9),0_0_28px_rgba(255,255,255,0.45)]"
                  : "bg-white/50 text-[#24321c] hover:bg-white/70"
                : active
                  ? "bg-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.45),0_0_24px_rgba(255,255,255,0.2)]"
                  : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
