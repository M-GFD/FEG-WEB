import type { Category } from "@prisma/client";
import { isYouthPlayerCategory } from "@/lib/youth-categories";

/**
 * Etiquetas oficiales — Reglamento Mayores FGL 2026 §4.
 */
export const RANKING_CATEGORY_LABELS: Record<Category, string> = {
  DAMAS_SCRATCH: "Damas Scratch",
  DAMAS_HASTA_30: "Damas hasta 30 de handicap",
  DAMAS_31_59: "Damas 31 a 59 de handicap",
  SENIOR_DAMAS_50: "Senior Damas (mayores de 50 años)",
  CABALLEROS_SCRATCH: "Caballeros Scratch",
  CABALLEROS_HASTA_9: "Caballeros hasta 9 de handicap",
  CABALLEROS_10_16: "Caballeros 10 a 16 de handicap",
  CABALLEROS_17_24: "Caballeros 17 a 24 de handicap",
  CABALLEROS_25_54: "Caballeros 25 a 54 de handicap",
  SENIOR_CABALLEROS_55: "Senior Caballeros (mayores de 55 años)",
};

const MAYORES_ORDER: Category[] = [
  "DAMAS_SCRATCH",
  "DAMAS_HASTA_30",
  "DAMAS_31_59",
  "SENIOR_DAMAS_50",
  "CABALLEROS_SCRATCH",
  "CABALLEROS_HASTA_9",
  "CABALLEROS_10_16",
  "CABALLEROS_17_24",
  "CABALLEROS_25_54",
  "SENIOR_CABALLEROS_55",
];

const LABEL_LOOKUP = new Map<string, string>(
  (Object.keys(RANKING_CATEGORY_LABELS) as Category[]).map((k) => [
    k.toLowerCase(),
    RANKING_CATEGORY_LABELS[k],
  ])
);

function normalizeCategory(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/_/g, " ");
}

function titleCaseWords(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|[\s/(-])([a-záéíóúüñ])/gi, (_m, a: string, b: string) => a + b.toUpperCase());
}

