import { getSupabaseAdmin } from "@/lib/supabase";
import { formatFechaTitle } from "@/lib/calendario-feg";
import { getOpenSignupTournamentKeys } from "@/lib/inscripcion-torneos-menores/config";
import { getCalendarTournamentByKey } from "@/lib/tournament-calendar-sync";

/** Días que la card de un torneo sigue visible después de jugarse. */
export const INSCRIPTOS_CARD_DAYS_AFTER = 2;

export type InscriptosTournamentMeta = {
  tournamentKey: string;
  title: string;
  dateLabel: string;
  venue: string;
  /** Última jornada del torneo; null si no se pudo resolver la fecha real. */
  endDate: Date | null;
  isSignupOpen: boolean;
};

export type InscriptosTournamentCard<T> = InscriptosTournamentMeta & {
  rows: T[];
};

type ConfigRow = {
  tournamentKey: string;
  title: string | null;
  dateLabel: string | null;
  venue: string | null;
  fecha: string | null;
  isActive: boolean | null;
  tournamentId: string | null;
};

/** Momento a partir del cual la card deja de mostrarse. */
function cardCutoff(endDate: Date): Date {
  const cutoff = new Date(endDate);
  cutoff.setUTCDate(cutoff.getUTCDate() + INSCRIPTOS_CARD_DAYS_AFTER);
  cutoff.setUTCHours(23, 59, 59, 999);
  return cutoff;
}

/**
 * Una card se muestra hasta 2 días después del torneo. Si no se pudo resolver la
 * fecha (clave manual fuera del calendario) se mantiene visible para no ocultar datos.
 */
export function isTournamentCardVisible(
  meta: InscriptosTournamentMeta,
  now: Date = new Date()
): boolean {
  if (!meta.endDate) return true;
  return now.getTime() <= cardCutoff(meta.endDate).getTime();
}

function metaFromCalendar(tournamentKey: string): Promise<InscriptosTournamentMeta | null> {
  return getCalendarTournamentByKey(tournamentKey).then((calendar) => {
    if (!calendar) return null;
    return {
      tournamentKey,
      title: calendar.name,
      dateLabel: formatFechaTitle(calendar.fecha),
      venue: calendar.sede,
      endDate: calendar.endDate,
      isSignupOpen: false,
    };
  });
}

/**
 * Resuelve título, fecha y sede de cada torneo con inscriptos. Prioriza la config
 * guardada (puede haber sido editada a mano) y completa la fecha real con el torneo
 * federativo vinculado o, en su defecto, con el calendario.
 */
export async function resolveInscriptosTournamentMeta(
  tournamentKeys: string[]
): Promise<Map<string, InscriptosTournamentMeta>> {
  const keys = [...new Set(tournamentKeys.map((k) => k.trim()).filter(Boolean))];
  const result = new Map<string, InscriptosTournamentMeta>();
  if (keys.length === 0) return result;

  const supabase = getSupabaseAdmin();
  const configs: ConfigRow[] = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("YouthTournamentSignupConfig")
      .select("tournamentKey,title,dateLabel,venue,fecha,isActive,tournamentId")
      .in("tournamentKey", keys);

    if (error) {
      console.error("[resolveInscriptosTournamentMeta]", error.message);
    } else {
      configs.push(...((data ?? []) as ConfigRow[]));
    }
  }

  const tournamentIds = configs
    .map((c) => c.tournamentId)
    .filter((id): id is string => Boolean(id));

  const dateByTournamentId = new Map<string, Date>();
  if (supabase && tournamentIds.length > 0) {
    const { data } = await supabase
      .from("Tournament")
      .select("id,date")
      .in("id", tournamentIds);

    for (const row of data ?? []) {
      const parsed = new Date(row.date as string);
      if (!Number.isNaN(parsed.getTime())) {
        dateByTournamentId.set(row.id as string, parsed);
      }
    }
  }

  const configByKey = new Map(configs.map((c) => [c.tournamentKey, c]));

  for (const key of keys) {
    const fromCalendar = await metaFromCalendar(key);
    const config = configByKey.get(key);

    if (!config) {
      result.set(
        key,
        fromCalendar ?? {
          tournamentKey: key,
          title: key,
          dateLabel: "",
          venue: "",
          endDate: null,
          isSignupOpen: false,
        }
      );
      continue;
    }

    const linkedDate = config.tournamentId
      ? dateByTournamentId.get(config.tournamentId) ?? null
      : null;

    result.set(key, {
      tournamentKey: key,
      title: config.title?.trim() || fromCalendar?.title || key,
      dateLabel:
        formatFechaTitle(config.dateLabel?.trim() || config.fecha?.trim() || "") ||
        fromCalendar?.dateLabel ||
        "",
      venue: config.venue?.trim() || fromCalendar?.venue || "",
      endDate: fromCalendar?.endDate ?? linkedDate,
      isSignupOpen: config.isActive === true,
    });
  }

  return result;
}

/**
 * Agrupa inscriptos en una card por torneo y descarta las de torneos que ya
 * pasaron hace más de 2 días. El torneo con inscripción abierta siempre tiene
 * card, aunque todavía no tenga inscriptos.
 */
export async function groupInscriptosByTournament<T>(
  rows: T[],
  getTournamentKey: (row: T) => string,
  now: Date = new Date()
): Promise<InscriptosTournamentCard<T>[]> {
  const grouped = new Map<string, T[]>();

  for (const key of await getOpenSignupTournamentKeys()) {
    if (key?.trim()) grouped.set(key.trim(), []);
  }

  for (const row of rows) {
    const key = getTournamentKey(row).trim();
    if (!key) continue;
    const bucket = grouped.get(key);
    if (bucket) bucket.push(row);
    else grouped.set(key, [row]);
  }

  const metaByKey = await resolveInscriptosTournamentMeta([...grouped.keys()]);

  const cards: InscriptosTournamentCard<T>[] = [];
  for (const [key, groupRows] of grouped) {
    const meta = metaByKey.get(key);
    if (!meta || !isTournamentCardVisible(meta, now)) continue;
    cards.push({ ...meta, rows: groupRows });
  }

  return cards.sort((a, b) => {
    if (a.isSignupOpen !== b.isSignupOpen) return a.isSignupOpen ? -1 : 1;
    if (!a.endDate) return 1;
    if (!b.endDate) return -1;
    return a.endDate.getTime() - b.endDate.getTime();
  });
}
