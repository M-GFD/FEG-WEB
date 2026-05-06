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
