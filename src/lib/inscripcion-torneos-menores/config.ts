import { getSupabaseAdmin } from "@/lib/supabase";
import { calendarEntryToSpanish, formatFechaTitle } from "@/lib/calendario-feg";
import type { ResolvedCalendarEntry } from "@/lib/calendario-overrides";
import { getMenoresSignupWindowEntry, tournamentKeyFromResolved } from "./signup-window";

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

function configFromResolved(
  entry: ResolvedCalendarEntry
): Omit<YouthTournamentSignupConfigPublic, "id"> {
  const display = calendarEntryToSpanish(entry.display);
  return {
    tournamentKey: tournamentKeyFromResolved(entry),
    title: display.modalidad,
    dateLabel: formatFechaTitle(display.fecha),
    extraLine: null,
    venue: display.sede,
    fecha: display.fecha,
    sede: display.sede,
    modalidad: display.modalidad,
  };
}

async function getActiveConfigKeysFromDb(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("YouthTournamentSignupConfig")
    .select("tournamentKey")
    .eq("isActive", true);

  if (error) {
    console.error("[getActiveConfigKeysFromDb]", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.tournamentKey as string);
}

/**
 * Claves de los torneos con inscripción abierta. Si la sincronización todavía no
 * corrió, cae al calendario pero solo dentro de la ventana de inscripción, para no
 * mostrar como abierto un torneo que ya cerró o que todavía falta mucho.
 */
export async function getOpenSignupTournamentKeys(): Promise<string[]> {
  const fromDb = await getActiveConfigKeysFromDb();
  if (fromDb.length > 0) return fromDb;

  const windowEntry = await getMenoresSignupWindowEntry();
  return windowEntry ? [tournamentKeyFromResolved(windowEntry)] : [];
}

/** Torneo con inscripciones abiertas; null si no hay ninguno en ventana. */
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

  const windowEntry = await getMenoresSignupWindowEntry();
  if (!windowEntry) return null;
  return { id: "calendar-fallback", ...configFromResolved(windowEntry) };
}
