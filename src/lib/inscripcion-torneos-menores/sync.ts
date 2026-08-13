import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  calendarEntryToSpanish,
  formatFechaTitle,
  getCalendarEntriesRawForAudience,
  type CalendarEntryRaw,
} from "@/lib/calendario-feg";
import { slugifyTitle } from "@/lib/slugify";
import { matchEnrollmentClub } from "@/lib/empadronamiento-menores/club-match";
import { getEnrollmentClubCodes } from "@/lib/empadronamiento-menores/persistence";
import { buildTournamentKey } from "./tournament-key";

export const SIGNUP_OPEN_DAYS_BEFORE = 14;
export const SIGNUP_CLOSE_DAYS_BEFORE = 2;

type SupabaseAdmin = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

export type YouthSignupSyncResult = {
  created: string[];
  closed: string[];
  skippedNoClub: string[];
  active: string | null;
  errors: string[];
};

function parseRawDate(raw: CalendarEntryRaw): Date {
  const year = raw.year ?? new Date().getFullYear();
  return new Date(Date.UTC(year, raw.month, raw.day, 12, 0, 0));
}

function daysUntil(date: Date, now: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((date.getTime() - now.getTime()) / msPerDay);
}

function tournamentNameFor(entry: ReturnType<typeof calendarEntryToSpanish>): string {
  return `${entry.modalidad} — ${entry.sede}`;
}

async function resolveUniqueTournamentSlug(
  supabase: SupabaseAdmin,
  base: string
): Promise<string> {
  const root = base.trim() || "torneo";
  for (let n = 0; n < 200; n++) {
    const candidate = n === 0 ? root : `${root}-${n}`;
    const { data, error } = await supabase
      .from("Tournament")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (error) throw new Error(`Slug: ${error.message}`);
    if (!data?.length) return candidate;
  }
  throw new Error("No se pudo generar un slug único");
}

async function findTournamentByName(
  supabase: SupabaseAdmin,
  name: string
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("Tournament")
    .select("id")
    .ilike("name", name.trim())
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as { id: string } | null;
}

async function upsertSignupConfig(
  supabase: SupabaseAdmin,
  entry: ReturnType<typeof calendarEntryToSpanish>,
  tournamentId: string | null
): Promise<string> {
  const tournamentKey = buildTournamentKey(entry.fecha, entry.sede, entry.modalidad);
  const now = new Date().toISOString();

  await supabase.from("YouthTournamentSignupConfig").update({ isActive: false }).eq("isActive", true);

  const { error } = await supabase.from("YouthTournamentSignupConfig").upsert(
    {
      id: crypto.randomUUID(),
      isActive: true,
      title: tournamentNameFor(entry),
      dateLabel: formatFechaTitle(entry.fecha),
      extraLine: null,
      venue: entry.sede,
      fecha: entry.fecha,
      sede: entry.sede,
      modalidad: entry.modalidad,
      tournamentKey,
      tournamentId,
      updatedAt: now,
      createdAt: now,
    },
    { onConflict: "tournamentKey" }
  );
  if (error) throw new Error(error.message);
  return tournamentKey;
}

async function closeSignupConfig(
  supabase: SupabaseAdmin,
  tournamentKey: string
): Promise<void> {
  const { error } = await supabase
    .from("YouthTournamentSignupConfig")
    .update({ isActive: false, updatedAt: new Date().toISOString() })
    .eq("tournamentKey", tournamentKey);
  if (error) throw new Error(error.message);
}

export function revalidateYouthSignupPaths() {
  revalidatePath("/torneos");
  revalidatePath("/inscripcion-torneos-menores");
  revalidatePath("/gestion/club");
  revalidatePath("/gestion/club/inscriptos");
  revalidatePath("/gestion/admin/inscripcion-torneos-menores");
}

/**
 * Sincroniza el torneo con inscripción abierta según el calendario menores:
 * - Abre 14 días antes de la fecha del torneo.
 * - Cierra 2 días antes (desactiva la config; las inscripciones quedan guardadas).
 * - Si hay un torneo a ≤14 días, lo crea/activa aunque falte menos.
 */
