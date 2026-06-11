import { HeaderBar } from "@/components/layout/HeaderBar";
import { buildNavDropdownItems, buildPrimaryNavItems } from "@/lib/nav-dropdowns";
import { getTranslations } from "next-intl/server";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <HeaderBar
      primaryLinks={buildPrimaryNavItems(t)}
      navDropdownItems={buildNavDropdownItems(t)}
    />
  );
}
