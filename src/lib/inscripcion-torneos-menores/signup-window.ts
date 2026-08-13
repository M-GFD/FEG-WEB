import {
  calendarEntryToSpanish,
  getCalendarEntriesRawForAudience,
  type CalendarEntryRaw,
} from "@/lib/calendario-feg";
import { buildTournamentKey } from "./tournament-key";

/** La inscripción se habilita 14 días antes del torneo. */
export const SIGNUP_OPEN_DAYS_BEFORE = 14;
/** La inscripción se cierra 2 días antes del torneo. */
export const SIGNUP_CLOSE_DAYS_BEFORE = 2;

/** Primera jornada del torneo. */
export function tournamentStartDate(raw: CalendarEntryRaw): Date {
  const year = raw.year ?? new Date().getFullYear();
  return new Date(Date.UTC(year, raw.month, raw.day, 12, 0, 0));
}

/** Última jornada: en rangos como "25 y 26 de julio" el torneo termina el 26. */
export function tournamentEndDate(raw: CalendarEntryRaw): Date {
  const year = raw.year ?? new Date().getFullYear();
  return new Date(Date.UTC(year, raw.month, raw.dayEnd ?? raw.day, 12, 0, 0));
}

export function daysUntil(date: Date, now: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((date.getTime() - now.getTime()) / msPerDay);
}

export function isWithinSignupWindow(raw: CalendarEntryRaw, now: Date): boolean {
  const days = daysUntil(tournamentStartDate(raw), now);
  return days >= SIGNUP_CLOSE_DAYS_BEFORE && days <= SIGNUP_OPEN_DAYS_BEFORE;
}

export function tournamentKeyFromCalendarEntry(raw: CalendarEntryRaw): string {
  const entry = calendarEntryToSpanish(raw);
  return buildTournamentKey(entry.fecha, entry.sede, entry.modalidad);
}

/**
 * Fecha de menores que hoy debería tener la inscripción abierta según el calendario.
 * Se usa como respaldo cuando la sincronización todavía no creó la config en la base.
 */
export function getMenoresSignupWindowEntry(
  now: Date = new Date()
): CalendarEntryRaw | null {
  return (
    getCalendarEntriesRawForAudience("menores")
      .filter((raw) => isWithinSignupWindow(raw, now))
      .sort(
        (a, b) => tournamentStartDate(a).getTime() - tournamentStartDate(b).getTime()
      )[0] ?? null
  );
}
