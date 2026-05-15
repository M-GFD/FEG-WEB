import type { Category } from "@prisma/client";

/** Etiquetas para valores alineados al enum de torneos / categorías de juego. */
export const RANKING_CATEGORY_LABELS: Record<Category, string> = {
  DAMAS_SCRATCH: "Damas Scratch",
  DAMAS_HASTA_30: "Damas hasta 30",
  DAMAS_31_59: "Damas 31–59",
  SENIOR_DAMAS_50: "Senior damas",
  CABALLEROS_SCRATCH: "Caballeros Scratch",
  CABALLEROS_HASTA_9: "Caballeros hasta 9",
  CABALLEROS_10_16: "Caballeros 10–16",
  CABALLEROS_17_24: "Caballeros 17–24",
  CABALLEROS_25_54: "Caballeros 25–54",
  SENIOR_CABALLEROS_55: "Senior caballeros",
};

const LABEL_LOOKUP = new Map<string, string>(
  (Object.keys(RANKING_CATEGORY_LABELS) as Category[]).map((k) => [
    k.toLowerCase(),
    RANKING_CATEGORY_LABELS[k],
  ])
);

function titleCaseWords(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s/(-])([a-záéíóúüñ])/gi, (_m, a: string, b: string) => a + b.toUpperCase());
}

/** Clave estable para agrupar (minúsculas, espacios normalizados). */
export function keyForRankingCategory(raw: string | null | undefined): string {
  const t = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "__sin_categoria__";
  return t.toLowerCase();
}

/** Texto amigable para la UI; respeta enum conocido o capitaliza el string de la DB. */
export function labelForRankingCategory(raw: string | null | undefined): string {
  const t = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "Sin categoría";
  const fromEnum = LABEL_LOOKUP.get(t.toLowerCase());
  if (fromEnum) return fromEnum;
  return titleCaseWords(t);
}

export function slugifyRankingCategoryKey(key: string): string {
  const s = key.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return s.length ? s : "categoria";
}

/** Orden del enum Prisma (lowercase) para categorías reconocidas fuera del bloque CAB*. */
const PRISMA_CATEGORY_KEY_ORDER: string[] = (
  Object.keys(RANKING_CATEGORY_LABELS) as Category[]
).map((k) => k.toLowerCase());

export type HandicapRankingCategorySortable = {
  groupKey: string;
  label: string;
};

/**
 * Orden de visualización en /ranking: CAB exacto primero, luego CAB-*, luego enum, resto alfabético, sin categoría al final.
 */
export function compareHandicapRankingCategoryBlocks(
  a: HandicapRankingCategorySortable,
  b: HandicapRankingCategorySortable
): number {
  const ta = rankingCategorySortTier(a);
  const tb = rankingCategorySortTier(b);
  if (ta !== tb) return ta - tb;
  if (ta <= 0) {
    return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
  }
  if (ta === 1) {
    return (
      PRISMA_CATEGORY_KEY_ORDER.indexOf(a.groupKey) -
      PRISMA_CATEGORY_KEY_ORDER.indexOf(b.groupKey)
    );
  }
  return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
}

function rankingCategorySortTier(b: HandicapRankingCategorySortable): number {
  if (b.groupKey === "__sin_categoria__") return 3;
  if (b.groupKey === "cab" || /^cab$/i.test(b.label.trim())) return -1;
  if (isLegacyCabBandCategory(b)) return 0;
  if (PRISMA_CATEGORY_KEY_ORDER.includes(b.groupKey)) return 1;
  return 2;
}

/** CAB-*, etc., sin mezclar con caballeros_* del enum Prisma. */
function isLegacyCabBandCategory(b: HandicapRankingCategorySortable): boolean {
  const k = b.groupKey;
  if (k.includes("caballero")) return false;
  if (k.startsWith("cab-") || k.startsWith("cab–")) return true;
  const t = b.label.trim();
  if (/^cab[-–]/i.test(t) && !/caballero/i.test(t)) return true;
  return false;
}

export function sortHandicapRankingCategoryBlocks<T extends HandicapRankingCategorySortable>(
  blocks: T[]
): T[] {
  return [...blocks].sort(compareHandicapRankingCategoryBlocks);
}

/** Índice inicial del paginador: CAB (clave o etiqueta corta); si no hay, Caballeros Scratch; si no, 0. */
export function getInitialHandicapRankingCategoryIndex(
  sorted: HandicapRankingCategorySortable[]
): number {
  const cab = sorted.findIndex(
    (c) => c.groupKey === "cab" || /^cab$/i.test(c.label.trim())
  );
  if (cab >= 0) return cab;
  const cabScratch = sorted.findIndex((c) => c.groupKey === "caballeros_scratch");
  if (cabScratch >= 0) return cabScratch;
  return 0;
}

/**
 * Valor numérico para ordenar (menor = mejor puesto en golf).
 * Usa el **Handicap Index** (WHS / AAG) cuando existe; si no, el entero `handicap` de respaldo.
 */
export function handicapSortValue(p: {
  handicap: number | null | undefined;
  handicapIndex: number | null | undefined;
}): number {
  if (typeof p.handicapIndex === "number" && !Number.isNaN(p.handicapIndex)) {
    return p.handicapIndex;
  }
  const h = p.handicap;
  if (typeof h === "number" && !Number.isNaN(h)) return h;
  return Number.POSITIVE_INFINITY;
}

export function formatHandicapRankingCell(p: {
  handicap: number | null | undefined;
  handicapIndex: number | null | undefined;
}): string {
  // Handicap Index (WHS) preferido para exhibición.
  if (typeof p.handicapIndex === "number" && !Number.isNaN(p.handicapIndex)) {
    return Number.isInteger(p.handicapIndex)
      ? String(p.handicapIndex)
      : p.handicapIndex.toFixed(1);
  }
  if (typeof p.handicap === "number" && !Number.isNaN(p.handicap)) {
    return String(p.handicap);
  }
  return "—";
}
