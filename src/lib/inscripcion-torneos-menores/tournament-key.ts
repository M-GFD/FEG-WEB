export function buildTournamentKey(fecha: string, sede: string, modalidad: string): string {
  return [fecha.trim(), sede.trim(), modalidad.trim()].join("|").toUpperCase();
}
