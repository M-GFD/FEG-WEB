import { HeaderBar } from "@/components/layout/HeaderBar";
import { NAV_DROPDOWN_ITEMS } from "@/lib/nav-dropdowns";

export const PRIMARY_NAV_ITEMS = [
  { href: "/noticias", label: "Noticias" },
  { href: "/clubes", label: "Clubes" },
] as const;

export function Header() {
  return (
    <HeaderBar
      primaryLinks={[...PRIMARY_NAV_ITEMS]}
      navDropdownItems={NAV_DROPDOWN_ITEMS}
    />
  );
}
