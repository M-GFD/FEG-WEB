import { audienceQueryHref, type AudienceSegment } from "@/lib/content-audience";

export type NavDropdownLink = { href: string; label: string };

export type NavDropdownItem = {
  id: string;
  label: string;
  links: NavDropdownLink[];
};

const AUDIENCE_PATHS: { path: string; label: string }[] = [
  { path: "/ranking", label: "Rankings" },
  { path: "/calendario", label: "Calendario" },
  { path: "/torneos", label: "Torneos" },
  { path: "/noticias", label: "Noticias" },
];

function audienceDropdown(segment: AudienceSegment, label: string): NavDropdownItem {
  const links = AUDIENCE_PATHS.map(({ path, label: linkLabel }) => ({
    href: audienceQueryHref(path, segment),
    label: linkLabel,
  }));
  if (segment === "menores") {
    links.push({ href: "/empadronamiento-menores", label: "Empadronamiento" });
  }
  return {
    id: segment,
    label,
    links,
  };
}

export const NAV_DROPDOWN_ITEMS: NavDropdownItem[] = [
  {
    id: "institucional",
    label: "Institucional",
    links: [
      { href: "/institucional", label: "Nosotros" },
      { href: "/institucional/reglamento", label: "Reglamento" },
    ],
  },
  audienceDropdown("menores", "Menores"),
  audienceDropdown("mayores", "Mayores"),
];
