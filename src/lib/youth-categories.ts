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
  { groupKey: "cab-14", label: "CAB-14", order: 3 },
  { groupKey: "cab-18", label: "CAB-18", order: 4 },
  { groupKey: "dam-14", label: "DAM-14", order: 5 },
  { groupKey: "dam-18", label: "DAM-18", order: 6 },
  { groupKey: "albatros", label: "Albatros", order: 7 },
  { groupKey: "aguila", label: "Águila", order: 8 },
  { groupKey: "birdie", label: "Birdie", order: 9 },
  { groupKey: "principiante", label: "Principiante", order: 10 },
];

const YOUTH_LEGACY_BAND_KEYS = new Set(["cab-14", "cab-18", "dam-14", "dam-18"]);

function normalizeCategory(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

function tierByGroupKey(groupKey: string): YouthCategoryTier | undefined {
  return YOUTH_CATEGORY_TIERS.find((t) => t.groupKey === groupKey);
}

/** Bandas CAB/DAM juveniles (p. ej. CAB-14, DAM 18, CAB14). */
function resolveLegacyYouthBand(k: string): YouthCategoryTier | null {
  if (YOUTH_LEGACY_BAND_KEYS.has(k)) return tierByGroupKey(k) ?? null;
  const m = k.match(/^(cab|dam)[-\s]?(\d+)$/);
  if (!m) return null;
  const key = `${m[1]}-${m[2]}`;
  if (!YOUTH_LEGACY_BAND_KEYS.has(key)) return null;
  return tierByGroupKey(key) ?? null;
}

/** Resuelve tier menores a partir del texto de categoría del jugador en DB. */
export function resolveYouthCategoryTier(
  raw: string | null | undefined
): YouthCategoryTier | null {
  const k = normalizeCategory(raw);
  if (!k || k === "—" || k === "-") return null;

  const legacyBand = resolveLegacyYouthBand(k);
  if (legacyBand) return legacyBand;

  if (k === "junior") return YOUTH_CATEGORY_TIERS[2];
  if (k.startsWith("pre") && k.includes("juvenil")) return YOUTH_CATEGORY_TIERS[1];
  if (k.startsWith("juvenil")) return YOUTH_CATEGORY_TIERS[0];
  if (k.includes("albatros")) return tierByGroupKey("albatros") ?? null;
  if (k.includes("aguila")) return tierByGroupKey("aguila") ?? null;
  if (k.includes("birdie")) return tierByGroupKey("birdie") ?? null;
  if (k.includes("principiante")) return tierByGroupKey("principiante") ?? null;

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
  if (YOUTH_LEGACY_BAND_KEYS.has(k)) return false;
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
