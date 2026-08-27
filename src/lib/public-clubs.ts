/**
 * Clubes afiliados que se listan en /clubes.
 * El padrón tiene filas extra (import juvenil, duplicados); la ruta pública
 * solo muestra esta red y los nombres/ciudades oficiales.
 */
export type PublicClubDirectoryEntry = {
  /** Código AAG/FEG cuando existe. */
  code: string | null;
  /** Slug canónico (el de la ficha pública). */
  slug: string;
  /** Slugs viejos o de filas duplicadas; redirigen al canónico. */
  aliasSlugs: readonly string[];
  name: string;
  city: string;
};

export const PUBLIC_CLUB_DIRECTORY: readonly PublicClubDirectoryEntry[] = [
  {
    code: "302",
    slug: "club-atl-estudiantes-parana",
    aliasSlugs: ["club_atletico_estudiantes_de_parana"],
    name: "CLUB ATLETICO ESTUDIANTES DE PARANA",
    city: "Paraná",
  },
  {
    code: "360",
    slug: "club-campo-lib-san-martin",
    aliasSlugs: [],
    name: "CLUB DE CAMPO LIBERTADOR SAN MARTIN",
    city: "Libertador San Martín",
  },
  {
    code: "351",
    slug: "club-de-campo-los-bretes",
    aliasSlugs: [],
    name: "CLUB DE CAMPO LOS BRETES",
    city: "Colón",
  },
  {
    code: "324",
    slug: "club-universitario-cu",
    aliasSlugs: ["club_universitario_conc_uruguay"],
    name: "CLUB UNIVERSITARIO (CONC. URUGUAY)",
    city: "Concepción del Uruguay",
  },
  {
    code: "303",
    slug: "concordia-golf-club",
    aliasSlugs: [],
    name: "CONCORDIA GOLF CLUB",
    city: "Concordia",
  },
  {
    code: "332",
    slug: "golf-aero-club-villaguay",
    aliasSlugs: [],
    name: "GOLF AERO CLUB VILLAGUAY",
    city: "Villaguay",
  },
  {
    code: "307",
    slug: "golf-club-colon",
    aliasSlugs: [],
    name: "GOLF CLUB COLON",
    city: "Colón",
  },
  {
    code: "326",
    slug: "golf-club-social-la-paz",
    aliasSlugs: [],
    name: "GOLF CLUB SOCIAL LA PAZ",
    city: "La Paz",
  },
  {
    code: "304",
    slug: "gualeguaychu-country-club",
    aliasSlugs: ["gualeguaychu_country_club"],
    name: "GUALEGUAYCHU COUNTRY CLUB",
    city: "Gualeguaychú",
  },
  {
    code: "342",
    slug: "las-colinas-club-campo",
    aliasSlugs: ["las_colinas_golf"],
    name: "LAS COLINAS GOLF",
    city: "Paraná",
  },
  {
    code: "309",
    slug: "santa-elena-golf-club",
    aliasSlugs: [],
    name: "SANTA ELENA GOLF CLUB",
    city: "Santa Elena",
  },
  {
    code: "354",
    slug: "termas-villa-elisa",
    aliasSlugs: [],
    name: "TERMAS VILLA ELISA",
    city: "Villa Elisa",
  },
  {
    code: null,
    slug: "victoria-golf-country-club",
    aliasSlugs: [],
    name: "VICTORIA GOLF COUNTRY CLUB",
    city: "Victoria",
  },
];

export function publicClubRedirectSlug(requestedSlug: string): string | null {
  const entry = PUBLIC_CLUB_DIRECTORY.find((e) => e.aliasSlugs.includes(requestedSlug));
  if (!entry || entry.slug === requestedSlug) return null;
  return entry.slug;
}

export function findPublicClubEntry(club: {
  code?: string | null;
  slug?: string | null;
}): PublicClubDirectoryEntry | undefined {
  return PUBLIC_CLUB_DIRECTORY.find(
    (e) =>
      (e.code != null && club.code === e.code) ||
      (club.slug != null && (club.slug === e.slug || e.aliasSlugs.includes(club.slug)))
  );
}

/** True solo para la ficha canónica (sin duplicados del padrón juvenil). */
export function isCanonicalPublicClub(club: {
  code?: string | null;
  slug?: string | null;
}): boolean {
  return PUBLIC_CLUB_DIRECTORY.some(
    (e) =>
      (e.code != null && club.code === e.code) ||
      (e.code == null && club.slug === e.slug)
  );
}

export function pickDbClubForDirectoryEntry<T extends { code: string | null; slug: string }>(
  entry: PublicClubDirectoryEntry,
  clubs: T[]
): T | undefined {
  if (entry.code) {
    const byCode = clubs.find((c) => c.code === entry.code);
    if (byCode) return byCode;
  }
  return clubs.find((c) => c.slug === entry.slug);
}
