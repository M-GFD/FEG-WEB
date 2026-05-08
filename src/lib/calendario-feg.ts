/**
 * Calendario anual de torneos (data fuente única).
 * Hero del Home y la sección "Próximos torneos" lo consumen para
 * mostrar las fechas que se van actualizando con el correr del año.
 *
 * La “fecha de hoy” para comparar eventos usa siempre GMT−3 (Argentina, sin DST).
 */

export type CalendarEntry = {
  fecha: string;       // Texto humano (mes en Title Case): "28 de Marzo", "15/16 de Mayo"
  sede: string;
  modalidad: string;
  /** Año del torneo (por defecto 2026, la temporada cargada). */
  year?: number;
};

const SEASON_YEAR = 2026;

/** Zona horaria fija UTC−3 para FEG (Entre Ríos / Argentina). */
export const FEG_TIMEZONE = "America/Argentina/Buenos_Aires";

export const CALENDARIO_FEG: CalendarEntry[] = [
  { fecha: "28 de Marzo",     sede: "Villa Elisa",                     modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "25 de Abril",     sede: "Club Social La Paz",              modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "9 de Mayo",       sede: "Los Bretes",                      modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "15/16 de Mayo",   sede: "Interfederativo (cancha a des.)", modalidad: "36H Mayores", year: SEASON_YEAR },
  { fecha: "30 de Mayo",      sede: "Villa Libertador",                modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "13 de Junio",     sede: "Las Colinas",                     modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "4 de Julio",      sede: "CUCU",                            modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "15 de Agosto",    sede: "Aero Club Villaguay",             modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "22 de Agosto",    sede: "Concordia Golf Club",             modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "5 de Setiembre",  sede: "Gualeguaychú",                    modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "26 de Setiembre", sede: "Santa Elena",                     modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "24 de Octubre",   sede: "Colón Golf Club",                 modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "14 de Noviembre", sede: "CAE",                             modalidad: "18H Mayores", year: SEASON_YEAR },
];

const MONTH_MAP: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, setiembre: 8, septiembre: 8, octubre: 9,
  noviembre: 10, diciembre: 11,
};

/**
 * Parsea la fecha textual ("28 de marzo", "15/16 de mayo") al primer día
 * del rango como Date. Considera el `year` indicado (default temporada).
 */
function parseEntryDate(entry: CalendarEntry): Date {
  const parts = entry.fecha.split(" de ");
  const dayStr = parts[0]?.split("/")[0]?.trim();
  const monthStr = parts[1]?.trim().toLowerCase();
  const day = parseInt(dayStr ?? "1", 10);
  const month = MONTH_MAP[monthStr ?? ""] ?? 0;
  return new Date(entry.year ?? SEASON_YEAR, month, Number.isFinite(day) ? day : 1);
}

/** `YYYY-MM-DD` del reloj “actual” en zona FEG (GMT−3). */
function getTodayYmdFeg(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FEG_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const mo = parts.find((p) => p.type === "month")?.value ?? "01";
  const da = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${mo}-${da}`;
}

/** Primer día del torneo en `YYYY-MM-DD` para ordenar frente a “hoy” FEG. */
function entryFirstDayYmd(entry: CalendarEntry): string {
  const parts = entry.fecha.split(" de ");
  const dayPart = parts[0]?.trim() ?? "1";
  const dayStr = dayPart.split("/")[0]?.trim() ?? "1";
  const monthStr = parts[1]?.trim().toLowerCase() ?? "enero";
  const day = parseInt(dayStr, 10);
  const monthIndex = MONTH_MAP[monthStr] ?? 0;
  const year = entry.year ?? SEASON_YEAR;
  const month = monthIndex + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(Number.isFinite(day) ? day : 1).padStart(2, "0")}`;
}

export type CalendarEntryWithDate = CalendarEntry & { _parsed: Date };

function withParsedDates(): CalendarEntryWithDate[] {
  return CALENDARIO_FEG.map((entry) => ({ ...entry, _parsed: parseEntryDate(entry) }));
}

/**
 * Devuelve las próximas `count` fechas (>= hoy en GMT−3 / FEG).
 * Si ya pasaron todas las del año, devuelve las primeras del calendario
 * (fallback: arrancan los próximos en el siguiente arranque de temporada).
 */
export function getUpcomingFegDates(count: number, now: Date = new Date()): CalendarEntryWithDate[] {
  const all = withParsedDates();
  const todayYmd = getTodayYmdFeg(now);
  const upcoming = all.filter((e) => entryFirstDayYmd(e) >= todayYmd).slice(0, count);
  if (upcoming.length >= count) return upcoming;
  if (upcoming.length > 0) return upcoming;
  return all.slice(0, count);
}

/** Próximo torneo (uno solo). */
export function getNextFegDate(now: Date = new Date()): CalendarEntryWithDate | null {
  return getUpcomingFegDates(1, now)[0] ?? null;
}

/** "9 de mayo" → "9 de Mayo". */
export function formatFechaTitle(fecha: string): string {
  return fecha.replace(/\b([a-zñáéíóú])/i, (m) => m.toUpperCase()).replace(/\s+de\s+([a-zñáéíóú])/i, (_, c) => ` de ${c.toUpperCase()}`);
}
