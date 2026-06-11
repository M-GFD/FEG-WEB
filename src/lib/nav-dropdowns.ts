import { audienceQueryHref, type AudienceSegment } from "@/lib/content-audience";

export type NavDropdownLink = { href: string; label: string };

export type NavDropdownItem = {
  id: string;
  label: string;
  links: NavDropdownLink[];
};

type NavTranslator = {
  (key: string): string;
};

const AUDIENCE_PATH_KEYS = [
  { path: "/ranking", key: "rankings" },
  { path: "/calendario", key: "calendar" },
  { path: "/torneos", key: "tournaments" },
  { path: "/noticias", key: "news" },
] as const;

function audienceDropdown(
  segment: AudienceSegment,
  label: string,
  t: NavTranslator
): NavDropdownItem {
  const links = AUDIENCE_PATH_KEYS.map(({ path, key }) => ({
    href: audienceQueryHref(path, segment),
    label: t(key),
  }));

  if (segment === "menores") {
    links.push({ href: "/empadronamiento-menores", label: t("enrollment") });
    links.push({ href: "/menores/reglamento", label: t("regulationsMinors") });
  }
  if (segment === "mayores") {
    links.push({ href: "/mayores/reglamento", label: t("regulationsMayores") });
  }

  return {
    id: segment,
    label,
    links,
  };
}

export function buildPrimaryNavItems(t: NavTranslator): NavDropdownLink[] {
  return [
    { href: "/noticias", label: t("news") },
    { href: "/clubes", label: t("clubs") },
  ];
}

export function buildNavDropdownItems(t: NavTranslator): NavDropdownItem[] {
  return [
    {
      id: "institucional",
      label: t("institutional"),
      links: [
        { href: "/institucional", label: t("aboutUs") },
        { href: "/institucional/reglamentos", label: t("regulations") },
      ],
    },
    audienceDropdown("menores", t("minors"), t),
    audienceDropdown("mayores", t("majors"), t),
  ];
}
