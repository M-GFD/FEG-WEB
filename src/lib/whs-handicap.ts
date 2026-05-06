/**
 * Utilidades alineadas al World Handicap System (WHS), tal como lo publican
 * The R&A y la USGA (Course Handicap, Playing Handicap, diferencial).
 *
 * En FEG:
 * - `Player.handicapIndex` debe ser el **Handicap Index** oficial (p. ej. AAG/GSAA).
 * - `Player.handicap` es respaldo entero / legado cuando no hay índice.
 * - El **neto en medal play** usa Playing Handicap (100% del Course Handicap en modalidad individual estándar).
 *
 * Referencia: https://www.usga.org/content/usga/home-page/handicapping/world-handicap-system.html
 */

export type WhsTeeContext = {
  slopeRating: number;
  courseRating: number;
  par: number;
};

/**
 * Tee “neutral” (113 / CR = par): Course Handicap ≈ Handicap Index redondeado.
 * Se usa cuando el torneo aún no tiene cargados slope, rating y par del tee.
 */
export const NEUTRAL_TEE: WhsTeeContext = {
  slopeRating: 113,
  courseRating: 72,
  par: 72,
};

/** Redondeo WHS al entero más cercano (0,5 hacia arriba). */
export function roundWhsInteger(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

/**
 * Course Handicap (18 hoyos), fórmula WHS:
 * HI × (Slope Rating ÷ 113) + (Course Rating − Par)
 */
export function courseHandicap18(handicapIndex: number, tee: WhsTeeContext): number {
  const raw =
    handicapIndex * (tee.slopeRating / 113) + (tee.courseRating - tee.par);
  return roundWhsInteger(raw);
}

/**
 * Playing Handicap (18 hoyos). En stroke play individual suele ser 100% del Course Handicap;
 * otros formatos usan otro % (fourball, foursomes, etc.).
 */
export function playingHandicap18(
  courseHandicap: number,
  allowancePercent: number = 100
): number {
  if (!Number.isFinite(courseHandicap) || !Number.isFinite(allowancePercent)) return 0;
  const raw = courseHandicap * (allowancePercent / 100);
  return roundWhsInteger(raw);
}

/** Lee tee del torneo si está completo; si no, neutral. */
export function parseTournamentTee(t: {
  whsSlopeRating?: number | null;
  whsCourseRating?: number | null;
  whsPar?: number | null;
}): WhsTeeContext {
  const sr = t.whsSlopeRating;
  const cr = t.whsCourseRating;
  const p = t.whsPar;
  if (sr != null && cr != null && p != null && sr > 0) {
    return { slopeRating: sr, courseRating: cr, par: p };
  }
  return NEUTRAL_TEE;
}

/**
 * Diferencial de tarjeta (una ronda), antes de PCC y truncados de publicación:
 * (113 / Slope) × (Adjusted Gross − Course Rating − PCC)
 */
export function scoreDifferential18(params: {
  adjustedGross: number;
  courseRating: number;
  slopeRating: number;
  pcc?: number;
}): number {
  const pcc = params.pcc ?? 0;
  if (params.slopeRating <= 0) return Number.NaN;
  return (113 / params.slopeRating) * (params.adjustedGross - params.courseRating - pcc);
}
