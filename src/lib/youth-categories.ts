/**
 * Categorías de rankings Menores según reglamentos FEG/FGL 2026:
 * - Reglamento Junior FEG §2: Albatros, Eagles, Birdies, Principiantes
 * - Reglamento Prejuveniles/Juveniles FGL §II: Juveniles (M18), Prejuveniles (M15), Sub 23
 */

export type YouthCategoryTier = {
  /** Clave estable para agrupar rankings. */
  groupKey: string;
  label: string;
  /** Orden en /ranking?audiencia=menores */
  order: number;
};

/**
 * Orden: Sub 23 → Juveniles (M18) → Prejuveniles (M15) → Junior (Albatros…Principiantes).
 */
export const YOUTH_CATEGORY_TIERS: YouthCategoryTier[] = [
  { groupKey: "sub23", label: "Sub 23", order: 0 },
  { groupKey: "juveniles_m18", label: "Juveniles (M18)", order: 1 },
  { groupKey: "prejuveniles_m15", label: "Prejuveniles (M15)", order: 2 },
  { groupKey: "albatros", label: "Albatros", order: 3 },
  { groupKey: "eagles", label: "Eagles", order: 4 },
  { groupKey: "birdies", label: "Birdies", order: 5 },
  { groupKey: "principiantes", label: "Principiantes", order: 6 },
];

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

/**
 * Bandas legacy CAB/DAM 14|18 → categorías oficiales M15/M18.
 * CAB-14 / DAM-14 ≈ Prejuveniles; CAB-18 / DAM-18 ≈ Juveniles.
 */
function resolveLegacyYouthBand(k: string): YouthCategoryTier | null {
  const m = k.match(/^(cab|dam)[-\s]?(\d+)$/);
  if (!m) return null;
  const age = Number(m[2]);
  if (age === 18) return tierByGroupKey("juveniles_m18") ?? null;
  if (age === 14 || age === 15) return tierByGroupKey("prejuveniles_m15") ?? null;
  return null;
}

/** Resuelve tier menores a partir del texto de categoría del jugador en DB. */
export function resolveYouthCategoryTier(
  raw: string | null | undefined
): YouthCategoryTier | null {
  const k = normalizeCategory(raw);
  if (!k || k === "—" || k === "-") return null;

  const legacyBand = resolveLegacyYouthBand(k);
  if (legacyBand) return legacyBand;

  if (k.includes("sub 23") || k === "sub23" || k.includes("sub-23")) {
    return tierByGroupKey("sub23") ?? null;
  }

  if (k.includes("m18") || (k.includes("juvenil") && !k.includes("pre"))) {
    return tierByGroupKey("juveniles_m18") ?? null;
  }

  if (
    k.includes("m15") ||
    (k.includes("pre") && k.includes("juvenil")) ||
    k === "pre juveniles" ||
    k === "pre-juveniles"
  ) {
    return tierByGroupKey("prejuveniles_m15") ?? null;
  }

  if (k.includes("albatros")) return tierByGroupKey("albatros") ?? null;

  // Reglamento Junior: EAGLES; padrón/empadronamiento suele usar Águila / Aguila.
  if (k.includes("eagle") || k.includes("aguila")) {
    return tierByGroupKey("eagles") ?? null;
  }

  if (k.includes("birdie")) return tierByGroupKey("birdies") ?? null;

  if (k.includes("principiante")) return tierByGroupKey("principiantes") ?? null;

  // "Junior" genérico sin subcategoría → no agrupar (evitar mezclar edades).
  if (k === "junior" || k === "juniors") return null;

  return null;
}

export function isYouthPlayerCategory(raw: string | null | undefined): boolean {
  return resolveYouthCategoryTier(raw) !== null;
}

/** Mayores: categorías del Ranking de Mayores FGL (no menores / Sub 23 / Junior). */
export function isMayoresPlayerCategory(raw: string | null | undefined): boolean {
  const k = normalizeCategory(raw);
  if (!k) return false;
  if (isYouthPlayerCategory(raw)) return false;
  if (k.includes("sub 23") || k.includes("sub23") || k.includes("sub-23")) return false;
  if (k.includes("junior") || k.includes("albatros") || k.includes("birdie")) return false;
  if (k.includes("aguila") || k.includes("eagle") || k.includes("principiante")) return false;
  if (k.includes("juvenil")) return false;
  return true;
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

/** Índice inicial del paginador menores: Juveniles (M18) si hay filas. */
export function getInitialYouthRankingCategoryIndex(
  sorted: { groupKey: string }[]
): number {
  const i = sorted.findIndex((c) => c.groupKey === "juveniles_m18");
  return i >= 0 ? i : 0;
}
