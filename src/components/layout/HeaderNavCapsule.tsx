import { NavLinks } from "@/components/layout/NavLinks";
import { HeaderHoverNavGroup } from "@/components/layout/HeaderHoverNavGroup";
import type { NavDropdownItem } from "@/lib/nav-dropdowns";

export type HeaderNavLink = { href: string; label: string };

type Props = {
  primaryLinks: readonly HeaderNavLink[];
  navDropdownItems: NavDropdownItem[];
  variant?: "light" | "dark";
};

/** Cápsula de navegación principal (desktop). */
export function HeaderNavCapsule({
  primaryLinks,
  navDropdownItems,
  variant = "light",
}: Props) {
  return (
    <div className="flex flex-nowrap items-center gap-2 rounded-full bg-white/70 px-2 py-2 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:px-3">
      <NavLinks links={[...primaryLinks]} variant={variant} />
      <HeaderHoverNavGroup items={navDropdownItems} variant={variant} />
    </div>
  );
}
