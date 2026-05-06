/**
 * Cálculo del **Handicap Index** a partir de una lista de *score differentials* (WHS).
 * Toma los últimos N registros (normalmente hasta 20), eligiendo los K más bajos
 * según la tabla oficial según cuántas tarjetas válidas haya.
 *
 * @see https://www.usga.org/content/usga/home-page/handicapping/world-handicap-system/whs-handicap-calculation.html
 */

/** Cantidad de diferenciales más bajos a promediar según nº de tarjetas en el historial (≤20 más recientes). */
export function countLowestDifferentialsToUse(scoreCount: number): number | null {
  if (scoreCount < 3) return null;
  if (scoreCount <= 5) return 1;
  if (scoreCount <= 8) return 2;
  if (scoreCount <= 11) return 3;
  if (scoreCount <= 14) return 4;
  if (scoreCount <= 16) return 5;
  if (scoreCount <= 18) return 6;
  if (scoreCount === 19) return 7;
  return 8;
}

/** Trunca el Handicap Index a una décima (WHS). */
export function truncateHandicapIndexToTenth(value: number): number {
  if (!Number.isFinite(value)) return value;
  return Math.trunc(value * 10) / 10;
}

/**
 * A partir de los diferenciales de las tarjetas ya filtradas (hasta 20, más recientes primero
 * en el orden del array no importa aquí: se ordenan por valor), devuelve el HI o null si aún no aplica.
 */
export function handicapIndexFromScoreDifferentials(differentials: number[]): number | null {
  const valid = differentials.filter((d) => Number.isFinite(d));
  const k = countLowestDifferentialsToUse(valid.length);
  if (k == null) return null;
  const sorted = [...valid].sort((a, b) => a - b);
  const take = sorted.slice(0, k);
  const avg = take.reduce((s, x) => s + x, 0) / k;
  return truncateHandicapIndexToTenth(avg);
}