/** Clave estable para agrupar (minúsculas, espacios → guión bajo). */
export function keyForRankingCategory(raw: string | null | undefined): string {
  const t = String(raw ?? "").trim().replace(/\s+/g, " ");
  if (!t) return "__sin_categoria__";
  return t.toLowerCase().replace(/\s+/g, "_");
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

export type MayoresRankingTier = {
  groupKey: string;
  label: string;
  category: Category;
};

function tierFromCategory(cat: Category): MayoresRankingTier {
  return {
    category: cat,
    groupKey: cat.toLowerCase(),
    label: RANKING_CATEGORY_LABELS[cat],
  };
}

function isFemaleGender(gender: string | null | undefined): boolean | null {
  const g = String(gender ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (!g) return null;
  if (g === "f" || g === "mujer" || g === "damas" || g === "dama" || g === "female") {
    return true;
  }
  if (g === "m" || g === "varon" || g === "caballero" || g === "male" || g === "hombre") {
    return false;
  }
  return null;
}

function ageFromBirthYear(birthYear: number | null | undefined, now = new Date()): number | null {
  if (typeof birthYear !== "number" || birthYear < 1900) return null;
  return now.getFullYear() - birthYear;
}

/**
 * Resuelve categoría de Mayores FGL §4 a partir del texto en DB,
 * y si hace falta por género + handicap / edad (Senior).
 */
export function resolveMayoresRankingTier(input: {
  category: string | null | undefined;
  gender?: string | null;
  handicap?: number | null;
  handicapIndex?: number | null;
  birthYear?: number | null;
  age?: number | null;
}): MayoresRankingTier | null {
  const raw = input.category;
  if (isYouthPlayerCategory(raw)) return null;

  const k = normalizeCategory(raw);
  if (!k) return null;

  // Enum Prisma / variantes con guiones o espacios
  const enumKey = k.replace(/[-\s]+/g, "_").toUpperCase() as Category;
  if (enumKey in RANKING_CATEGORY_LABELS) {
    return tierFromCategory(enumKey);
  }

  const female = isFemaleGender(input.gender);
  const hcp =
    typeof input.handicapIndex === "number" && !Number.isNaN(input.handicapIndex)
      ? input.handicapIndex
      : typeof input.handicap === "number" && !Number.isNaN(input.handicap)
        ? input.handicap
        : null;
  const age =
    typeof input.age === "number" && input.age > 0
      ? input.age
      : ageFromBirthYear(input.birthYear ?? null);

  // Match explícito por texto del reglamento / aliases
  if (k.includes("senior") && (k.includes("dama") || female === true)) {
    return tierFromCategory("SENIOR_DAMAS_50");
  }
  if (k.includes("senior") && (k.includes("caballero") || female === false)) {
    return tierFromCategory("SENIOR_CABALLEROS_55");
  }
  if (k.includes("senior") && female == null) {
    if (age != null && age >= 55) return tierFromCategory("SENIOR_CABALLEROS_55");
    if (age != null && age >= 50) return tierFromCategory("SENIOR_DAMAS_50");
  }

  if (k.includes("dama") && k.includes("scratch")) return tierFromCategory("DAMAS_SCRATCH");
  if ((k.includes("caballero") || k.startsWith("cab")) && k.includes("scratch")) {
    return tierFromCategory("CABALLEROS_SCRATCH");
  }

  if (k.includes("dama") && (k.includes("31") || k.includes("59"))) {
    return tierFromCategory("DAMAS_31_59");
  }
  if (k.includes("dama") && (k.includes("hasta 30") || k.includes("30"))) {
    return tierFromCategory("DAMAS_HASTA_30");
  }

  if ((k.includes("caballero") || k.startsWith("cab")) && k.includes("25") && k.includes("54")) {
    return tierFromCategory("CABALLEROS_25_54");
  }
  if ((k.includes("caballero") || k.startsWith("cab")) && k.includes("17") && k.includes("24")) {
    return tierFromCategory("CABALLEROS_17_24");
  }
  if ((k.includes("caballero") || k.startsWith("cab")) && k.includes("10") && k.includes("16")) {
    return tierFromCategory("CABALLEROS_10_16");
  }
  if (
    (k.includes("caballero") || k.startsWith("cab")) &&
    (k.includes("hasta 9") || /\bhasta\s*9\b/.test(k) || k.endsWith(" 9") || k.includes("hasta_9"))
  ) {
    return tierFromCategory("CABALLEROS_HASTA_9");
  }

  // Categoría genérica CAB/DAM → banda por Handicap Index
  const isGenericDamas =
    k === "dam" || k === "damas" || k === "dama" || k === "mujeres" || k === "mujer";
  const isGenericCab =
    k === "cab" ||
    k === "caballeros" ||
    k === "caballero" ||
    k === "varones" ||
    k === "varon" ||
    k === "hombres";

  if (hcp == null || hcp <= 0) return null;

  const asDamas = isGenericDamas || female === true;
  const asCab = isGenericCab || female === false;

  if (asDamas && !isGenericCab) {
    if (hcp <= 30) return tierFromCategory("DAMAS_HASTA_30");
    if (hcp <= 59) return tierFromCategory("DAMAS_31_59");
    return null;
  }

  if (asCab && !isGenericDamas) {
    if (hcp <= 9) return tierFromCategory("CABALLEROS_HASTA_9");
    if (hcp <= 16) return tierFromCategory("CABALLEROS_10_16");
    if (hcp <= 24) return tierFromCategory("CABALLEROS_17_24");
    if (hcp <= 54) return tierFromCategory("CABALLEROS_25_54");
    return null;
  }

  return null;
}

export type HandicapRankingCategorySortable = {
  groupKey: string;
  label: string;
};

const PRISMA_CATEGORY_KEY_ORDER: string[] = MAYORES_ORDER.map((k) => k.toLowerCase());

/**
 * Orden de visualización Mayores: orden del reglamento §4 (Damas luego Caballeros).
 */
export function compareHandicapRankingCategoryBlocks(
  a: HandicapRankingCategorySortable,
  b: HandicapRankingCategorySortable
): number {
  const ia = PRISMA_CATEGORY_KEY_ORDER.indexOf(a.groupKey);
  const ib = PRISMA_CATEGORY_KEY_ORDER.indexOf(b.groupKey);
  if (ia >= 0 && ib >= 0) return ia - ib;
  if (ia >= 0) return -1;
  if (ib >= 0) return 1;
  if (a.groupKey === "__sin_categoria__") return 1;
  if (b.groupKey === "__sin_categoria__") return -1;
  return a.label.localeCompare(b.label, "es", { sensitivity: "base" });
}

export function sortHandicapRankingCategoryBlocks<T extends HandicapRankingCategorySortable>(
  blocks: T[]
): T[] {
  return [...blocks].sort(compareHandicapRankingCategoryBlocks);
}

/** Índice inicial: Caballeros Scratch; si no, primera categoría Caballeros; si no, 0. */
export function getInitialHandicapRankingCategoryIndex(
  sorted: HandicapRankingCategorySortable[]
): number {
  const cabScratch = sorted.findIndex((c) => c.groupKey === "caballeros_scratch");
  if (cabScratch >= 0) return cabScratch;
  const firstCab = sorted.findIndex((c) => c.groupKey.startsWith("caballeros_"));
  if (firstCab >= 0) return firstCab;
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
