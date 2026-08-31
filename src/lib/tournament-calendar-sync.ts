import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  calendarEntryToSpanish,
  formatFechaTitle,
  isActiveCalendarStatus,
  type CalendarEntry,
} from "@/lib/calendario-feg";
import { getResolvedCalendarEntries } from "@/lib/calendario-overrides";
import type { AudienceSegment } from "@/lib/content-audience";
import { slugifyTitle } from "@/lib/slugify";
import { matchEnrollmentClub } from "@/lib/empadronamiento-menores/club-match";
import {
  getEnrollmentClubCodes,
  type ClubCodeOption,
} from "@/lib/empadronamiento-menores/persistence";
import { buildTournamentKey } from "@/lib/inscripcion-torneos-menores/tournament-key";
import {
  SIGNUP_CLOSE_DAYS_BEFORE,
  SIGNUP_OPEN_DAYS_BEFORE,
  daysUntil,
  tournamentEndDate,
  tournamentStartDate,
} from "@/lib/inscripcion-torneos-menores/signup-window";

const SEGMENTS: AudienceSegment[] = ["mayores", "menores"];

const AUDIENCE_BY_SEGMENT: Record<AudienceSegment, "MAYORES" | "MENORES"> = {
  mayores: "MAYORES",
  menores: "MENORES",
};

type SupabaseAdmin = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

export type TournamentCalendarSyncResult = {
  /** Torneos federativos creados desde el calendario. */
  created: string[];
  /** Torneos cuya inscripción se cerró (2 días antes). */
  closed: string[];
  /** Fechas del calendario sin club coincidente en el padrón FEG. */
  skippedNoClub: string[];
  /** Clave del torneo menores con inscripción abierta, si hay. */
  active: string | null;
  errors: string[];
};

type CalendarSlot = {
  segment: AudienceSegment;
  entry: CalendarEntry;
  originalName: string;
  date: Date;
  daysUntil: number;
  name: string;
  tournamentKey: string;
};

function tournamentNameFor(entry: CalendarEntry): string {
  return `${entry.modalidad} — ${entry.sede}`;
}

