/**
 * Categorías menores según documentación FGL/AAG:
 * - ranking-juveniles-prejuveniles-2026.md
 * - empadronamiento-fgl-2026.md
 * - categorias_alcanzadas_FEG.md
 */

export type YouthCategoryTier = {
  /** Clave estable para agrupar rankings. */
  groupKey: string;
  label: string;
  /** Orden en /ranking?audiencia=menores */
  order: number;
};

/** Birdies 2017–2019, Eagles 2015–2016, Albatros 2013–2014 (categorias_alcanzadas_FEG). */
export const YOUTH_CATEGORY_TIERS: YouthCategoryTier[] = [
  { groupKey: "juveniles", label: "Juveniles", order: 0 },
  { groupKey: "prejuveniles", label: "Prejuveniles", order: 1 },
  { groupKey: "junior", label: "Junior", order: 2 },
  { groupKey: "albatros", label: "Albatros", order: 3 },
  { groupKey: "aguila", label: "Águila", order: 4 },
  { groupKey: "birdie", label: "Birdie", order: 5 },
  { groupKey: "principiante", label: "Principiante", order: 6 },
];

function normalizeCategory(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

/** Resuelve tier menores a partir del texto de categoría del jugador en DB. */
export function resolveYouthCategoryTier(
  raw: string | null | undefined
): YouthCategoryTier | null {
  const k = normalizeCategory(raw);
  if (!k || k === "—" || k === "-") return null;

  if (k === "junior") return YOUTH_CATEGORY_TIERS[2];
  if (k.startsWith("pre") && k.includes("juvenil")) return YOUTH_CATEGORY_TIERS[1];
  if (k.startsWith("juvenil")) return YOUTH_CATEGORY_TIERS[0];
  if (k.includes("albatros")) return YOUTH_CATEGORY_TIERS[3];
  if (k.includes("aguila")) return YOUTH_CATEGORY_TIERS[4];
  if (k.includes("birdie")) return YOUTH_CATEGORY_TIERS[5];
  if (k.includes("principiante")) return YOUTH_CATEGORY_TIERS[6];

  return null;
}

export function isYouthPlayerCategory(raw: string | null | undefined): boolean {
  return resolveYouthCategoryTier(raw) !== null;
}

/** Mayores: no menores; incluye Sub 23, senior, damas, bandas CAB, enum Prisma, etc. */
export function isMayoresPlayerCategory(raw: string | null | undefined): boolean {
  const k = normalizeCategory(raw);
  if (!k) return false;
  if (isYouthPlayerCategory(raw)) return false;
  if (k.includes("sub 23") || k.includes("sub23")) return true;
  if (k.includes("senior") || k.includes("damas") || k.includes("dama")) return true;
  if (k.startsWith("cab") || k.includes("caballero")) return true;
  if (
    k.includes("scratch") ||
    k.includes("hasta_") ||
    k.includes("hasta ") ||
    /^caballeros_/.test(k)
  ) {
    return true;
  }
  // Categorías enum Prisma en minúsculas con guiones bajos
  const prismaMayores = [
    "damas_scratch",
    "damas_hasta_30",
    "damas_31_59",
    "senior_damas_50",
    "caballeros_scratch",
    "caballeros_hasta_9",
    "caballeros_10_16",
    "caballeros_17_24",
    "caballeros_25_54",
    "senior_caballeros_55",
  ];
  if (prismaMayores.includes(k.replace(/-/g, "_"))) return true;
  return true; // resto no juvenil con categoría cargada
}

export function compareYouthCategoryBlocks(
  a: { groupKey: string; label: string },
  b: { groupKey: string; label: string }
): number {
  const tier = (key: string) =>
    YOUTH_CATEGORY_TIERS.find((t) => t.groupKey === key)?.order ?? 99;
  const ta = tier(a.groupKey);
  const tb = tier(b.groupKey);
  if (ta !== tb) return ta - tb;
  return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
}
