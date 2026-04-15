/**
 * Ranking individual anual según product.md
 * Puntos: 1=20, 2=10, 3=8, 4=5, 5=2, 6=1
 * Se toman las 6 mejores fechas
 * Multiplicador por torneo (1, 1.5, 2 para final)
 */

const POINTS_BY_POSITION: Record<number, number> = {
  1: 20,
  2: 10,
  3: 8,
  4: 5,
  5: 2,
  6: 1,
};

export function pointsForPosition(position: number): number {
  return POINTS_BY_POSITION[position] ?? 0;
}

export function recalculateRankingForTournament(
  tournamentId: string,
  year: number,
  multiplier: number
) {
  // Called after publishing - updates RankingEntry for affected players
  // Implementation: aggregate from all published tournaments of the year,
  // take best 6 dates per player, sum points * multiplier
  return { tournamentId, year, multiplier };
}
