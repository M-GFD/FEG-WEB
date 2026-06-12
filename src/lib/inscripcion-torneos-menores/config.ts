import { getSupabaseAdmin } from "@/lib/supabase";
import {
  calendarEntryToSpanish,
  formatFechaTitle,
  getSpanishCalendarLabels,
  getUpcomingFegDatesForAudience,
  type CalendarEntryRaw,
} from "@/lib/calendario-feg";
import { buildTournamentKey } from "./tournament-key";

export type YouthTournamentSignupConfigPublic = {
  id: string;
  tournamentKey: string;
  title: string;
  dateLabel: string;
  extraLine: string | null;
  venue: string;
  fecha: string;
  sede: string;
  modalidad: string;
};

function configFromCalendarEntry(raw: CalendarEntryRaw): Omit<YouthTournamentSignupConfigPublic, "id"> {
  const entry = calendarEntryToSpanish(raw);
  const tournamentKey = buildTournamentKey(entry.fecha, entry.sede, entry.modalidad);
  return {
    tournamentKey,
    title: entry.modalidad,
    dateLabel: formatFechaTitle(entry.fecha),
    extraLine: null,
    venue: entry.sede,
    fecha: entry.fecha,
    sede: entry.sede,
    modalidad: entry.modalidad,
  };
}

/** Torneo activo para inscripciones; si no hay fila activa, usa el próximo del calendario menores. */
export async function getActiveYouthTournamentConfig(): Promise<YouthTournamentSignupConfigPublic | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("YouthTournamentSignupConfig")
      .select("id,tournamentKey,title,dateLabel,extraLine,venue,fecha,sede,modalidad")
      .eq("isActive", true)
      .order("updatedAt", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return data as YouthTournamentSignupConfigPublic;
    }
  }

  const next = getUpcomingFegDatesForAudience("menores", 1, "es", getSpanishCalendarLabels())[0];
  if (!next) return null;
  const base = configFromCalendarEntry(next._raw);
  return { id: "calendar-fallback", ...base };
}
