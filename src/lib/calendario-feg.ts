/**
 * Calendario anual de torneos (data fuente única).
 * Hero del Home y la sección "Próximos torneos" lo consumen para
 * mostrar las fechas que se van actualizando con el correr del año.
 *
 * Criterio de “hoy” y comparación de fechas: siempre en Argentina (UTC−3, sin horario de verano).
 */
import type { AppLocale } from "@/i18n/routing";
import type { AudienceSegment } from "@/lib/content-audience";

export const FEG_TIME_ZONE = "America/Argentina/Buenos_Aires";

export type CalendarModalityKey =
  | "mayores18h"
  | "mayores36h"
  | "prejuveniles36h"
  | "junior";

export type CalendarVenueKey = "interfederativo";

export type CalendarEntryRaw = {
  month: number;
  day: number;
  dayEnd?: number;
  /** Separador entre días en rangos (p. ej. 15/16 de Mayo). */
  rangeStyle?: "and" | "slash";
  sede: string;
  venueKey?: CalendarVenueKey;
  modalityKey: CalendarModalityKey;
  year?: number;
};

export type CalendarTableRowRaw = CalendarEntryRaw & {
  num: string;
};

/** Entrada localizada para UI (fecha y modalidad traducidas). */
export type CalendarEntry = {
  fecha: string;
  sede: string;
  modalidad: string;
  year?: number;
};

export type CalendarTableRow = CalendarEntry & {
  num: string;
};

export type CalendarLabels = {
  modality: (key: CalendarModalityKey) => string;
  venue: (raw: CalendarEntryRaw) => string;
};

const SEASON_YEAR = 2026;

const LOCALE_TAG: Record<AppLocale, string> = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
};

const CALENDARIO_RAW_MAYORES: CalendarEntryRaw[] = [
  { month: 2, day: 28, sede: "Villa Elisa", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 3, day: 25, sede: "Club Social La Paz", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 4, day: 9, sede: "Los Bretes", modalityKey: "mayores18h", year: SEASON_YEAR },
  {
    month: 4,
    day: 15,
    dayEnd: 16,
    rangeStyle: "slash",
    sede: "Interfederativo (cancha a des.)",
    venueKey: "interfederativo",
    modalityKey: "mayores36h",
    year: SEASON_YEAR,
  },
  { month: 4, day: 30, sede: "Villa Libertador", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 5, day: 13, sede: "Las Colinas", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 6, day: 4, sede: "CUCU", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 7, day: 15, sede: "Aero Club Villaguay", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 7, day: 22, sede: "Concordia Golf Club", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 8, day: 5, sede: "Gualeguaychú", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 8, day: 26, sede: "Santa Elena", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 9, day: 24, sede: "Colón Golf Club", modalityKey: "mayores18h", year: SEASON_YEAR },
  { month: 10, day: 14, sede: "CAE", modalityKey: "mayores18h", year: SEASON_YEAR },
];

/** 2° semestre FGL — Prejuveniles / Juveniles / Junior. */
const CALENDARIO_RAW_MENORES: CalendarEntryRaw[] = [
  {
    month: 6,
    day: 25,
    dayEnd: 26,
    sede: "CUCU",
    modalityKey: "prejuveniles36h",
    year: SEASON_YEAR,
  },
  { month: 6, day: 26, sede: "CUCU", modalityKey: "junior", year: SEASON_YEAR },
  {
    month: 7,
    day: 22,
    dayEnd: 23,
    sede: "Concordia Golf Club",
    modalityKey: "prejuveniles36h",
    year: SEASON_YEAR,
  },
  { month: 7, day: 23, sede: "Concordia Golf Club", modalityKey: "junior", year: SEASON_YEAR },
  {
    month: 8,
    day: 27,
    sede: "Club de Campo Libertador SM.",
    modalityKey: "junior",
    year: SEASON_YEAR,
  },
];

const CALENDARIO_RAW_MAYORES_TABLE: CalendarTableRowRaw[] = [
  { num: "1°", month: 2, day: 28, sede: "Villa Elisa", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "2°", month: 3, day: 25, sede: "Club Social La Paz", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "3°", month: 4, day: 9, sede: "Los Bretes", modalityKey: "mayores18h", year: SEASON_YEAR },
  {
    num: "—",
    month: 4,
    day: 15,
    dayEnd: 16,
    rangeStyle: "slash",
    sede: "Interfederativo (cancha a des.)",
    venueKey: "interfederativo",
    modalityKey: "mayores36h",
    year: SEASON_YEAR,
  },
  { num: "4°", month: 4, day: 30, sede: "Villa Libertador", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "5°", month: 5, day: 13, sede: "Las Colinas", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "6°", month: 6, day: 4, sede: "CUCU", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "7°", month: 7, day: 15, sede: "Aero Club Villaguay", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "8°", month: 7, day: 22, sede: "Concordia Golf Club", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "9°", month: 8, day: 5, sede: "Gualeguaychú", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "10°", month: 8, day: 26, sede: "Santa Elena", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "11°", month: 9, day: 24, sede: "Colón Golf Club", modalityKey: "mayores18h", year: SEASON_YEAR },
  { num: "12°", month: 10, day: 14, sede: "CAE", modalityKey: "mayores18h", year: SEASON_YEAR },
];