/** Fechas del calendario de ambas audiencias, ordenadas cronológicamente. */
async function buildCalendarSlots(now: Date): Promise<CalendarSlot[]> {
  const slots: CalendarSlot[] = [];

  for (const segment of SEGMENTS) {
    const resolved = await getResolvedCalendarEntries(segment);
    for (const item of resolved) {
      if (!isActiveCalendarStatus(item.status)) continue;
      const originalEntry = calendarEntryToSpanish(item.original);
      const displayEntry = calendarEntryToSpanish(item.display);
      const date = tournamentStartDate(item.display);
      slots.push({
        segment,
        entry: displayEntry,
        originalName: tournamentNameFor(originalEntry),
        date,
        daysUntil: daysUntil(date, now),
        name: tournamentNameFor(displayEntry),
        tournamentKey: buildTournamentKey(
          originalEntry.fecha,
          originalEntry.sede,
          originalEntry.modalidad
        ),
      });
    }
  }

  return slots.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/** Torneo del calendario identificado por su clave de inscripción. */
export type CalendarTournamentInfo = {
  segment: AudienceSegment;
  tournamentKey: string;
  name: string;
  fecha: string;
  sede: string;
  modalidad: string;
  /** Primera jornada. */
  date: Date;
  /** Última jornada (igual a `date` si el torneo dura un solo día). */
  endDate: Date;
};

export async function getCalendarTournaments(): Promise<CalendarTournamentInfo[]> {
  const list: CalendarTournamentInfo[] = [];

  for (const segment of SEGMENTS) {
    const resolved = await getResolvedCalendarEntries(segment);
    for (const item of resolved) {
      const originalEntry = calendarEntryToSpanish(item.original);
      const displayEntry = calendarEntryToSpanish(item.display);
      list.push({
        segment,
        tournamentKey: buildTournamentKey(
          originalEntry.fecha,
          originalEntry.sede,
          originalEntry.modalidad
        ),
        name: tournamentNameFor(displayEntry),
        fecha: displayEntry.fecha,
        sede: displayEntry.sede,
        modalidad: displayEntry.modalidad,
        date: tournamentStartDate(item.display),
        endDate: tournamentEndDate(item.display),
      });
    }
  }

  return list.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getCalendarTournamentByKey(
  tournamentKey: string
): Promise<CalendarTournamentInfo | null> {
  const key = tournamentKey.trim().toUpperCase();
  const list = await getCalendarTournaments();
  return list.find((t) => t.tournamentKey === key) ?? null;
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

/** Busca el torneo por nombre o por club + día, para no duplicar los creados a mano. */
async function findExistingTournament(
  supabase: SupabaseAdmin,
  slot: CalendarSlot,
  clubId: string | null
): Promise<{ id: string; status: string } | null> {
  for (const name of [slot.originalName, slot.name]) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const { data: byName, error: nameErr } = await supabase
      .from("Tournament")
      .select("id, status")
      .ilike("name", trimmed)
      .limit(1)
      .maybeSingle();
    if (nameErr) throw new Error(nameErr.message);
    if (byName) return byName as { id: string; status: string };
  }

  if (!clubId) return null;

  const dayStart = new Date(slot.date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const dayEnd = new Date(slot.date);
  dayEnd.setUTCHours(23, 59, 59, 999);

  const { data: byDay, error: dayErr } = await supabase
    .from("Tournament")
    .select("id, status")
    .eq("clubId", clubId)
    .gte("date", dayStart.toISOString())
    .lte("date", dayEnd.toISOString())
    .limit(1)
    .maybeSingle();
  if (dayErr) throw new Error(dayErr.message);
  return (byDay as { id: string; status: string } | null) ?? null;
}

/** Crea el torneo federativo si aún no existe. Devuelve su id (null si no hay club). */
async function ensureTournamentRow(
  supabase: SupabaseAdmin,
  slot: CalendarSlot,
  clubs: ClubCodeOption[],
  result: TournamentCalendarSyncResult
): Promise<string | null> {
  const clubId = matchEnrollmentClub(slot.entry.sede, clubs)?.id ?? null;

  const existing = await findExistingTournament(supabase, slot, clubId);
  if (existing) return existing.id;

  if (!clubId) {
    result.skippedNoClub.push(`${slot.name} (sede: ${slot.entry.sede})`);
    return null;
  }

  const id = crypto.randomUUID();
  const slug = await resolveUniqueTournamentSlug(supabase, slugifyTitle(slot.name));
  const nowIso = new Date().toISOString();

  const { error } = await supabase.from("Tournament").insert({
    id,
    name: slot.name,
    slug,
    date: slot.date.toISOString(),
    clubId,
    isTeamEvent: false,
    audience: AUDIENCE_BY_SEGMENT[slot.segment],
    multiplier: 1,
    status: "OPEN",
    createdAt: nowIso,
    updatedAt: nowIso,
  });
  if (error) throw new Error(error.message);

  result.created.push(slot.name);
  return id;
}

/** Cierra la inscripción del torneo federativo (OPEN → IN_PROGRESS). */
async function closeTournamentSignup(
  supabase: SupabaseAdmin,
  slot: CalendarSlot,
  clubs: ClubCodeOption[]
): Promise<boolean> {
  const clubId = matchEnrollmentClub(slot.entry.sede, clubs)?.id ?? null;
  const existing = await findExistingTournament(supabase, slot, clubId);
  if (!existing || existing.status !== "OPEN") return false;

  const { error } = await supabase
    .from("Tournament")
    .update({ status: "IN_PROGRESS", updatedAt: new Date().toISOString() })
    .eq("id", existing.id);
  if (error) throw new Error(error.message);
  return true;
}

async function activateYouthSignupConfig(
  supabase: SupabaseAdmin,
  slot: CalendarSlot,
  tournamentId: string | null
): Promise<void> {
  const now = new Date().toISOString();

  await supabase
    .from("YouthTournamentSignupConfig")
    .update({ isActive: false, updatedAt: now })
    .eq("isActive", true);

  const { error } = await supabase.from("YouthTournamentSignupConfig").upsert(
    {
      id: crypto.randomUUID(),
      isActive: true,
      title: slot.name,
      dateLabel: formatFechaTitle(slot.entry.fecha),
      extraLine: null,
      venue: slot.entry.sede,
      fecha: slot.entry.fecha,
      sede: slot.entry.sede,
      modalidad: slot.entry.modalidad,
      tournamentKey: slot.tournamentKey,
      tournamentId,
      updatedAt: now,
      createdAt: now,
    },
    { onConflict: "tournamentKey" }
  );
  if (error) throw new Error(error.message);
}

async function deactivateYouthSignupConfig(
  supabase: SupabaseAdmin,
  tournamentKey: string
): Promise<void> {
  const { error } = await supabase
    .from("YouthTournamentSignupConfig")
    .update({ isActive: false, updatedAt: new Date().toISOString() })
    .eq("tournamentKey", tournamentKey);
  if (error) throw new Error(error.message);
}

export function revalidateTournamentSyncPaths() {
  revalidatePath("/torneos");
  revalidatePath("/inscripcion-torneos-menores");
  revalidatePath("/gestion/club");
  revalidatePath("/gestion/club/torneos");
  revalidatePath("/gestion/club/inscriptos");
  revalidatePath("/gestion/admin/inscriptos");
  revalidatePath("/gestion/admin/torneos/eliminar");
  revalidatePath("/gestion/admin/inscripcion-torneos-menores");
}

/**
 * Sincroniza los torneos con el calendario FEG (mayores y menores):
 * - Crea el torneo federativo 14 días antes de la fecha (incluye los que ya están
 *   a 14 días o menos al momento de correr la sincronización).
 * - 2 días antes cierra la inscripción: el torneo pasa a IN_PROGRESS y, en menores,
 *   se desactiva la config para que desaparezca de la pantalla de inscripciones.
 *
 * No borra torneos ni inscripciones: el club necesita el torneo después de la fecha
 * para cargar resultados y fotos. La eliminación sigue siendo manual desde Admin.
 */
export async function syncTournamentsFromCalendar(
  now: Date = new Date()
): Promise<TournamentCalendarSyncResult> {
  const result: TournamentCalendarSyncResult = {
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
  const slots = await buildCalendarSlots(now);

  const { data: activeConfigs, error: activeErr } = await supabase
    .from("YouthTournamentSignupConfig")
    .select("tournamentKey")
    .eq("isActive", true);

  if (activeErr) {
    result.errors.push(`Leer configs activas: ${activeErr.message}`);
    return result;
  }

  const activeKeys = new Set((activeConfigs ?? []).map((c) => c.tournamentKey as string));

  // 1) Cerrar la inscripción de los torneos que ya entraron en la ventana de cierre.
  for (const slot of slots) {
    if (slot.daysUntil >= SIGNUP_CLOSE_DAYS_BEFORE) continue;

    try {
      const wasOpen = await closeTournamentSignup(supabase, slot, clubs);
      if (wasOpen) result.closed.push(slot.name);
    } catch (e) {
      result.errors.push(`Cerrar ${slot.name}: ${e instanceof Error ? e.message : e}`);
    }

    if (slot.segment === "menores" && activeKeys.has(slot.tournamentKey)) {
      try {
        await deactivateYouthSignupConfig(supabase, slot.tournamentKey);
        activeKeys.delete(slot.tournamentKey);
        if (!result.closed.includes(slot.name)) result.closed.push(slot.name);
      } catch (e) {
        result.errors.push(
          `Cerrar inscripción ${slot.name}: ${e instanceof Error ? e.message : e}`
        );
      }
    }
  }

  // 2) Crear los torneos que están dentro de la ventana de apertura.
  const openSlots = slots.filter(
    (s) => s.daysUntil >= SIGNUP_CLOSE_DAYS_BEFORE && s.daysUntil <= SIGNUP_OPEN_DAYS_BEFORE
  );

  const tournamentIdBySlot = new Map<string, string | null>();

  for (const slot of openSlots) {
    try {
      const id = await ensureTournamentRow(supabase, slot, clubs, result);
      tournamentIdBySlot.set(slot.tournamentKey, id);
    } catch (e) {
      result.errors.push(`Crear ${slot.name}: ${e instanceof Error ? e.message : e}`);
    }
  }

  // 3) Habilitar la inscripción del próximo torneo de menores.
  const nextMenores = openSlots.find((s) => s.segment === "menores");

  if (nextMenores) {
    if (activeKeys.has(nextMenores.tournamentKey)) {
      result.active = nextMenores.tournamentKey;
    } else {
      try {
        await activateYouthSignupConfig(
          supabase,
          nextMenores,
          tournamentIdBySlot.get(nextMenores.tournamentKey) ?? null
        );
        result.active = nextMenores.tournamentKey;
      } catch (e) {
        result.errors.push(
          `Abrir inscripción ${nextMenores.name}: ${e instanceof Error ? e.message : e}`
        );
      }
    }
  } else {
    result.active = activeKeys.size > 0 ? [...activeKeys][0] : null;
  }

  return result;
}
