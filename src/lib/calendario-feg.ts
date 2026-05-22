/**
 * Calendario anual de torneos (data fuente única).
 * Hero del Home y la sección "Próximos torneos" lo consumen para
 * mostrar las fechas que se van actualizando con el correr del año.
 *
 * Criterio de “hoy” y comparación de fechas: siempre en Argentina (UTC−3, sin horario de verano).
 */
import type { AudienceSegment } from "@/lib/content-audience";

export const FEG_TIME_ZONE = "America/Argentina/Buenos_Aires";

export type CalendarEntry = {
  fecha: string; // Texto humano: "28 de Marzo", "25 y 26 de Julio"
  sede: string;
  modalidad: string;
  /** Año del torneo (por defecto 2026, la temporada cargada). */
  year?: number;
};

export type CalendarTableRow = CalendarEntry & {
  num: string;
};

const SEASON_YEAR = 2026;

export const CALENDARIO_FEG: CalendarEntry[] = [
  { fecha: "28 de Marzo", sede: "Villa Elisa", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "25 de Abril", sede: "Club Social La Paz", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "9 de Mayo", sede: "Los Bretes", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "15/16 de Mayo", sede: "Interfederativo (cancha a des.)", modalidad: "36H Mayores", year: SEASON_YEAR },
  { fecha: "30 de Mayo", sede: "Villa Libertador", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "13 de Junio", sede: "Las Colinas", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "4 de Julio", sede: "CUCU", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "15 de Agosto", sede: "Aero Club Villaguay", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "22 de Agosto", sede: "Concordia Golf Club", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "5 de Setiembre", sede: "Gualeguaychú", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "26 de Setiembre", sede: "Santa Elena", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "24 de Octubre", sede: "Colón Golf Club", modalidad: "18H Mayores", year: SEASON_YEAR },
  { fecha: "14 de Noviembre", sede: "CAE", modalidad: "18H Mayores", year: SEASON_YEAR },
];

/** 2° semestre FGL — Prejuveniles / Juveniles / Junior (calendario-2026-fgl-juveniles.md). */
export const CALENDARIO_FEG_MENORES: CalendarEntry[] = [
  {
    fecha: "25 y 26 de Julio",
    sede: "CUCU",
    modalidad: "36 H. Prejuveniles y Juveniles",
    year: SEASON_YEAR,
  },
  { fecha: "26 de Julio", sede: "CUCU", modalidad: "Junior", year: SEASON_YEAR },
  {
    fecha: "22 y 23 de Agosto",
    sede: "Concordia Golf Club",
    modalidad: "36 H. Prejuveniles y Juveniles",
    year: SEASON_YEAR,
  },
  { fecha: "23 de Agosto", sede: "Concordia Golf Club", modalidad: "Junior", year: SEASON_YEAR },
  {
    fecha: "27 de Setiembre",
    sede: "Club de Campo Libertador SM.",
    modalidad: "Junior",
    year: SEASON_YEAR,
  },
];

export const CALENDARIO_FEG_MAYORES_TABLE: CalendarTableRow[] = [
  { num: "1°", fecha: "28 de Marzo", sede: "Villa Elisa", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "2°", fecha: "25 de Abril", sede: "Club Social La Paz", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "3°", fecha: "9 de Mayo", sede: "Los Bretes", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "—", fecha: "15/16 de Mayo", sede: "Interfederativo (cancha a des.)", modalidad: "36H Mayores", year: SEASON_YEAR },
  { num: "4°", fecha: "30 de Mayo", sede: "Villa Libertador", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "5°", fecha: "13 de Junio", sede: "Las Colinas", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "6°", fecha: "4 de Julio", sede: "CUCU", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "7°", fecha: "15 de Agosto", sede: "Aero Club Villaguay", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "8°", fecha: "22 de Agosto", sede: "Concordia Golf Club", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "9°", fecha: "5 de Setiembre", sede: "Gualeguaychú", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "10°", fecha: "26 de Setiembre", sede: "Santa Elena", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "11°", fecha: "24 de Octubre", sede: "Colón Golf Club", modalidad: "18H Mayores", year: SEASON_YEAR },
  { num: "12°", fecha: "14 de Noviembre", sede: "CAE", modalidad: "18H Mayores", year: SEASON_YEAR },
];

export const CALENDARIO_FEG_MENORES_TABLE: CalendarTableRow[] = [
  {
    num: "3°",
    fecha: "25 y 26 de Julio",
    sede: "CUCU",
    modalidad: "36 H. Prejuveniles y Juveniles",
    year: SEASON_YEAR,
  },
  { num: "4°", fecha: "26 de Julio", sede: "CUCU", modalidad: "Junior", year: SEASON_YEAR },
  {
    num: "4°",
    fecha: "22 y 23 de Agosto",
    sede: "Concordia Golf Club",
    modalidad: "36 H. Prejuveniles y Juveniles",
    year: SEASON_YEAR,
  },
  { num: "5°", fecha: "23 de Agosto", sede: "Concordia Golf Club", modalidad: "Junior", year: SEASON_YEAR },
  {
    num: "6°",
    fecha: "27 de Setiembre",
    sede: "Club de Campo Libertador SM.",
    modalidad: "Junior",
    year: SEASON_YEAR,
  },
];