const CALENDARIO_RAW_MENORES_TABLE: CalendarTableRowRaw[] = [
  {
    num: "3°",
    month: 6,
    day: 25,
    dayEnd: 26,
    sede: "CUCU",
    modalityKey: "prejuveniles36h",
    year: SEASON_YEAR,
  },
  { num: "4°", month: 6, day: 26, sede: "CUCU", modalityKey: "junior", year: SEASON_YEAR },
  {
    num: "4°",
    month: 7,
    day: 22,
    dayEnd: 23,
    sede: "Concordia Golf Club",
    modalityKey: "prejuveniles36h",
    year: SEASON_YEAR,
  },
  { num: "5°", month: 7, day: 23, sede: "Concordia Golf Club", modalityKey: "junior", year: SEASON_YEAR },
  {
    num: "6°",
    month: 8,
    day: 27,
    sede: "Club de Campo Libertador SM.",
    modalityKey: "junior",
    year: SEASON_YEAR,
  },
];

function monthName(raw: CalendarEntryRaw, locale: AppLocale): string {
  const tag = LOCALE_TAG[locale];
  const year = raw.year ?? SEASON_YEAR;
  return new Intl.DateTimeFormat(tag, { month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, raw.month, 1))
  );
}

export function formatCalendarDate(raw: CalendarEntryRaw, locale: AppLocale): string {
  const tag = LOCALE_TAG[locale];
  const year = raw.year ?? SEASON_YEAR;
  const month = monthName(raw, locale);

  if (raw.dayEnd != null && raw.dayEnd !== raw.day) {
    if (raw.rangeStyle === "slash") {
      if (locale === "es") return `${raw.day}/${raw.dayEnd} de ${month}`;
      if (locale === "pt") return `${raw.day}/${raw.dayEnd} de ${month}`;
      return `${raw.day}/${raw.dayEnd} ${month}`;
    }
    if (locale === "es") return `${raw.day} y ${raw.dayEnd} de ${month}`;
    if (locale === "pt") return `${raw.day} e ${raw.dayEnd} de ${month}`;
    return `${raw.day} and ${raw.dayEnd} ${month}`;
  }

  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, raw.month, raw.day))
  );
}

/** Texto canónico en español (claves de torneo, DB, etc.). */
export function formatCalendarDateEs(raw: CalendarEntryRaw): string {
  return formatCalendarDate(raw, "es");
}

export function createCalendarLabels(t: (key: string) => string): CalendarLabels {
  return {
    modality: (key) => t(`modalities.${key}`),
    venue: (raw) => (raw.venueKey ? t(`venues.${raw.venueKey}`) : raw.sede),
  };
}

export function localizeCalendarEntry(
  raw: CalendarEntryRaw,
  locale: AppLocale,
  labels: CalendarLabels
): CalendarEntry {
  return {
    fecha: formatCalendarDate(raw, locale),
    sede: labels.venue(raw),
    modalidad: labels.modality(raw.modalityKey),
    year: raw.year,
  };
}

export function localizeCalendarTableRow(
  raw: CalendarTableRowRaw,
  locale: AppLocale,
  labels: CalendarLabels
): CalendarTableRow {
  return {
    num: raw.num,
    ...localizeCalendarEntry(raw, locale, labels),
  };
}

