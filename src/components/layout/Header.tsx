import { FegLogoLink } from "@/components/layout/FegLogo";
import { HeaderNotifications } from "@/components/layout/HeaderNotifications";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { NavSearch } from "@/components/layout/NavSearch";
import { HeaderDesktopRail } from "@/components/layout/HeaderDesktopRail";
import { NAV_DROPDOWN_ITEMS } from "@/lib/nav-dropdowns";

export const PRIMARY_NAV_ITEMS = [
  { href: "/noticias", label: "Noticias" },
  { href: "/clubes", label: "Clubes" },
] as const;

export function Header() {
  return (
    <div>
      <header className="fixed left-0 right-0 top-0 z-50 bg-transparent pt-4">
        <div className="relative mx-auto min-h-16 max-w-7xl px-6 md:max-w-none md:px-4 md:py-2 lg:px-6">
          <HeaderDesktopRail
            primaryLinks={[...PRIMARY_NAV_ITEMS]}
            navDropdownItems={NAV_DROPDOWN_ITEMS}
          />

          <div className="grid w-full grid-cols-[minmax(0,auto)_minmax(0,1fr)_2.75rem_2.75rem] items-center gap-2 md:hidden">
            <div className="min-w-0">
              <FegLogoLink size="nav" />
            </div>

            <div className="min-w-0 overflow-hidden">
              <div className="flex min-w-0 max-w-full items-center overflow-hidden rounded-full bg-white/70 px-2.5 py-1.5 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <NavSearch variant="mobile" className="w-full min-w-0 max-w-full" />
              </div>
            </div>

            <HeaderNotifications theme="light" className="flex h-11 w-full max-w-[2.75rem] justify-center justify-self-center" />

            <MobileHeaderMenu
              primaryLinks={[...PRIMARY_NAV_ITEMS]}
              navDropdownItems={NAV_DROPDOWN_ITEMS}
            />
          </div>
        </div>
      </header>
      <div
        aria-hidden
        className="pointer-events-none h-[calc(1rem+4rem)] shrink-0 select-none md:h-[calc(1rem+1rem+5.25rem)]"
      />
    </div>
  );
}