export async function syncYouthTournamentSignupFromCalendar(
  now: Date = new Date()
): Promise<YouthSignupSyncResult> {
  const result: YouthSignupSyncResult = {
    created: [],
    closed: [],
    skippedNoClub: [],
    active: null,
    errors: [],
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    result.errors.push("Base de datos no disponible");
    return result;
  }

  const clubs = await getEnrollmentClubCodes();
  const rawEntries = getCalendarEntriesRawForAudience("menores");
  const today = new Date(now);

  // 1) Cerrar configs activas cuyo torneo ya pasó o está dentro del cierre (2 días).
  const { data: activeConfigs, error: activeErr } = await supabase
    .from("YouthTournamentSignupConfig")
    .select("tournamentKey, fecha, sede, modalidad")
    .eq("isActive", true);

  if (activeErr) {
    result.errors.push(`Leer configs activas: ${activeErr.message}`);
    return result;
  }

  const activeKeys = new Set((activeConfigs ?? []).map((c) => c.tournamentKey as string));

  for (const raw of rawEntries) {
    const entry = calendarEntryToSpanish(raw);
    const tournamentKey = buildTournamentKey(entry.fecha, entry.sede, entry.modalidad);
    const tournamentDate = parseRawDate(raw);
    const days = daysUntil(tournamentDate, today);

    if (activeKeys.has(tournamentKey) && days < SIGNUP_CLOSE_DAYS_BEFORE) {
      try {
        await closeSignupConfig(supabase, tournamentKey);
        result.closed.push(tournamentKey);
        activeKeys.delete(tournamentKey);
      } catch (e) {
        result.errors.push(`Cerrar ${tournamentKey}: ${e instanceof Error ? e.message : e}`);
      }
    }
  }

  // 2) Abrir el próximo torneo si está dentro de la ventana de apertura.
  const upcoming = rawEntries
    .map((raw) => ({ raw, entry: calendarEntryToSpanish(raw), date: parseRawDate(raw) }))
    .filter((x) => daysUntil(x.date, today) >= 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const next = upcoming[0];
  if (!next) {
    result.active = null;
    return result;
  }

  const daysToNext = daysUntil(next.date, today);
  const tournamentKey = buildTournamentKey(next.entry.fecha, next.entry.sede, next.entry.modalidad);

  if (daysToNext > SIGNUP_OPEN_DAYS_BEFORE) {
    // Aún no corresponde abrir; dejar como está (puede haber uno manual activo).
    result.active = activeKeys.size > 0 ? [...activeKeys][0] : null;
    return result;
  }

  // Si ya está activo, no hacer nada.
  if (activeKeys.has(tournamentKey)) {
    result.active = tournamentKey;
    return result;
  }

  // Buscar o crear Tournament federativo.
  const name = tournamentNameFor(next.entry);
  let tournamentId: string | null = null;
  try {
    const existing = await findTournamentByName(supabase, name);
    if (existing) {
      tournamentId = existing.id;
    } else {
      const clubMatch = matchEnrollmentClub(next.entry.sede, clubs);
      if (!clubMatch?.id) {
        result.skippedNoClub.push(`${name} (sede: ${next.entry.sede})`);
        // Igual creamos la config sin tournamentId para no bloquear inscripciones.
      } else {
        const slug = await resolveUniqueTournamentSlug(supabase, slugifyTitle(name));
        const nowIso = new Date().toISOString();
        const { error: insErr } = await supabase.from("Tournament").insert({
          id: crypto.randomUUID(),
          name,
          slug,
          date: next.date.toISOString(),
          clubId: clubMatch.id,
          isTeamEvent: false,
          audience: "MENORES",
          multiplier: 1,
          status: "OPEN",
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        if (insErr) throw new Error(insErr.message);
        const created = await findTournamentByName(supabase, name);
        tournamentId = created?.id ?? null;
        result.created.push(name);
      }
    }
  } catch (e) {
    result.errors.push(`Tournament ${name}: ${e instanceof Error ? e.message : e}`);
  }

  try {
    await upsertSignupConfig(supabase, next.entry, tournamentId);
    result.active = tournamentKey;
  } catch (e) {
    result.errors.push(`Config ${tournamentKey}: ${e instanceof Error ? e.message : e}`);
  }

  return result;
}