const MONTH_MAP: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  setiembre: 8,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

/** Y/M/D del torneo según el texto del calendario (mes 0–11). Usa el primer día si hay rango. */
function parseEntryYmd(entry: CalendarEntry): { y: number; m: number; d: number } {
  const parts = entry.fecha.split(" de ");
  const dayPart = parts[0]?.split("/")[0]?.trim() ?? "1";
  const firstDay = dayPart.split(/\s+y\s+/i)[0]?.trim() ?? dayPart;
  const monthStr = parts[1]?.trim().toLowerCase();
  const d = parseInt(firstDay, 10);
  const m = MONTH_MAP[monthStr ?? ""] ?? 0;
  const y = entry.year ?? SEASON_YEAR;
  return { y, m, d: Number.isFinite(d) ? d : 1 };
}

function ymdToComparable(y: number, m: number, d: number): number {
  return y * 10_000 + (m + 1) * 100 + d;
}

function getTodayYmdInFeG(now: Date): { y: number; m: number; d: number } {
  const str = new Intl.DateTimeFormat("en-CA", {
    timeZone: FEG_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [y, mo, day] = str.split("-").map((x) => parseInt(x, 10));
  return { y, m: mo - 1, d: day };
}

function parseEntryDate(entry: CalendarEntry): Date {
  const { y, m, d } = parseEntryYmd(entry);
  return new Date(Date.UTC(y, m, d, 12, 0, 0));
}

export type CalendarEntryWithDate = CalendarEntry & { _parsed: Date };

function withParsedDates(entries: CalendarEntry[]): CalendarEntryWithDate[] {
  return entries.map((entry) => ({ ...entry, _parsed: parseEntryDate(entry) }));
}

export function getCalendarTableForAudience(segment: AudienceSegment): CalendarTableRow[] {
  return segment === "menores" ? CALENDARIO_FEG_MENORES_TABLE : CALENDARIO_FEG_MAYORES_TABLE;
}

export function getCalendarEntriesForAudience(segment: AudienceSegment): CalendarEntry[] {
  return segment === "menores" ? CALENDARIO_FEG_MENORES : CALENDARIO_FEG;
}

/** Próximas fechas mezclando mayores + menores, ordenadas cronológicamente (Home). */
export function getUpcomingFegDates(count: number, now: Date = new Date()): CalendarEntryWithDate[] {
  const all = withParsedDates([...CALENDARIO_FEG, ...CALENDARIO_FEG_MENORES]);
  const today = getTodayYmdInFeG(now);
  const todayCmp = ymdToComparable(today.y, today.m, today.d);
  const upcoming = all
    .filter((e) => {
      const { y, m, d } = parseEntryYmd(e);
      return ymdToComparable(y, m, d) >= todayCmp;
    })
    .sort((a, b) => {
      const ya = parseEntryYmd(a);
      const yb = parseEntryYmd(b);
      return ymdToComparable(ya.y, ya.m, ya.d) - ymdToComparable(yb.y, yb.m, yb.d);
    })
    .slice(0, count);
  if (upcoming.length >= count) return upcoming;
  if (upcoming.length > 0) return upcoming;
  return all
    .sort((a, b) => {
      const ya = parseEntryYmd(a);
      const yb = parseEntryYmd(b);
      return ymdToComparable(ya.y, ya.m, ya.d) - ymdToComparable(yb.y, yb.m, yb.d);
    })
    .slice(0, count);
}

export function getUpcomingFegDatesForAudience(
  segment: AudienceSegment,
  count: number,
  now: Date = new Date()
): CalendarEntryWithDate[] {
  const all = withParsedDates(getCalendarEntriesForAudience(segment));
  const today = getTodayYmdInFeG(now);
  const todayCmp = ymdToComparable(today.y, today.m, today.d);
  const upcoming = all
    .filter((e) => {
      const { y, m, d } = parseEntryYmd(e);
      return ymdToComparable(y, m, d) >= todayCmp;
    })
    .slice(0, count);
  if (upcoming.length >= count) return upcoming;
  if (upcoming.length > 0) return upcoming;
  return all.slice(0, count);
}

export function getNextFegDate(now: Date = new Date()): CalendarEntryWithDate | null {
  return getUpcomingFegDates(1, now)[0] ?? null;
}

export function formatFechaTitle(fecha: string): string {
  return fecha
    .replace(/\b([a-zñáéíóú])/i, (m) => m.toUpperCase())
    .replace(/\s+de\s+([a-zñáéíóú])/i, (_, c) => ` de ${c.toUpperCase()}`);
}