function parseRawYmd(raw: CalendarEntryRaw): { y: number; m: number; d: number } {
  const y = raw.year ?? SEASON_YEAR;
  return { y, m: raw.month, d: raw.day };
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

function parseRawDate(raw: CalendarEntryRaw): Date {
  const { y, m, d } = parseRawYmd(raw);
  return new Date(Date.UTC(y, m, d, 12, 0, 0));
}

export type CalendarEntryWithDate = CalendarEntry & {
  _parsed: Date;
  _raw: CalendarEntryRaw;
};

function withParsedDates(
  entries: CalendarEntryRaw[],
  locale: AppLocale,
  labels: CalendarLabels
): CalendarEntryWithDate[] {
  return entries.map((raw) => ({
    ...localizeCalendarEntry(raw, locale, labels),
    _parsed: parseRawDate(raw),
    _raw: raw,
  }));
}

export function getCalendarTableRawForAudience(segment: AudienceSegment): CalendarTableRowRaw[] {
  return segment === "menores" ? CALENDARIO_RAW_MENORES_TABLE : CALENDARIO_RAW_MAYORES_TABLE;
}

export function getCalendarTableForAudience(
  segment: AudienceSegment,
  locale: AppLocale,
  labels: CalendarLabels
): CalendarTableRow[] {
  return getCalendarTableRawForAudience(segment).map((row) =>
    localizeCalendarTableRow(row, locale, labels)
  );
}

export function getCalendarEntriesRawForAudience(segment: AudienceSegment): CalendarEntryRaw[] {
  return segment === "menores" ? CALENDARIO_RAW_MENORES : CALENDARIO_RAW_MAYORES;
}

export function getCalendarEntriesForAudience(
  segment: AudienceSegment,
  locale: AppLocale,
  labels: CalendarLabels
): CalendarEntry[] {
  return getCalendarEntriesRawForAudience(segment).map((raw) =>
    localizeCalendarEntry(raw, locale, labels)
  );
}

/** Próximas fechas mezclando mayores + menores, ordenadas cronológicamente (Home). */
export function getUpcomingFegDates(
  count: number,
  locale: AppLocale,
  labels: CalendarLabels,
  now: Date = new Date()
): CalendarEntryWithDate[] {
  const all = withParsedDates(
    [...CALENDARIO_RAW_MAYORES, ...CALENDARIO_RAW_MENORES],
    locale,
    labels
  );
  const today = getTodayYmdInFeG(now);
  const todayCmp = ymdToComparable(today.y, today.m, today.d);
  const upcoming = all
    .filter((e) => {
      const { y, m, d } = parseRawYmd(e._raw);
      return ymdToComparable(y, m, d) >= todayCmp;
    })
    .sort((a, b) => {
      const ya = parseRawYmd(a._raw);
      const yb = parseRawYmd(b._raw);
      return ymdToComparable(ya.y, ya.m, ya.d) - ymdToComparable(yb.y, yb.m, yb.d);
    })
    .slice(0, count);
  if (upcoming.length >= count) return upcoming;
  if (upcoming.length > 0) return upcoming;
  return all
    .sort((a, b) => {
      const ya = parseRawYmd(a._raw);
      const yb = parseRawYmd(b._raw);
      return ymdToComparable(ya.y, ya.m, ya.d) - ymdToComparable(yb.y, yb.m, yb.d);
    })
    .slice(0, count);
}

export function getUpcomingFegDatesForAudience(
  segment: AudienceSegment,
  count: number,
  locale: AppLocale,
  labels: CalendarLabels,
  now: Date = new Date()
): CalendarEntryWithDate[] {
  const all = withParsedDates(getCalendarEntriesRawForAudience(segment), locale, labels);
  const today = getTodayYmdInFeG(now);
  const todayCmp = ymdToComparable(today.y, today.m, today.d);
  const upcoming = all
    .filter((e) => {
      const { y, m, d } = parseRawYmd(e._raw);
      return ymdToComparable(y, m, d) >= todayCmp;
    })
    .slice(0, count);
  if (upcoming.length >= count) return upcoming;
  if (upcoming.length > 0) return upcoming;
  return all.slice(0, count);
}

export function getNextFegDate(
  locale: AppLocale,
  labels: CalendarLabels,
  now: Date = new Date()
): CalendarEntryWithDate | null {
  return getUpcomingFegDates(1, locale, labels, now)[0] ?? null;
}

/** @deprecated Usar formatCalendarDate con locale. Mantiene compatibilidad con textos ES en DB. */
export function formatFechaTitle(fecha: string): string {
  return fecha
    .replace(/\b([a-zñáéíóú])/i, (m) => m.toUpperCase())
    .replace(/\s+de\s+([a-zñáéíóú])/i, (_, c) => ` de ${c.toUpperCase()}`);
}

const SPANISH_MODALITY: Record<CalendarModalityKey, string> = {
  mayores18h: "18H Mayores",
  mayores36h: "36H Mayores",
  prejuveniles36h: "36 H. Prejuveniles y Juveniles",
  junior: "Junior",
};

/** Etiquetas canónicas en español (gestión, claves de torneo, DB). */
export function getSpanishCalendarLabels(): CalendarLabels {
  return {
    modality: (key) => SPANISH_MODALITY[key],
    venue: (entry) =>
      entry.venueKey === "interfederativo"
        ? "Interfederativo (cancha a des.)"
        : entry.sede,
  };
}

/** Entrada canónica en español (p. ej. claves de inscripción). */
export function calendarEntryToSpanish(raw: CalendarEntryRaw): CalendarEntry {
  return localizeCalendarEntry(raw, "es", getSpanishCalendarLabels());
}
